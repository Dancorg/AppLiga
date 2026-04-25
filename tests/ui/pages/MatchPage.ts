import { type Page, expect } from '@playwright/test';

type BodyArea = 'head' | 'torso' | 'arm' | 'legs';

const TITLES: Record<BodyArea, string> = {
    head: 'Head (+3)',
    torso: 'Torso (+2)',
    arm: 'Arm (+1)',
    legs: 'Legs (+1)',
};

export class MatchPage {
    constructor(private page: Page) {}

    // target: 'left' = player1's dummy, 'right' = player2's dummy
    async hitBodyPart(target: 'left' | 'right', area: BodyArea) {
        const locator = this.page.locator(`[title="${TITLES[area]}"]`);
        if (target === 'left') {
            await locator.first().click();
        } else {
            await locator.last().click();
        }
    }

    async submitScore() {
        await this.page.getByRole('button', { name: 'Submit Score' }).click();
    }

    async expectSubmitted() {
        await expect(this.page.getByText('Score submitted!')).toBeVisible();
    }

    async expectAlreadyScored() {
        await expect(this.page.getByText('This match has already been scored.')).toBeVisible();
    }
}
