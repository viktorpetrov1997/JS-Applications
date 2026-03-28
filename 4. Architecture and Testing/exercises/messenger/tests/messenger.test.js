const { test, expect } = require('@playwright/test');

// Verify if messages are loaded after clicking the "Refresh" button

// First way

test('first way of testing if messages are loaded after clicking the refresh button', async ({ page }) => 
{
    await page.route('http://localhost:3030/jsonstore/messenger', async route => 
    {
        await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify(
            {
                1: { author: 'Peter', content: 'Hello' },
                2: { author: 'Maria', content: 'Hi' }
            })
        });
    });

    await page.goto('http://127.0.0.1:5500/messenger/index.html');

    await page.click('#refresh');

    const text = await page.locator('#messages').inputValue();

    expect(text).toContain('Peter: Hello');
    expect(text).toContain('Maria: Hi');
});

// Second way

test('second way of testing if messages are loaded after clicking the refresh button', async ({ page }) => 
{
    await page.goto('http://127.0.0.1:5500/messenger/index.html');

    await page.click('#refresh');

    const text = await page.locator('#messages').inputValue();

    expect(text).toContain('Viktor: Hello!'); // For this to work we need to first put this 
    // value inside the text area and then run the test
});

// Verify if clicking the "Send" button sends a request to the database with the right parameters

test('send button sends correct request', async ({ page }) => 
{
    await page.goto('http://127.0.0.1:5500/messenger/index.html'); 

    const authorInput = page.locator('input[name="author"]');
    const contentInput = page.locator('input[name="content"]');
    const sendButton = page.locator('#submit');

    const author = 'Peter';
    const content = 'Hello World';

    await authorInput.fill(author);
    await contentInput.fill(content);

    const [request] = await Promise.all([
        page.waitForRequest(req =>
            req.url() === 'http://localhost:3030/jsonstore/messenger' &&
            req.method() === 'POST'
        ),
        sendButton.click()
    ]);

    const postData = JSON.parse(request.postData());

    expect(postData.author).toBe(author);
    expect(postData.content).toBe(content);
});
