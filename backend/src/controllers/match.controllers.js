import matchService from "../services/match.service.js";
import tournamentService from "../services/tournament.service.js";

async function generateMatches(req, res) {
    try {
        const { dateId } = req.params;
        const matches = await matchService.generateMatchesForDate(dateId);
        res.status(201).json(matches);
    } catch (error) {
        if (error.message === 'Date not found') {
            res.status(404).json({ message: 'Date not found' });
        } else if (error.message === 'Not enough players to create matches') {
            res.status(400).json({ message: 'Not enough players to create matches' });
        } else {
            console.error('Error generating matches:', error);
            res.status(500).json({ message: 'Error generating matches' });
        }
    }
}

async function deleteMatch(req, res) {
    try {
        const { matchId } = req.params;
        await matchService.deleteMatch(matchId);
        res.json({ message: 'Match deleted successfully' });
    } catch (error) {
        console.error('Error deleting match:', error);
        res.status(500).json({ message: 'Error deleting match' });
    }
}

async function getMatches(req, res) {
    try{
        const matches = await matchService.getMatches();
        res.json(matches);
    } catch (error) {
        console.error('Error finding match:', error);
        res.status(500).json({ message: 'Error finding matches' });
    }
}

async function getMatchesById(req, res) {
    try{
        const { dateId } = req.params;
        const matches = await matchService.getMatchesById(dateId);
        res.json(matches);
    } catch (error) {
        console.error('Error finding matches', error);
        res.status(500).json({message: 'Error finding matches'});
    }
}

async function getMatch(req, res){
    try{
        const { matchId } = req.params;
        const match = await matchService.getMatch(matchId);
        res.json(match);
    }catch (error) {
        console.error('Error finding matches', error);
        res.status(500).json({message: 'Error finding match'});
    }
}

async function submitScore(req, res){
    try{
        const { matchId } = req.params;
        const { player1_score, player2_score } = req.body;

        console.log(`[submitScore] matchId=${matchId} player1_score=${player1_score} player2_score=${player2_score}`);

        if (player1_score == null || player2_score == null || player1_score < 0 || player2_score < 0) {
            return res.status(400).json({ message: 'Scores must be non-negative numbers' });
        }

        const players = await matchService.getPlayersFromMatch(matchId);
        console.log(`[submitScore] players fetched from DB:`, players);

        if (players.length !== 2){
            return res.status(400).json({message: 'Match must have 2 players'});
        }

        const [p1, p2] = players;
        console.log(`[submitScore] assigning — p1.user_id=${p1.user_id} → score=${player1_score} | p2.user_id=${p2.user_id} → score=${player2_score}`);

        const existing = await matchService.getScoreFromMatch(matchId);

        if (existing.length > 0){
            return res.status(400).json({message: 'Match already scored'});
        }

        try{
            await matchService.insertScoresToMatch(matchId, p1.user_id, player1_score, p2.user_id, player2_score);
            console.log(`[submitScore] inserted scores successfully`);
            // Fire-and-forget: advance elimination bracket if this was an elim match
            tournamentService.handleElimProgression(Number(matchId)).catch(err =>
                console.error('[submitScore] elim progression error:', err)
            );
            res.status(201).json({
                results: [
                    { user_id: p1.user_id, score: player1_score },
                    { user_id: p2.user_id, score: player2_score }
                ]
            })
        } catch (error) {
            res.status(500).json({message: 'Error saving scores'})
        }
    } catch (error) {
        res.status(500).json({error: error.message})
    }
}

const matchController = {
    generateMatches,
    deleteMatch,
    getMatches,
    getMatch,
    getMatchesById,
    submitScore
};

export default matchController;