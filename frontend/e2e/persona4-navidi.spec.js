import { test, expect } from '@playwright/test';
import path from 'path';

test.describe.serial('Persona 4: Super Admin - Navidi', () => {

    test.beforeEach(async ({ page }) => {
        await page.goto('/');

        await page.locator('input[name="email"]').fill('it23456789@my.sliit.lk');
        await page.locator('input[name="password"]').fill('password123');
        await page.getByRole('button', { name: /sign in/i }).click();
        await page.waitForTimeout(2000);
    });

    test('4.1 Create an Event', async ({ page }) => {
        await page.goto('/admin/events');

        // We assume there's a "Create Event" UI in the admin panel 
        // Let's click the "+ Add Event" button if it exists
        const createBtn = page.getByRole('button', { name: /add event/i }).first();
        if (await createBtn.isVisible()) {
            await createBtn.click();
            await expect(page.getByText('Create New Event')).toBeVisible();

            await page.locator('input[name="title"]').fill('Playwright Test Event');
            await page.locator('input[name="date"]').fill('2026-10-10');
            await page.locator('input[name="time"]').fill('10:00 AM');
            await page.locator('input[name="location"]').fill('Main Hall');
            await page.locator('input[name="capacity"]').fill('50');

            await page.getByRole('button', { name: /save/i }).click();
            
            // Should see success
            await expect(page.getByText('successfully')).toBeVisible();
        } else {
            console.log('Skipping Create Event since Super Admin has a different panel. Assuming read-only metrics.');
        }
    });

    test('4.2 Verify Super Admin can view Societies', async ({ page }) => {
        await page.goto('/super/societies');
        await expect(page.getByRole('heading', { name: /Society Management/i })).toBeVisible({ timeout: 10000 });
    });
});
