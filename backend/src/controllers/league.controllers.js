import * as leagueService from '../services/league.services.js';
import * as dateService from '../services/date.services.js';

export const createLeague = async (req, res) => {
    try {
        const {name} = req.body;
        const league = await leagueService.createLeague(name);
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
        await dateService.deleteDate(req, res);
        res.json({message: 'Date deleted successfully'});
    } catch (error) {
        console.error('Error deleting date from league:', error);
        res.status(500).json({ message: 'Error deleting date from league' });
    }
};

export const createDateForLeagueController = async (req, res) => {
    try {
        const {leagueId} = req.params;
        const {date_number, date_date} = req.body;
        console.log('Creating date for league with request body:', req.body);
        const newDate = await dateService.createDateForLeague(leagueId, date_number, date_date);
        res.status(201).json({date_id:newDate});
    } catch (error) {
        console.error('Error creating date for league:', error);
        res.status(500).json({ message: 'Error creating date for league' });
    }
}

export const getLeagues = async (req, res) => {
    try {
        const leagues = await leagueService.getLeagues();
        res.json(leagues);
    } catch (error) {
        console.error('Error fetching leagues:', error);
        res.status(500).json({ message: 'Error fetching leagues' });
    }
}

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