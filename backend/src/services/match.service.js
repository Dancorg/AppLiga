import DateModel from '../models/date.model.js';
import MatchModel from '../models/match.model.js';
import ParticipationModel from "../models/participation.model.js"

async function generateMatchesForDate(dateId) {
    const date = await DateModel.findDateById(dateId);
    if (!date) {
        throw new Error('Date not found');
    }

    const players = await ParticipationModel.getPlayersByDate(date.date_id);
    console.log('Players enrolled in league', date.league_id, ':', players);
    if (players.length < 2) {
        throw new Error('Not enough players to create matches');
    }

    const existing = await MatchModel.getMatchesByDateIdWithPlayers(dateId);
    const existingPairs = new Set(
        existing.map(m => [m.player1Id, m.player2Id].sort((a, b) => a - b).join('-'))
    );

    const matches = [];
    for (let i = 0; i < players.length; i++) {
        for (let j = i + 1; j < players.length; j++) {
            const pair = [players[i].user_id, players[j].user_id].sort((a, b) => a - b).join('-');
            if (existingPairs.has(pair)) continue;
            const matchId = await MatchModel.createMatch(dateId);
            await MatchModel.addPlayerToMatch(matchId, players[i].user_id);
            await MatchModel.addPlayerToMatch(matchId, players[j].user_id);
            const [p1, p2] = [players[i].user_id, players[j].user_id].sort((a, b) => a - b);
            matches.push({ matchId, player1: p1, player2: p2 });
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
        return matches;
    }catch (error) {
        throw new Error('Error finding matches', error);
    }
}

async function getMatchesById(dateId){
    try{
        const matches = await MatchModel.getMatchesByDateIdWithPlayers(dateId);
        return matches;
    } catch (error){
        throw new Error('Error finding matches', error);
    }
}

async function getMatch(matchId){
    try{
        const match = await MatchModel.getMatch(matchId);
        return match;
    }catch (error) {
        throw new Error('Error finding match', error);
    }
}

async function getPlayersFromMatch(matchId){
    try{
        const players = await MatchModel.getPlayers(matchId);
        console.log(`[getPlayersFromMatch] matchId=${matchId} → players:`, players);
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
        console.log(`[insertScoresToMatch] matchId=${matchId} | p1_id=${p1_id} score=${p1Score} | p2_id=${p2_id} score=${p2Score}`);
        await MatchModel.insertScores(matchId, p1_id, p1Score, p2_id, p2Score);
    }catch (error){
        throw new Error('Error inserting scores for match', error);
    }
}

async function getMatchContext(matchId) {
    return MatchModel.getMatchContext(matchId);
}

const matchService = {
    generateMatchesForDate,
    deleteMatch: deleteMatchForDate,
    getMatches,
    getMatch,
    getMatchesById,
    getPlayersFromMatch,
    getScoreFromMatch,
    getMatchContext,
    insertScoresToMatch
};

export default matchService;