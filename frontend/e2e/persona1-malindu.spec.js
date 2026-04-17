import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

test.describe('Persona 1: Student Buyer - Malindu', () => {

    test.beforeEach(async ({ page }) => {
        await page.goto('/');

        await page.locator('input[name="email"]').fill('it34567890@my.sliit.lk');
        await page.locator('input[name="password"]').fill('password123');
        await page.getByRole('button', { name: /sign in/i }).click();
        await page.waitForTimeout(2000); // safe wait for React Router SPA to settle
    });

    test('1.1 Reserve a paid ticket and upload payment slip successfully', async ({ page }) => {
        await page.goto('/events');
        // Browse Events Page
        await expect(page.getByText('Discover Campus Events')).toBeVisible({ timeout: 10000 });

        // Click on the specific event's book button
        const eventCard = page.locator('div.bg-white.rounded-2xl').filter({ hasText: 'React Native Appathon' }).first();
        await expect(eventCard).toBeVisible({ timeout: 10000 });
        
        // Ensure not sold out, then click
        await eventCard.getByRole('button', { name: /view & book ticket/i }).click();

        // Book Ticket Page
        await page.waitForURL('**/events/book/*');
        await expect(page.getByText('Order Summary')).toBeVisible({ timeout: 10000 });

        // Ticket Quantity Logic (Native select)
        await page.locator('select').first().selectOption('1'); // Just 1 ticket for simplicity

        // Use a real image from the frontend assets so Cloudinary backend doesn't throw a parsing error
        const realSlipPath = path.resolve(process.cwd(), 'src/assets/signup_images/pic1.jpg');

        // Upload the payment slip
        await page.locator('input[type="file"]').setInputFiles(realSlipPath);

        // Submit the booking
        await page.getByRole('button', { name: /confirm reservation/i }).click();

        // Wait for success screen
        await expect(page.getByText('Reservation Confirmed!')).toBeVisible({ timeout: 15000 });
        
        // Proceed to My Tickets
        await page.getByRole('link', { name: /view pending tickets/i }).click();
        await page.waitForURL('**/my-tickets');
    });

    test('1.2 Verify the ticket appears in "My Tickets" tab under "Pending Verification"', async ({ page }) => {
        await page.goto('/my-tickets');

        await expect(page.getByRole('heading', { name: 'My Tickets' })).toBeVisible({ timeout: 10000 });

        // Click Pending Tab natively (the label includes 'Pending')
        await page.getByRole('button', { name: /Pending/i }).click();

        // The card should render with the Event title and 'Awaiting Approval'
        const pendingCard = page.locator('h3').filter({ hasText: 'React Native Appathon' }).first();
        await expect(pendingCard).toBeVisible({ timeout: 5000 });
        
        await expect(page.getByText('Awaiting Approval').first()).toBeVisible();
    });
});
