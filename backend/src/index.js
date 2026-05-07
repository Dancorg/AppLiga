import express from 'express';
import cors from 'cors';
// ngrok/single-port: uncomment these when serving frontend from Express
// import { fileURLToPath } from 'url';
// import { dirname, join } from 'path';
import leagueRoutes from "./routes/league.routes.js";
import authRoutes from "./routes/auth.routes.js";
import dateRoutes from "./routes/date.routes.js";
import matchRoutes from "./routes/match.routes.js";
import tournamentRoutes from "./routes/tournament.routes.js";

// ngrok/single-port: uncomment these when serving frontend from Express
// const __dirname = dirname(fileURLToPath(import.meta.url));
// const frontendDist = join(__dirname, '../../frontend/app-liga-front/dist');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/leagues', leagueRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/dates', dateRoutes);
app.use('/api/matches', matchRoutes);
app.use('/api/tournaments', tournamentRoutes);

import authMiddlewareModule from './middleware/auth.middleware.js';

app.get('/api/admin-only', authMiddlewareModule.authMiddleware, authMiddlewareModule.requireRole('admin'), (req, res) => {
    res.json({ message: 'This is an admin-only route' });
}); // Example of a protected route that requires authentication and admin role

// ngrok/single-port: uncomment these when serving frontend from Express
// app.use(express.static(frontendDist));
// app.use((_req, res) => {
//     res.sendFile(join(frontendDist, 'index.html'));
// });

app.listen(process.env.EXPRESS_PORT, () => {
    console.log(`Server is running on port ${process.env.EXPRESS_PORT}`);
});
