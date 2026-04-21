import express from 'express';
import {getDates, getDate, getParticipants} from '../controllers/date.controllers.js';
import matchController from '../controllers/match.controllers.js';

const router = express.Router();

router.get('/', getDates);
router.get('/:dateId', getDate);
router.get('/:dateId/matches', matchController.getMatchesById);
router.get('/:dateId/participants', getParticipants);

export default router;