import { test, expect } from '@playwright/test';
import { LoginPage } from './pages/LoginPage';

const API = process.env.API_BASE ?? 'http://localhost:3000/api';

const ADMIN = { email: 'lb-admin@test.com', username: 'lb-admin', password: 'Password123', role: 'admin' as const };
const PLAYERS = [1, 2, 3, 4, 5].map(i => ({
    email: `lb-player${i}@test.com`,
    username: `lb-player${i}`,
    password: 'Password123',
    role: 'player' as const,
}));

async function register(u: { email: string; username: string; password: string; role: string }, request: any) {
    await request.post(`${API}/auth/register`, {
        data: { email: u.email, username: u.username, password: u.password, role: u.role },
    });
}

async function login(email: string, password: string, request: any): Promise<string> {
    const res = await request.post(`${API}/auth/login`, { data: { email, password } });
    const { token } = await res.json();
    return token;
}

test.describe.serial('leaderboard - difference scoring', () => {
    let leagueId: number;
    let matches: { matchId: number; player1: number; player2: number }[];

    test.beforeAll(async ({ request }) => {
        // Register all users
        await register(ADMIN, request);
        await Promise.all(PLAYERS.map(p => register(p, request)));

        // Login
        const adminToken = await login(ADMIN.email, ADMIN.password, request);
        const playerTokens = await Promise.all(PLAYERS.map(p => login(p.email, p.password, request)));

        // Create league with difference scoring
        const leagueRes = await request.post(`${API}/leagues/create`, {
            data: {
                name: 'Test Leaderboard Diff',
                scoring_mode: 'difference',
                hit_head: 3,
                hit_torso: 2,
                hit_arm: 1,
                hit_legs: 1,
            },
        });
        expect(leagueRes.status()).toBe(201);
        ({ league_id: leagueId } = await leagueRes.json());

        // Create date
        const dateRes = await request.post(`${API}/leagues/${leagueId}/dates`, {
            headers: { Authorization: `Bearer ${adminToken}` },
            data: { date_date: '2025-09-01' },
        });
        expect(dateRes.status()).toBe(201);
        const { date_id: dateId } = await dateRes.json();

        // All players join league and date
        await Promise.all(playerTokens.map(token =>
            request.post(`${API}/leagues/${leagueId}/join`, {
                headers: { Authorization: `Bearer ${token}` },
            }),
        ));
        await Promise.all(playerTokens.map(token =>
            request.post(`${API}/dates/${dateId}/join`, {
                headers: { Authorization: `Bearer ${token}` },
            }),
        ));

        // Generate matches
        const matchRes = await request.post(`${API}/leagues/dates/${dateId}/matches`, {
            headers: { Authorization: `Bearer ${adminToken}` },
        });
        expect(matchRes.status()).toBe(201);
        matches = await matchRes.json();
        expect(matches.length).toBeGreaterThan(0);

        // Submit scores: player1 always wins 7–3
        await Promise.all(matches.map(m =>
            request.post(`${API}/matches/${m.matchId}/score`, {
                data: { player1_score: 7, player2_score: 3 },
            }),
        ));
    });

    test.afterAll(async ({ request }) => {
        await request.delete(`${API}/leagues/${leagueId}`);
        await request.delete(`${API}/auth/delete`, { data: { email: ADMIN.email } });
        await Promise.all(PLAYERS.map(p =>
            request.delete(`${API}/auth/delete`, { data: { email: p.email } }),
        ));
    });

    test('leaderboard rows match difference scoring results', async ({ page, request }) => {
        // Compute expected totals from match data (player1 always wins 7–3)
        const stats = new Map<number, { total_points: number; wins: number }>();
        for (const m of matches) {
            if (!stats.has(m.player1)) stats.set(m.player1, { total_points: 0, wins: 0 });
            if (!stats.has(m.player2)) stats.set(m.player2, { total_points: 0, wins: 0 });
            stats.get(m.player1)!.total_points += Math.max(0, 7 - 3); // 4
            stats.get(m.player1)!.wins += 1;
            // player2 gets max(0, 3-7)=0 points and 0 wins
        }

        // Fetch canonical leaderboard from API (already sorted by the SQL query)
        const lbRes = await request.get(`${API}/leagues/${leagueId}/leaderboard`);
        expect(lbRes.ok()).toBeTruthy();
        const apiLeaderboard: { position: number; user_id: number; name: string; total_points: number; wins: number }[] =
            await lbRes.json();

        // Verify API leaderboard matches our computed stats
        for (const entry of apiLeaderboard) {
            const computed = stats.get(entry.user_id);
            expect(computed).toBeDefined();
            expect(Number(entry.total_points)).toBe(computed!.total_points);
            expect(Number(entry.wins)).toBe(computed!.wins);
        }

        // Verify the leaderboard is sorted: most wins first, then most total_points
        for (let i = 1; i < apiLeaderboard.length; i++) {
            const prev = apiLeaderboard[i - 1];
            const curr = apiLeaderboard[i];
            const prevPoints = prev.wins; // no draws, so points == wins
            const currPoints = curr.wins;
            if (Number(prevPoints) === Number(currPoints)) {
                expect(prev.total_points).toBeGreaterThanOrEqual(curr.total_points);
            } else {
                expect(Number(prevPoints)).toBeGreaterThan(Number(currPoints));
            }
        }

        // Navigate to the league detail page and verify the UI leaderboard
        const login = new LoginPage(page);
        await login.goto();
        await login.login(ADMIN.email, ADMIN.password);

        await page.goto(`/leagues/${leagueId}`);
        await page.waitForLoadState('networkidle');

        const rows = page.locator('table tbody tr');
        await expect(rows).toHaveCount(PLAYERS.length);

        for (let i = 0; i < apiLeaderboard.length; i++) {
            const row = rows.nth(i);
            const cells = row.locator('td');
            await expect(cells.nth(0)).toHaveText(String(i + 1));                   // position
            await expect(cells.nth(1)).toHaveText(apiLeaderboard[i].name);          // player
            await expect(cells.nth(4)).toHaveText(String(apiLeaderboard[i].total_points)); // points (total_points)
        }
    });
});
