import express from 'express';
import {getDates, getDate, getParticipants, joinDate, enrollUserToDate} from '../controllers/date.controllers.js';
import matchController from '../controllers/match.controllers.js';
import authMiddlewareModule from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/', getDates);
router.get('/:dateId', getDate);
router.get('/:dateId/matches', matchController.getMatchesById);
router.get('/:dateId/participants', getParticipants);
router.post('/:dateId/join', authMiddlewareModule.authMiddleware, joinDate);
router.post('/:dateId/enroll', authMiddlewareModule.authMiddleware, enrollUserToDate);

export default router;