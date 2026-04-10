import express from 'express';
import matchController from '../controllers/match.controllers.js';

const router = express.Router();

router.get('/', matchController.getMatches);
router.get('/:matchId', matchController.getMatch);
router.post('/:matchId/score', matchController.submitScore);

export default router;