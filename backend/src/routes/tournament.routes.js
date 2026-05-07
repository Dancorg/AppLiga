import express from 'express';
import {
    createTournament,
    getTournaments,
    getTournamentDetails,
    deleteTournament,
    joinTournament,
    enrollUserByUsername,
    startTournament,
    advanceToElimination,
} from '../controllers/tournament.controllers.js';
import authMiddlewareModule from '../middleware/auth.middleware.js';

const { authMiddleware, requireRole } = authMiddlewareModule;
const router = express.Router();

router.get('/',                           getTournaments);
router.post('/create',                    createTournament);
router.get('/:tourneyId',                 getTournamentDetails);
router.delete('/:tourneyId',              deleteTournament);
router.post('/:tourneyId/join',           authMiddleware, joinTournament);
router.post('/:tourneyId/enroll',         authMiddleware, requireRole('admin'), enrollUserByUsername);
router.post('/:tourneyId/start',          authMiddleware, requireRole('admin'), startTournament);
router.post('/:tourneyId/advance',        authMiddleware, requireRole('admin'), advanceToElimination);

export default router;
