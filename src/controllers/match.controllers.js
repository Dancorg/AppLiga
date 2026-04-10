import matchService from "../services/match.service.js";

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
        const { player1_hits, player2_hits } = req.body;

        // validate input
        if (
            player1_hits < 0 || player1_hits > 5 ||
            player2_hits < 0 || player2_hits > 5
        ) {
            return res.status(400).json({message: 'Invalid hits'});
        }
        
        const players = await matchService.getPlayersFromMatch(matchId); 

        if (players.length !== 2){
            return res.status(400).json({message: 'Match must have 2 players'});
        }

        const[p1,p2] = players;

        const existing = await matchService.getScoreFromMatch(matchId);

        if (existing.length > 0){
            return res.status(400).json({message: 'Match already scored'});
        }

        const p1Score = 5 - player1_hits; // replace 5 with league-level variable
        const p2Score = 5 - player2_hits;

        try{
            await matchService.insertScoresToMatch(matchId, p1.user_id, p1Score, p2.user_id, p2Score);
            res.status(201).json({
                results: [
                    { user_id: p1.user_id, score: p1Score},
                    { user_id: p2.user_id, score: p2Score}
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
    submitScore
};

export default matchController;