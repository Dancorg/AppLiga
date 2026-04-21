import * as dateService from '../services/date.services.js';

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
        res.status(201).json(joinDate);
    } catch (error) {
        console.error('Error joining date:', error);
        res.status(500).json({message: 'Error joining date'});
    }
}

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