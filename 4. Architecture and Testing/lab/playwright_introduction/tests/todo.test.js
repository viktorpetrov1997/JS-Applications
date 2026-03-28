const { test, expect } = require('@playwright/test');

// Verify if a user can add a task

test('user can add a task', async ({page}) =>
{
    await page.goto('http://127.0.0.1:5500/');
    await page.fill('#task-input', 'Test Task');
    await page.click('#add-task');
    const taskTest = await page.textContent('.task');
    expect(taskTest).toContain('Test Task');
});

// Verify if a user can delete a task

test('user can delete a task', async ({page}) =>
{
    await page.goto('http://127.0.0.1:5500/');
    await page.fill('#task-input', 'Test Task');
    await page.click('#add-task');
    await page.click('.task .delete-task');

    const tasks = await page.$$eval('.task', tasks => tasks.map(task => task.textContent));

    expect(tasks).not.toContain('Test Task');
});

// Verify if a user can mark a task as complete

test("user can mark a task as complete", async ({page}) =>
{
    await page.goto("http://127.0.0.1:5500/");
    await page.fill("#task-input", "Test Task");
    await page.click("#add-task");
    await page.click(".task .task-complete");

    const completedTask = await page.$(".task.completed");
    expect(completedTask).not.toBeNull();
});

// Verify if a user can filter tasks 

test("user can filter complete task", async ({page}) =>
{
    // Add a task
    await page.goto("http://127.0.0.1:5500/");
    await page.fill("#task-input", "Test Task");
    await page.click("#add-task");

    // Mark the task as complete
    await page.click(".task .task-complete");

    // Filter tasks
    await page.selectOption("#filter", "Completed");
    const incompleteTasks = await page.$(".task:not(.completed)");
    expect(incompleteTasks).toBeNull();
});
