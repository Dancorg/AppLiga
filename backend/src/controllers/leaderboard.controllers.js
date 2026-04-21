import leaderboardService from '../services/leaderboard.services.js';

async function getLeaderboard(req, res) {
  try {
    const { leagueId } = req.params;

    const leaderboard = await leaderboardService.getLeaderboard(leagueId);

    res.json(leaderboard);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

const leaderBoardController = {
    getLeaderboard
}

export default leaderBoardController;