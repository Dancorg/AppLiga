import DateModel from '../models/date.model.js';
import EnrollmentModel from '../models/enrollment.model.js';
import MatchModel from '../models/match.model.js';

async function generateMatchesForDate(dateId) {
    const date = await DateModel.findDateById(dateId);
    if (!date) {
        throw new Error('Date not found');
    }

    const players = await EnrollmentModel.getPlayersByLeagueId(date.league_id);
    console.log('Players enrolled in league', date.league_id, ':', players);
    if (players.length < 2) {
        throw new Error('Not enough players to create matches');
    }

    // Create matches for the date using round-robin pairing
    const matches = [];
    for (let i = 0; i < players.length; i++) {
        for (let j = i + 1; j < players.length; j++) {
            const matchId = await MatchModel.createMatch(dateId);
            await MatchModel.addPlayerToMatch(matchId, players[i].user_id);
            await MatchModel.addPlayerToMatch(matchId, players[j].user_id);
            matches.push({ matchId, player1: players[i].user_id, player2: players[j].user_id });
        }
    }
    console.log('Matches created: ', matches);

    return matches; // it's gonna be fun to test this 
}

async function deleteMatchForDate(matchId) {
    await MatchModel.deleteMatchById(matchId);
}

async function getMatches(){
    try{
        const matches = await MatchModel.getMatches();
        console.log('matches service: ', matches);
        return matches;
    }catch (error) {
        throw new Error('Error finding matches', error);
    }
}

async function getMatch(matchId){
    try{
        const match = await MatchModel.getMatch(matchId);
        console.log("Match service: ", match);
        return match;
    }catch (error) {
        throw new Error('Error finding match', error);
    }
}

async function getPlayersFromMatch(matchId){
    try{
        const players = await MatchModel.getPlayers(matchId);
        console.log("Service Players: ", players);
        return players;
    }catch (error) {
        console.log(error);
        throw new Error('Error finding players from match', error);
    }
}

async function getScoreFromMatch(matchId){
    try{
        const score = await MatchModel.getScore(matchId);
        return score;
    }catch (error){
        throw new Error('Error finding score for match', error);
    }
}

async function insertScoresToMatch(matchId, p1_id, p1Score, p2_id, p2Score){
    try{
        await MatchModel.insertScores(matchId, p1_id, p1Score, p2_id, p2Score);
    }catch (error){
        throw new Error('Error inserting scores for match', error);
    }
}

const matchService = {
    generateMatchesForDate,
    deleteMatchForDate,
    getMatches,
    getMatch,
    getPlayersFromMatch,
    getScoreFromMatch,
    insertScoresToMatch
};

export default matchService;