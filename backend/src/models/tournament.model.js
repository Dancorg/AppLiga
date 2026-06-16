import { pool } from '../config/db.js';

// ── Tournament ──────────────────────────────────────────────────────────────

async function createTournament(name, { hit_head, hit_torso, hit_arm, hit_legs, scoring_mode, players_advance, allow_ties = true }) {
    const [result] = await pool.query(
        `INSERT INTO tournaments (name, hit_head, hit_torso, hit_arm, hit_legs, scoring_mode, players_advance, allow_ties, status)
         VALUES (?,?,?,?,?,?,?,?,'open')`,
        [name, hit_head, hit_torso, hit_arm, hit_legs, scoring_mode, players_advance, allow_ties]
    );
    return { tourney_id: result.insertId, name, hit_head, hit_torso, hit_arm, hit_legs, scoring_mode, players_advance, allow_ties, status: 'open' };
}

async function getTournaments() {
    const [rows] = await pool.query('SELECT * FROM tournaments');
    return rows;
}

async function getTournamentById(tourneyId) {
    const [rows] = await pool.query('SELECT * FROM tournaments WHERE tourney_id = ?', [tourneyId]);
    return rows[0];
}

async function deleteTournament(tourneyId) {
    // Pool match cleanup
    await pool.query('DELETE s FROM scores s JOIN matches m ON m.id = s.match_id JOIN tournament_pools tp ON tp.pool_id = m.pool_id WHERE tp.tourney_id = ?', [tourneyId]);
    await pool.query('DELETE mp FROM matchplayers mp JOIN matches m ON m.id = mp.match_id JOIN tournament_pools tp ON tp.pool_id = m.pool_id WHERE tp.tourney_id = ?', [tourneyId]);
    await pool.query('DELETE m FROM matches m JOIN tournament_pools tp ON tp.pool_id = m.pool_id WHERE tp.tourney_id = ?', [tourneyId]);
    await pool.query('DELETE pm FROM pool_members pm JOIN tournament_pools tp ON tp.pool_id = pm.pool_id WHERE tp.tourney_id = ?', [tourneyId]);
    await pool.query('DELETE FROM tournament_pools WHERE tourney_id = ?', [tourneyId]);
    // Elim match cleanup
    await pool.query('DELETE s FROM scores s JOIN matches m ON m.id = s.match_id JOIN elim_slots es ON es.slot_id = m.elim_slot_id JOIN elim_rounds er ON er.round_id = es.round_id WHERE er.tourney_id = ?', [tourneyId]);
    await pool.query('DELETE mp FROM matchplayers mp JOIN matches m ON m.id = mp.match_id JOIN elim_slots es ON es.slot_id = m.elim_slot_id JOIN elim_rounds er ON er.round_id = es.round_id WHERE er.tourney_id = ?', [tourneyId]);
    await pool.query('DELETE m FROM matches m JOIN elim_slots es ON es.slot_id = m.elim_slot_id JOIN elim_rounds er ON er.round_id = es.round_id WHERE er.tourney_id = ?', [tourneyId]);
    await pool.query('UPDATE elim_slots es JOIN elim_rounds er ON er.round_id = es.round_id SET es.advances_to_slot_id = NULL WHERE er.tourney_id = ?', [tourneyId]);
    await pool.query('DELETE es FROM elim_slots es JOIN elim_rounds er ON er.round_id = es.round_id WHERE er.tourney_id = ?', [tourneyId]);
    await pool.query('DELETE FROM elim_rounds WHERE tourney_id = ?', [tourneyId]);
    await pool.query('DELETE FROM tournament_enrollments WHERE tourney_id = ?', [tourneyId]);
    await pool.query('DELETE FROM tournaments WHERE tourney_id = ?', [tourneyId]);
}

async function updateTournamentStatus(tourneyId, status) {
    await pool.query('UPDATE tournaments SET status = ? WHERE tourney_id = ?', [status, tourneyId]);
}

// ── Enrollment ───────────────────────────────────────────────────────────────

async function enrollUser(tourneyId, userId) {
    await pool.query('INSERT INTO tournament_enrollments (tourney_id, user_id) VALUES (?,?)', [tourneyId, userId]);
}

async function isEnrolled(tourneyId, userId) {
    const [rows] = await pool.query(
        'SELECT 1 FROM tournament_enrollments WHERE tourney_id = ? AND user_id = ?',
        [tourneyId, userId]
    );
    return rows.length > 0;
}

async function getEnrolledPlayers(tourneyId) {
    const [rows] = await pool.query(
        `SELECT u.user_id, u.name
         FROM tournament_enrollments te
         JOIN sc_users u ON u.user_id = te.user_id
         WHERE te.tourney_id = ?`,
        [tourneyId]
    );
    return rows;
}

// ── Pools ────────────────────────────────────────────────────────────────────

async function createPool(tourneyId, poolNumber) {
    const [result] = await pool.query(
        'INSERT INTO tournament_pools (tourney_id, pool_number) VALUES (?,?)',
        [tourneyId, poolNumber]
    );
    return result.insertId;
}

async function addPoolMember(poolId, userId) {
    await pool.query('INSERT INTO pool_members (pool_id, user_id) VALUES (?,?)', [poolId, userId]);
}

async function getPools(tourneyId) {
    const [rows] = await pool.query('SELECT * FROM tournament_pools WHERE tourney_id = ?', [tourneyId]);
    return rows;
}

async function getPoolMembers(poolId) {
    const [rows] = await pool.query(
        `SELECT u.user_id, u.name
         FROM pool_members pm
         JOIN sc_users u ON u.user_id = pm.user_id
         WHERE pm.pool_id = ?`,
        [poolId]
    );
    return rows;
}

async function setMatchPoolId(matchId, poolId) {
    await pool.query('UPDATE matches SET pool_id = ? WHERE id = ?', [poolId, matchId]);
}

async function getPoolMatchesWithPlayers(poolId) {
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
         WHERE m.pool_id = ?`,
        [poolId]
    );
    return rows;
}

async function getPoolLeaderboard(poolId) {
    const [rows] = await pool.query(`
        SELECT u.user_id, u.name,
            COUNT(DISTINCT mp.match_id) AS matches_played,
            COALESCE(SUM(
                CASE
                WHEN t.scoring_mode = 'difference' THEN GREATEST(0, s.score - opponent.score)
                ELSE s.score
                END
            ), 0) AS total_points,
            SUM(CASE WHEN s.score > opponent.score THEN 1
                     WHEN s.score = opponent.score THEN 0.5
                     ELSE 0 END) AS points,
            SUM(CASE WHEN s.score > opponent.score THEN 1 ELSE 0 END) AS wins,
            SUM(CASE WHEN s.score < opponent.score THEN 1 ELSE 0 END) AS losses
        FROM sc_users u
        JOIN pool_members pm ON pm.user_id = u.user_id AND pm.pool_id = ?
        JOIN matchplayers mp ON mp.user_id = u.user_id
        JOIN matches m ON m.id = mp.match_id AND m.pool_id = ?
        JOIN tournament_pools tp ON tp.pool_id = ?
        JOIN tournaments t ON t.tourney_id = tp.tourney_id
        LEFT JOIN scores s ON s.user_id = u.user_id AND s.match_id = m.id
        LEFT JOIN scores opponent ON opponent.match_id = m.id AND opponent.user_id != u.user_id
        GROUP BY u.user_id
        ORDER BY points DESC, wins DESC, total_points DESC
    `, [poolId, poolId, poolId]);
    return rows;
}

// ── Elimination ───────────────────────────────────────────────────────────────

async function createElimRound(tourneyId, roundNumber, roundName) {
    const [result] = await pool.query(
        'INSERT INTO elim_rounds (tourney_id, round_number, round_name) VALUES (?,?,?)',
        [tourneyId, roundNumber, roundName]
    );
    return result.insertId;
}

async function createElimSlot(roundId, slotNumber, advancesToSlotId) {
    const [result] = await pool.query(
        'INSERT INTO elim_slots (round_id, slot_number, advances_to_slot_id) VALUES (?,?,?)',
        [roundId, slotNumber, advancesToSlotId ?? null]
    );
    return result.insertId;
}

async function getElimRounds(tourneyId) {
    const [rows] = await pool.query(
        'SELECT * FROM elim_rounds WHERE tourney_id = ? ORDER BY round_number DESC',
        [tourneyId]
    );
    return rows;
}

async function getSlotsByRound(roundId) {
    const [rows] = await pool.query(
        'SELECT * FROM elim_slots WHERE round_id = ? ORDER BY slot_number',
        [roundId]
    );
    return rows;
}

async function getElimSlot(slotId) {
    const [rows] = await pool.query('SELECT * FROM elim_slots WHERE slot_id = ?', [slotId]);
    return rows[0];
}

async function getSlotsAdvancingTo(nextSlotId) {
    const [rows] = await pool.query(
        'SELECT * FROM elim_slots WHERE advances_to_slot_id = ?',
        [nextSlotId]
    );
    return rows;
}

async function updateElimSlotPlayers(slotId, player1Id, player2Id) {
    await pool.query(
        'UPDATE elim_slots SET player1_id = ?, player2_id = ? WHERE slot_id = ?',
        [player1Id, player2Id, slotId]
    );
}

async function setElimSlotWinner(slotId, winnerId) {
    await pool.query('UPDATE elim_slots SET winner_id = ? WHERE slot_id = ?', [winnerId, slotId]);
}

async function setMatchElimSlotId(matchId, slotId) {
    await pool.query('UPDATE matches SET elim_slot_id = ? WHERE id = ?', [slotId, matchId]);
}

async function getElimMatchWithPlayers(slotId) {
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
         WHERE m.elim_slot_id = ?`,
        [slotId]
    );
    return rows[0] ?? null;
}

async function getTournamentBySlotId(slotId) {
    const [rows] = await pool.query(
        `SELECT t.* FROM tournaments t
         JOIN elim_rounds er ON er.tourney_id = t.tourney_id
         JOIN elim_slots es ON es.round_id = er.round_id
         WHERE es.slot_id = ?`,
        [slotId]
    );
    return rows[0];
}

const tournamentModel = {
    createTournament,
    getTournaments,
    getTournamentById,
    deleteTournament,
    updateTournamentStatus,
    enrollUser,
    isEnrolled,
    getEnrolledPlayers,
    createPool,
    addPoolMember,
    getPools,
    getPoolMembers,
    setMatchPoolId,
    getPoolMatchesWithPlayers,
    getPoolLeaderboard,
    createElimRound,
    createElimSlot,
    getElimRounds,
    getSlotsByRound,
    getElimSlot,
    getSlotsAdvancingTo,
    updateElimSlotPlayers,
    setElimSlotWinner,
    setMatchElimSlotId,
    getElimMatchWithPlayers,
    getTournamentBySlotId,
};

export default tournamentModel;
