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