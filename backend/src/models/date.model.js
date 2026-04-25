import {pool} from '../config/db.js';

async function createDate(leagueId, date_date) {
    const [result] = await pool.query('INSERT INTO dates (league_id, date_date) VALUES (?, ?)', [leagueId, date_date]);
    return result.insertId;
}

async function findDateByLeagueAndDate(leagueId, date_date) {
    const [rows] = await pool.query('SELECT * FROM dates WHERE league_id = ? AND date_date = ?', [leagueId, date_date]);
    return rows[0];
}

async function findDateById(dateId) {
    const [rows] = await pool.query('SELECT * FROM dates WHERE date_id = ?', [dateId]);
    return rows[0];
}

async function getLeagueOfDate(dateId) {
    const [rows] = await pool.query('SELECT league_id FROM dates WHERE date_id = ?', [dateId]);
    return rows[0];
}

async function findDatesByLeagueId(leagueId) {
    const [rows] = await pool.query('SELECT * FROM dates WHERE league_id = ?', [leagueId]);
    return rows;
}

async function findDates() {
    const [rows] = await pool.query('SELECT * FROM dates');
    console.log('Found dates:', rows);
    return rows;
}

async function deleteDateById(dateId) {
    const [result] = await pool.query('DELETE FROM dates WHERE date_id = ?', [dateId]);
    return result.affectedRows > 0;
}

const dateModel = {
    createDate,
    findDateById,
    findDateByLeagueAndDate,
    getLeagueOfDate,
    findDatesByLeagueId,
    findDates,
    deleteDateById
};

export default dateModel;