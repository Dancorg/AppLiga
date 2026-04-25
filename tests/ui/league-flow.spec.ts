import { test, expect } from '@playwright/test';
import { RegisterPage } from './pages/RegisterPage';
import { LoginPage } from './pages/LoginPage';
import { LeaguesPage } from './pages/LeaguesPage';
import { LeagueDetailPage } from './pages/LeagueDetailPage';
import { MatchPage } from './pages/MatchPage';

const ADMIN  = { email: 'ui-admin@test.com',  username: 'ui-admin',  password: 'Password123', role: 'admin'  as const };
const PLAYER = { email: 'ui-player@test.com', username: 'ui-player', password: 'Password123', role: 'player' as const };
const LEAGUE   = 'UI Test League';
const DATE_STR = '2025-06-15';
const API      = process.env.API_BASE ?? 'http://localhost:3000/api';

test.describe.serial('full league flow', () => {

    test.afterAll(async ({ request }) => {
        await request.delete(`${API}/auth/delete`, { data: { email: ADMIN.email  } });
        await request.delete(`${API}/auth/delete`, { data: { email: PLAYER.email } });
        const res     = await request.get(`${API}/leagues`);
        const leagues = await res.json();
        for (const l of leagues) {
            if (l.name === LEAGUE) {
                await request.delete(`${API}/leagues/${l.league_id}`);
            }
        }
    });

    test('register admin', async ({ page }) => {
        const reg = new RegisterPage(page);
        await reg.goto();
        await reg.register(ADMIN.email, ADMIN.username, ADMIN.password, ADMIN.role);
        await expect(page).toHaveURL('/');
    });

    test('register player', async ({ page }) => {
        const reg = new RegisterPage(page);
        await reg.goto();
        await reg.register(PLAYER.email, PLAYER.username, PLAYER.password, PLAYER.role);
        await expect(page).toHaveURL('/');
    });

    test('admin creates league and date', async ({ page }) => {
        const login = new LoginPage(page);
        await login.goto();
        await login.login(ADMIN.email, ADMIN.password);

        await page.goto('/create-league');
        await page.getByPlaceholder('League name').fill(LEAGUE);
        await page.getByRole('button', { name: 'Create' }).click();

        const detail = new LeagueDetailPage(page);
        await detail.createDate(DATE_STR);

        await expect(page.getByRole('heading', { name: `${DATE_STR}`, level: 4 })).toBeVisible();
    });

    test('admin joins league and date', async ({ page }) => {
        const login   = new LoginPage(page);
        const leagues = new LeaguesPage(page);
        const detail  = new LeagueDetailPage(page);

        await login.goto();
        await login.login(ADMIN.email, ADMIN.password);
        await leagues.goto();
        await leagues.navigateToLeague(LEAGUE);

        await detail.joinLeague();
        await detail.joinDate(DATE_STR);

        await expect(detail.dateCard(DATE_STR).getByText(ADMIN.username)).toBeVisible();
    });

    test('player joins league and date', async ({ page }) => {
        const login   = new LoginPage(page);
        const leagues = new LeaguesPage(page);
        const detail  = new LeagueDetailPage(page);

        await login.goto();
        await login.login(PLAYER.email, PLAYER.password);
        await leagues.goto();
        await leagues.navigateToLeague(LEAGUE);

        await detail.joinLeague();
        await detail.joinDate(DATE_STR);

        await expect(detail.dateCard(DATE_STR).getByText(PLAYER.username)).toBeVisible();
    });

    test('admin generates matches', async ({ page }) => {
        const login   = new LoginPage(page);
        const leagues = new LeaguesPage(page);
        const detail  = new LeagueDetailPage(page);

        await login.goto();
        await login.login(ADMIN.email, ADMIN.password);
        await leagues.goto();
        await leagues.navigateToLeague(LEAGUE);

        await detail.generateMatches(DATE_STR);

        await expect(detail.dateCard(DATE_STR).locator('li').first()).toBeVisible();
    });

    test('admin resolves the match', async ({ page }) => {
        const login   = new LoginPage(page);
        const leagues = new LeaguesPage(page);
        const detail  = new LeagueDetailPage(page);
        const match   = new MatchPage(page);

        await login.goto();
        await login.login(ADMIN.email, ADMIN.password);
        await leagues.goto();
        await leagues.navigateToLeague(LEAGUE);

        await detail.clickFirstMatch(DATE_STR);

        await match.hitBodyPart('right', 'head');   // +3 → left player scores
        await match.hitBodyPart('right', 'torso');  // +2 → left player scores
        await match.hitBodyPart('left',  'head');   // +3 → right player scores

        await match.submitScore();
        await match.expectSubmitted();
    });

});
