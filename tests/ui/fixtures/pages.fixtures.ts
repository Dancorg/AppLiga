import { test as base, Page } from '@playwright/test';
import { LeagueDetailPage } from '../pages/LeagueDetailPage';
import { LeaguesPage } from '../pages/LeaguesPage';
import { LoginPage } from '../pages/LoginPage';
import { MatchPage } from '../pages/MatchPage';
import { RegisterPage } from '../pages/RegisterPage';
// TODO: create tourney page

type PageFixtures = {
    LoginPage: LoginPage;
    LeaguesPage: LeaguesPage;
    LeagueDetailPage: LeagueDetailPage;
    MatchPage: MatchPage;
    RegisterPage: RegisterPage;
};

export const test = base.extend<PageFixtures>({
    LoginPage: async ({page}, use) => {
        const loginPage = new LoginPage(page);
        await loginPage.goto();
        await use(loginPage);
    },
    LeaguesPage: async ({page}, use) => {
        const leaguesPage = new LeaguesPage(page);
        await leaguesPage.goto();
        await use(leaguesPage);
    },
    LeagueDetailPage: async ({page}, use) => {
        const leaguesDetailPage = new LeagueDetailPage(page);
        //await leaguesDetailPage.goto();
        await use(leaguesDetailPage);
    },
    MatchPage: async ({page}, use) => {
        const matchPage = new MatchPage(page);
        //await matchPage.goto();
        await use(matchPage);
    },
    RegisterPage: async ({page}, use) => {
        const registerPage = new RegisterPage(page);
        await registerPage.goto();
        await use(registerPage);
    },
    
})

export {expect} from '@playwright/test';