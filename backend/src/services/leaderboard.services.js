import leaderboardModel from "../models/leaderboard.model.js";

async function getLeaderboard(leagueId) {
  const leaderboard = await leaderboardModel.getLeaderboardByLeagueId(leagueId);

  // Add ranking position
  return leaderboard.map((player, index) => ({
    position: index + 1,
    ...player
  }));
}

const leaderboardServices = {
    getLeaderboard
}

export default leaderboardServices;