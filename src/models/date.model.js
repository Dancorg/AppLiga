import {pool} from '../config/db.js';

async function createDate(leagueId, date_number, date_date) {
    console.log('Creating date with leagueId:', leagueId, 'date_number:', date_number, 'date_date:', date_date);
    const [result] = await pool.query('INSERT INTO dates (league_id, date_number, date_date) VALUES (?, ?, ?)', 
        [leagueId, date_number, date_date]);
    console.log(result.insertId);
    return result.insertId;
}

async function findDateById(dateId) {
    const [rows] = await pool.query('SELECT * FROM dates WHERE date_id = ?', [dateId]);
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
    findDatesByLeagueId,
    findDates,
    deleteDateById
};

export default dateModel;