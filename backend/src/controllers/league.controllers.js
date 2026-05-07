import * as leagueService from '../services/league.services.js';
import * as dateService from '../services/date.services.js';
import userModel from '../models/user.model.js';
import { pool } from '../config/db.js';

export const createLeague = async (req, res) => {
    try {
        const { name, hit_head, hit_torso, hit_arm, hit_legs, scoring_mode } = req.body;
        const league = await leagueService.createLeague(name, { hit_head, hit_torso, hit_arm, hit_legs, scoring_mode });
        res.status(201).json(league);
    } catch (error) {
        console.error('Error creating league:', error);
        res.status(500).json({ message: 'Error creating league' });
    }
};

export const deleteLeague = async (req, res) => {
    try {
        const { leagueId } = req.params;
        await leagueService.deleteLeague(leagueId, res);
        res.json({ message: 'League deleted successfully' });
    } catch (error) {
        console.error('Error deleting league:', error);
        res.status(500).json({ message: 'Error deleting league' });
    }
}

export const joinDate = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { dateId } = req.params;

        const result = await leagueService.joinDate(userId, dateId);
        if (result.error) {
            return res.status(result.status).json({ message: result.message });
        }

        res.json({ message: 'Joined date successfully' });
    } catch (error) {
        console.error('Error joining date:', error);
        res.status(500).json({ message: 'Error joining date' });
    }
}

export const deleteDateFromLeague = async (req, res) => {
    try {
        const { dateId } = req.params;
        await dateService.deleteDate(dateId);
        res.json({message: 'Date deleted successfully'});
    } catch (error) {
        console.error('Error deleting date from league:', error);
        res.status(500).json({ message: 'Error deleting date from league' });
    }
};

export const createDateForLeagueController = async (req, res) => {
    try {
        const {leagueId} = req.params;
        const { date_date } = req.body;
        const newDate = await dateService.createDateForLeague(leagueId, date_date);
        res.status(201).json(newDate);
    } catch (error) {
        if (error.message === 'A date with this date already exists for this league') {
            return res.status(409).json({ message: error.message });
        }
        console.error('Error creating date for league:', error);
        res.status(500).json({ message: 'Error creating date for league' });
    }
}

export const getLeagueById = async (req, res) => {
    try {
        const { leagueId } = req.params;
        const [rows] = await pool.query('SELECT * FROM leagues WHERE league_id = ?', [leagueId]);
        if (!rows[0]) return res.status(404).json({ message: 'League not found' });
        res.json(rows[0]);
    } catch (error) {
        console.error('Error fetching league:', error);
        res.status(500).json({ message: 'Error fetching league' });
    }
};

export const getLeagues = async (_req, res) => {
    try {
        const leagues = await leagueService.getLeagues();
        res.json(leagues);
    } catch (error) {
        console.error('Error fetching leagues:', error);
        res.status(500).json({ message: 'Error fetching leagues' });
    }
}

export const enrollUserByUsername = async (req, res) => {
    try {
        const { leagueId } = req.params;
        const { username } = req.body;

        const user = await userModel.findUserByUsername(username);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const [existing] = await pool.query(
            'SELECT * FROM enrollments WHERE user_id = ? AND league_id = ?',
            [user.user_id, leagueId]
        );
        if (existing.length > 0) return res.status(400).json({ message: 'User already enrolled' });

        await pool.query('INSERT INTO enrollments (user_id, league_id) VALUES (?, ?)', [user.user_id, leagueId]);
        res.json({ message: `${username} enrolled successfully` });
    } catch (error) {
        console.error('Error enrolling user:', error);
        res.status(500).json({ message: 'Error enrolling user' });
    }
};

export const getLeagueDates = async (req, res) => {
    try {
        const {leagueId} = req.params;
        const dates = await leagueService.getDates(leagueId);
        res.json(dates);
    } catch (error) {
        console.error('Error fetching dates:', error);
        res.status(500).json({message: 'Error fetching dates'});
    }
}