import * as dateService from '../services/date.services.js';
import userModel from '../models/user.model.js';
import ParticipationModel from '../models/participation.model.js';
import enrollmentModel from '../models/enrollment.model.js';
import dateModel from '../models/date.model.js';

export const getDates = async (req, res) => {
    try {
        const dates = await dateService.getDates();
        res.json(dates);
    } catch (error) {
        console.error('Error fetching dates:', error);
        res.status(500).json({ message: 'Error fetching dates' });
    }
}

export const getDate = async (req, res) => {
    try {
        const { dateId } = req.params;
        const date = await dateService.getDate(dateId);
        res.json(date);
    } catch (error) {
        console.error('Error fetching date:', error);
        res.status(500).json({ message: 'Error fetching date' });
    }
}

export const joinDate = async (req, res) => {
    try{
        const userId = req.user.userId;
        const { dateId } = req.params;

        const joinDate = await dateService.dateParticipation(userId, dateId);
        res.status(201).json({message: 'Joined date successfully'});
    } catch (error) {
        console.error('Error joining date:', error);
        res.status(500).json({message: 'Error joining date'});
    }
}

export const enrollUserToDate = async (req, res) => {
    try {
        const { dateId } = req.params;
        const { username } = req.body;

        const user = await userModel.findUserByUsername(username);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const date = await dateModel.findDateById(dateId);
        if (!date) return res.status(404).json({ message: 'Date not found' });

        const players = await enrollmentModel.getPlayersByLeagueId(date.league_id);
        if (!players.some(p => p.user_id === user.user_id)) {
            return res.status(400).json({ message: 'User is not enrolled in this league' });
        }

        const existing = await ParticipationModel.getPlayersByDate(dateId);
        if (existing.some(p => p.user_id === user.user_id)) {
            return res.status(400).json({ message: 'User already joined this date' });
        }

        await ParticipationModel.joinDate(user.user_id, dateId);
        res.json({ message: `${username} added to date successfully` });
    } catch (error) {
        console.error('Error enrolling user to date:', error);
        res.status(500).json({ message: 'Error enrolling user to date' });
    }
};

export const getParticipants = async (req, res) => {
    try {
        const { dateId } = req.params;
        const participants = await dateService.getParticipants(dateId);
        res.json(participants);
    } catch (error) {
        console.error('Error retrieving participants:', error);
        res.status(500).json({message:'Error retrieving participants'});
    }
}