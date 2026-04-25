import { type Page, expect } from '@playwright/test';

export class LeaguesPage {
    constructor(private page: Page) {}

    async goto() {
        await this.page.goto('/');
    }

    async navigateToLeague(name: string) {
        await this.page.getByRole('button', { name }).click();
        await this.page.waitForURL(/\/leagues\/\d+/);
    }

    async expectLeagueVisible(name: string) {
        await expect(this.page.getByRole('button', { name })).toBeVisible();
    }
}
