import express from 'express';
import { createLeague } from "../controllers/league.controllers.js";
import authMiddlewareModule from '../middleware/auth.middleware.js';
import { joinLeague } from '../services/league.services.js';
import { deleteLeague } from '../controllers/league.controllers.js';
import { createDateForLeagueController, deleteDateFromLeague } from '../controllers/league.controllers.js';  
import {getLeagues} from '../controllers/league.controllers.js';
import matchController from '../controllers/match.controllers.js';
import leaderBoardController from '../controllers/leaderboard.controllers.js';

const router = express.Router();

router.post('/create', createLeague); 
router.post('/:leagueId/join', authMiddlewareModule.authMiddleware, joinLeague);
router.delete('/:leagueId', deleteLeague);
router.post('/:leagueId/dates', createDateForLeagueController);
router.delete('/dates/:dateId', deleteDateFromLeague);
router.post('/dates/:dateId/matches', matchController.generateMatches);
router.delete('/matches/:matchId', matchController.deleteMatch);
router.get('/', getLeagues);
router.get('/:leagueId', ()=>{}); // Placeholder for get league details route
router.get('/:leagueId/players', ()=>{}); // Placeholder for get league players route
router.get('/:leagueId/matches', ()=>{}); // Placeholder for get league matches route
router.get('/:leagueId/leaderboard', leaderBoardController.getLeaderboard);

export default router;
