import express from 'express';
import cors from 'cors';
import leagueRoutes from "./routes/league.routes.js";
import authRoutes from "./routes/auth.routes.js";
import dateRoutes from "./routes/date.routes.js";
import matchRoutes from "./routes/match.routes.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/leagues', leagueRoutes); 
app.use('/api/auth', authRoutes);
app.use('/api/dates', dateRoutes);
app.use('/api/matches', matchRoutes);

import authMiddlewareModule from './middleware/auth.middleware.js';

app.get('/api/admin-only', authMiddlewareModule.authMiddleware, authMiddlewareModule.requireRole('admin'), (req, res) => {
    res.json({ message: 'This is an admin-only route' });
}); // Example of a protected route that requires authentication and admin role

app.listen(process.env.EXPRESS_PORT, () => {
    console.log(`Server is running on port ${process.env.EXPRESS_PORT}`);
});
