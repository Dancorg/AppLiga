import tournamentService from '../services/tournament.service.js';

export const createTournament = async (req, res) => {
    try {
        const { name, ...rules } = req.body;
        if (!name) return res.status(400).json({ message: 'Tournament name is required' });
        const tournament = await tournamentService.createTournament(name, rules);
        res.status(201).json(tournament);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const getTournaments = async (_req, res) => {
    try {
        const tournaments = await tournamentService.getTournaments();
        res.json(tournaments);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const getTournamentDetails = async (req, res) => {
    try {
        const { tourneyId } = req.params;
        const details = await tournamentService.getTournamentDetails(Number(tourneyId));
        res.json(details);
    } catch (err) {
        res.status(err.message === 'Tournament not found' ? 404 : 500).json({ message: err.message });
    }
};

export const deleteTournament = async (req, res) => {
    try {
        const { tourneyId } = req.params;
        await tournamentService.deleteTournament(Number(tourneyId));
        res.json({ message: 'Tournament deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const joinTournament = async (req, res) => {
    try {
        const { tourneyId } = req.params;
        await tournamentService.joinTournament(Number(tourneyId), req.user.userId);
        res.json({ message: 'Joined tournament successfully' });
    } catch (err) {
        const status = err.message.includes('not found') ? 404
            : err.message.includes('not open') || err.message.includes('Already') ? 400
            : 500;
        res.status(status).json({ message: err.message });
    }
};

export const enrollUserByUsername = async (req, res) => {
    try {
        const { tourneyId } = req.params;
        const { username } = req.body;
        if (!username) return res.status(400).json({ message: 'Username is required' });
        const user = await tournamentService.enrollUserByUsername(Number(tourneyId), username);
        res.json({ message: `${user.name} enrolled successfully` });
    } catch (err) {
        const status = err.message.includes('not found') ? 404
            : err.message.includes('not open') || err.message.includes('already') ? 400
            : 500;
        res.status(status).json({ message: err.message });
    }
};

export const startTournament = async (req, res) => {
    try {
        const { tourneyId } = req.params;
        const result = await tournamentService.startTournament(Number(tourneyId));
        res.json(result);
    } catch (err) {
        const status = err.message.includes('not found') ? 404
            : err.message.includes('not open') || err.message.includes('enough') ? 400
            : 500;
        res.status(status).json({ message: err.message });
    }
};

export const advanceToElimination = async (req, res) => {
    try {
        const { tourneyId } = req.params;
        const result = await tournamentService.advanceToElimination(Number(tourneyId));
        res.json(result);
    } catch (err) {
        const status = err.message.includes('not found') ? 404
            : err.message.includes('not active') || err.message.includes('unscored') ? 400
            : 500;
        res.status(status).json({ message: err.message });
    }
};
