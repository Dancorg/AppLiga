League Management Backend

A RESTful backend API for managing competitive leagues, including player enrollment, match generation, scoring, and leaderboard tracking.
Made for internal use of my HEMA club.

Built with Node.js, Express, and MySQL.

Features
- JWT-based authentication (register & login)
- League creation and management
- Player enrollment in leagues
- Date (match day) creation
- Automatic match generation
- Match scoring system (based on round-robin mechanics)
- Dynamic leaderboard calculation
- Game Logic
Each match consists of 2 players
Matches are played over 5 rounds
Each player starts with 5 points
Players can deduct points from each other per round
Final score = 5 - hits_received
Scores are stored per match and used to compute rankings

Tech Stack
- Node.js
- Express.js
- MySQL
- JWT (authentication)
- bcrypt (password hashing)

Project Structure
/src
  /config        # DB connection
  /controllers   # HTTP handlers
  /services      # Business logic
  /models        # Database queries
  /routes        # API routes
  /middleware    # Auth middleware

Installation
1. Clone the repository
git clone https://github.com/your-username/league-backend.git
cd league-backend
2. Install dependencies
npm install
3. Setup environment variables

Create a .env file in the root:

PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=yourpassword
DB_NAME=myDB
JWT_SECRET=your_secret_key
4. Setup database

Run your MySQL schema (tables for users, leagues, dates, matches, etc.)

5. Start the server
npm start

Or (with nodemon):

npm run dev

Authentication:

All protected routes require:

Authorization: Bearer <token>

Token is obtained via:

POST /api/auth/login

API Endpoints
Auth
POST   /api/auth/register
POST   /api/auth/login
DELETE /api/users/me
Leagues
POST   /api/leagues
DELETE /api/leagues/:leagueId
POST   /api/leagues/:leagueId/join
Dates
POST   /api/leagues/:leagueId/dates
DELETE /api/dates/:dateId
Matches
POST   /api/dates/:dateId/matches       # generate matches
POST   /api/matches/:matchId/score      # submit score
DELETE /api/matches/:matchId
Leaderboard
GET /api/leagues/:leagueId/leaderboard

Returns:
- matches played
- wins / losses
- total points
- ranking position

Testing

Tests are written using an HTTP-based approach (Playwright).

Example:

npm test

MVP Limitations
- No round-level persistence (only final scores stored)
- No matchmaking optimization (random pairing)
- No real-time updates
- No advanced ranking system (ELO, etc.)

Future Improvements
- Support for different rulesets
- Store round-by-round match data
- Prevent repeat matchups
- Advanced ranking system (ELO or points-based)
- Player statistics (win rate, history)
- Real-time match updates (WebSockets)
- Frontend integration