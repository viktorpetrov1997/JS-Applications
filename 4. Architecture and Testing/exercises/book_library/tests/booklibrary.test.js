const { test, expect } = require('@playwright/test');

// Verify if clicking the "Load all books" button loads all books on the webpage 
// by mocking the backend response

test('Clicking the "Load all books" button loads all books on the webpage', async ({ page }) => 
{
    await page.route('http://localhost:3030/jsonstore/collections/books', async route => 
    {
        const json = 
        {
            "1": 
            {
                _id: "1",
                title: "Harry Potter",
                author: "J. K. Rowling"
            },
            "2": 
            {
                _id: "2",
                title: "The Lord of the Rings",
                author: "J. R. R. Tolkien"
            }
        };

        await route.fulfill(
        {
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify(json)
        });
    });

    await page.goto('http://127.0.0.1:5500/book_library/index.html');

    await page.click('#loadBooks');

    const rows = page.locator('tbody tr');

    await expect(rows).toHaveCount(2);

    await expect(rows.nth(0)).toContainText('Harry Potter');
    await expect(rows.nth(0)).toContainText('J. K. Rowling');

    await expect(rows.nth(1)).toContainText('The Lord of the Rings');
    await expect(rows.nth(1)).toContainText('J. R. R. Tolkien');
});

// Verify that the form is not submitted if inputs are empty

test('should not submit form with empty inputs', async ({ page }) => 
{
    await page.goto('http://127.0.0.1:5500/book_library/index.html');

    await page.click('#submit');

    const [request] = await Promise.all([
        page.waitForRequest(req => req.method() === 'POST' && req.url().includes('/jsonstore/collections/books'), { timeout: 1000 }).catch(() => null)
    ]);

    expect(request).toBeNull(); 
});

// Verify that the form is submitted with correct data

test('should add a book and display it in the table', async ({ page }) => 
{
    await page.goto('http://127.0.0.1:5500/book_library/index.html');

    const title = 'The Hobbit';
    const author = 'J.R.R. Tolkien';

    await page.fill('#title', title);
    await page.fill('#author', author);
    await page.click('#submit');

    const rows = page.locator('tbody tr');

    await expect(rows).toHaveCount(3);

    await expect(rows.nth(2)).toContainText('The Hobbit');
    await expect(rows.nth(2)).toContainText('J.R.R. Tolkien');
});