import {pool} from '../config/db.js';

async function createMatch(dateId) {
    const [result] = await pool.query('INSERT INTO matches (date_id) VALUES (?)', [dateId]);
    return result.insertId;
}

async function addPlayerToMatch(matchId, playerId) {
    await pool.query('INSERT INTO matchplayers (match_id, user_id) VALUES (?, ?)', [matchId, playerId]);
}

async function getMatchesByDateId(dateId) {
    const rows = await pool.query('SELECT * FROM matches WHERE date_id = ?', [dateId]);
    return rows;
}

async function deleteMatchById(matchId) {
    const [result] = await pool.query('DELETE FROM matches WHERE match_id = ?', [matchId]);
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
    const [players] = await pool.query('SELECT user_id FROM matchplayers WHERE match_id = ?', [matchId]);
    console.log("ModelPlayers: ", players);
    return players;
}

async function getScore(matchId) {
    const [score] = await pool.query('SELECT * FROM scores WHERE match_id = ?', [matchId]);
    return score;
}

async function insertScores(matchId, p1_id, p1Score, p2_id, p2Score) {
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
    deleteMatchById,
    removePlayerFromMatch,
    getMatches,
    getMatch,
    getPlayers,
    getScore,
    insertScores
};

export default matchModel;