import { pool } from '../config/db.js';

// this needs to be refactored, move db operations to a model file, and then call those from a controller file

export const createLeague = async (name) => {
    const conn = await pool.getConnection();

    try {
        await conn.beginTransaction();
        console.log('Creating league with name:', name);
        if (!name) {
            throw new Error('Name is required');
        }

        const [leagueResult] = await conn.query(
            'INSERT INTO leagues (name) VALUES (?)',
            [name]
        );

        const leagueId = leagueResult.insertId;

        await conn.commit();

        return { id: leagueId, name };
    } catch (error) {
        await conn.rollback();
        throw error;
    }finally {
        conn.release();
    }
};

export async function joinLeague(req, res) { 
    try {
        const userId = req.user.userId;
        console.log('User ID from token:', userId, 'Comes from: ', req.user);
        const { leagueId } = req.params;

        const [league] = await pool.query('SELECT * FROM leagues WHERE league_id = ?', [leagueId]);
        
        if (!league) {
            return res.status(404).json({ message: 'League not found' });
        }

        const [existing] = await pool.query('SELECT * FROM enrollments WHERE user_id = ? AND league_id = ?', [userId, leagueId]);
        if (existing.length > 0) {
            return res.status(400).json({ message: 'User already enrolled in this league' });
        }
        console.log('Enrolling user', userId, 'in league', leagueId);

        await pool.query('INSERT INTO enrollments (user_id, league_id) VALUES (?, ?)', [userId, leagueId]);
        
        res.json({ message: 'Joined league successfully' });
    } catch (error) {
        console.error('Error joining league:', error);
        res.status(500).json({ message: 'Error joining league' });
    }
};

export const deleteLeague = async (leagueId, res) => {
    const conn = await pool.getConnection();

    try {
        await conn.beginTransaction();

        console.log('Deleting league with ID:', leagueId);

        await conn.query('DELETE FROM enrollments WHERE league_id = ?', [leagueId]);
        await conn.query('DELETE FROM dates WHERE league_id = ?', [leagueId]);
        await conn.query('DELETE FROM leagues WHERE league_id = ?', [leagueId]);

        await conn.commit();

        //res.status(200).json({ message: 'League deleted successfully' });
    } catch (error) {
        await conn.rollback();
        throw error;
    } finally {
        conn.release();
    }
}

export const getLeagues = async () => {
    console.log('Fetching leagues from database');
    const conn = await pool.getConnection();
    

    try {
        const [leagues] = await conn.query('SELECT * FROM leagues');
        console.log('Leagues fetched:', leagues);
        return leagues;
    } catch (error) {
        console.error('Error fetching leagues:', error);
        throw error;
    } finally {
        conn.release();
    }
}

export const getDates = async (leagueId) => {
    console.log('Fetching dates from database for league:', leagueId);
    const conn = await pool.getConnection();

    try{
        const [dates] = await conn.query('SELECT * FROM dates WHERE league_id = ?', leagueId);
        console.log('Dates fetched:', dates);
        return dates;
    }catch(error){
        console.error('Error fetching dates:', error);
        throw error;
    }finally{
        conn.release();
    }
}