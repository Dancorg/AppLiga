import {pool} from '../config/db.js';

async function getPlayersByLeagueId(leagueId) {
    const [rows] = await pool.query('SELECT user_id FROM enrollments WHERE league_id = ?', [leagueId]);
    console.log('Players enrolled in league', leagueId, ':', rows);
    return rows;
}

const enrollmentModel = {
    getPlayersByLeagueId
};

export default enrollmentModel;