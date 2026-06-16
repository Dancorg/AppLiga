import {pool} from '../config/db.js';

async function createMatch(dateId) {
    const [result] = await pool.query('INSERT INTO matches (date_id) VALUES (?)', [dateId]);
    return result.insertId;
}

async function addPlayerToMatch(matchId, playerId) {
    await pool.query('INSERT INTO matchplayers (match_id, user_id) VALUES (?, ?)', [matchId, playerId]);
}

async function getMatchesByDateId(dateId) {
    const [rows] = await pool.query('SELECT * FROM matches WHERE date_id = ?', [dateId]);
    return rows;
}

async function getMatchesByDateIdWithPlayers(dateId) {
    const [rows] = await pool.query(
        `SELECT m.id AS id,
                mp1.user_id AS player1Id, u1.name AS player1Name,
                mp2.user_id AS player2Id, u2.name AS player2Name,
                s1.score AS score1, s2.score AS score2
         FROM matches m
         JOIN matchplayers mp1 ON mp1.match_id = m.id
         JOIN matchplayers mp2 ON mp2.match_id = m.id AND mp2.user_id > mp1.user_id
         JOIN sc_users u1 ON u1.user_id = mp1.user_id
         JOIN sc_users u2 ON u2.user_id = mp2.user_id
         LEFT JOIN scores s1 ON s1.match_id = m.id AND s1.user_id = mp1.user_id
         LEFT JOIN scores s2 ON s2.match_id = m.id AND s2.user_id = mp2.user_id
         WHERE m.date_id = ?`,
        [dateId]
    );
    return rows;
}

async function deleteMatchById(matchId) {
    const [result] = await pool.query('DELETE FROM matches WHERE id = ?', [matchId]);
    return result.affectedRows > 0;
}

async function removePlayerFromMatch(matchId, playerId) {
    await pool.query('DELETE FROM matchplayers WHERE match_id = ? AND user_id = ?', [matchId, playerId]);
}

async function getMatches(){
    const [matches] = await pool.query('SELECT * FROM matches');
    return matches;
}

async function getMatch(matchId) {
    const [match] = await pool.query('SELECT * FROM matches WHERE match_id = ?', [matchId]);
    return match;
}

async function getPlayers(matchId) {
    const [players] = await pool.query('SELECT user_id FROM matchplayers WHERE match_id = ? ORDER BY user_id ASC', [matchId]);
    console.log(`[getPlayers] matchId=${matchId} → raw DB rows:`, players);
    return players;
}

async function getScore(matchId) {
    const [score] = await pool.query('SELECT * FROM scores WHERE match_id = ?', [matchId]);
    return score;
}

async function getMatchContext(matchId) {
    const [rows] = await pool.query(
        `SELECT COALESCE(l.allow_ties, t_pool.allow_ties, t_elim.allow_ties, 1) AS allow_ties
         FROM matches m
         LEFT JOIN dates d ON d.date_id = m.date_id
         LEFT JOIN leagues l ON l.league_id = d.league_id
         LEFT JOIN tournament_pools tp ON tp.pool_id = m.pool_id
         LEFT JOIN tournaments t_pool ON t_pool.tourney_id = tp.tourney_id
         LEFT JOIN elim_slots es ON es.slot_id = m.elim_slot_id
         LEFT JOIN elim_rounds er ON er.round_id = es.round_id
         LEFT JOIN tournaments t_elim ON t_elim.tourney_id = er.tourney_id
         WHERE m.id = ?`,
        [matchId]
    );
    return rows[0];
}

async function insertScores(matchId, p1_id, p1Score, p2_id, p2Score) {
    console.log(`[insertScores] INSERT — (user_id=${p1_id}, match_id=${matchId}, score=${p1Score}), (user_id=${p2_id}, match_id=${matchId}, score=${p2Score})`);
    await pool.query('INSERT INTO scores (user_id, match_id, score) VALUES (?,?,?),(?,?,?)',
        [
            p1_id, matchId, p1Score,
            p2_id, matchId, p2Score
        ]
    );
}

const matchModel = {
    createMatch,
    addPlayerToMatch,
    getMatchesByDateId,
    getMatchesByDateIdWithPlayers,
    deleteMatchById,
    removePlayerFromMatch,
    getMatches,
    getMatch,
    getPlayers,
    getScore,
    getMatchContext,
    insertScores
};

export default matchModel;
