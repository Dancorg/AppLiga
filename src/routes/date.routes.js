import express from 'express';
import {getDates, getDate} from '../controllers/date.controllers.js';

const router = express.Router();

router.get('/', getDates);
router.get('/:dateId', getDate);

export default router;