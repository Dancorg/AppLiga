import {pool} from '../config/db.js';

async function getLeaderboardByLeagueId(leagueId) { 
    const [rows] = await pool.query(`
        SELECT u.user_id, u.name,
            COUNT(DISTINCT mp.match_id) AS matches_played,
            COALESCE(SUM(
                CASE
                WHEN l.scoring_mode = 'difference' THEN GREATEST(0, s.score - opponent.score)
                ELSE s.score
                END
            ), 0) AS total_points,
            SUM(
                CASE
                WHEN s.score > opponent.score THEN 1
                WHEN s.score - opponent.score THEN 0.5
                ELSE 0
                END
            ) AS points,
            SUM(CASE
            WHEN s.score > opponent.score THEN 1
            ELSE 0
            END) AS wins,
            SUM(CASE
            WHEN s.score < opponent.score THEN 1
            ELSE 0
            END) AS losses
        FROM sc_users u
        JOIN matchplayers mp ON u.user_id = mp.user_id
        JOIN matches m ON mp.match_id = m.id
        JOIN dates d ON m.date_id = d.date_id
        JOIN leagues l ON l.league_id = d.league_id
        LEFT JOIN scores s ON s.user_id = u.user_id AND s.match_id = m.id
        LEFT JOIN scores opponent ON opponent.match_id = m.id AND opponent.user_id != u.user_id
        WHERE d.league_id = ?
        GROUP BY u.user_id
        ORDER BY points DESC, wins DESC, total_points DESC
    `, [leagueId]); 
    return rows;
}

const leaderboardModel = {
    getLeaderboardByLeagueId
};

export default leaderboardModel;