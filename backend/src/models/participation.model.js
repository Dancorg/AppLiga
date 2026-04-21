import {pool} from '../config/db.js';

async function getPlayersByDate(dateId) {
    const [rows] = await pool.query(
        'SELECT user_id FROM participations WHERE date_id = ?',
        [dateId]
    );
    return rows;
}

async function joinDate(userId, dateId) {
    const [result] = await pool.query(
        'INSERT INTO participations (user_id, date_id) VALUES (?, ?)', 
        [userId,dateId]
    );
    return result;
}

const ParticipationModel = {
    getPlayersByDate,
    joinDate
};

export default ParticipationModel;