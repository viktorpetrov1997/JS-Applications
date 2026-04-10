const { chromium } = require('playwright-chromium');
const { expect } = require('chai');

const host = "http://localhost:3000"; // Application host (NOT service host - that can be anything)
const interval = 300;
const timeout = 6000;
const DEBUG = false;
const slowMo = 500;


const mockData = {
    "users": [
        {
            "_id": "0001",
            "email": "john@abv.bg",
            "password": "123456",
            "accessToken": "AAAA"
        },
        {
            "_id": "0002",
            "email": "ivan@abv.bg",
            "password": "pass123",
            "accessToken": "BBBB"
        },
        {
            "_id": "0003",
            "email": "peter@abv.bg",
            "password": "123456",
            "accessToken": "CCCC"
        }
    ],

    "catalog": [
        {
          "_id": "1003",
          "_ownerId": "0002",
          "item": 'Synoptic Eye Tablet',
          "imageUrl": '/images/tablet.png',
          "price": '1000',
          "availability": 'Premium retailers, exclusive online stores' ,
          "type": 'Premium Tech' ,
          "description": 'The Synoptic Eye is an essential tool for any cyberpunk, providing a portal to the digital world and enhancing your perception of reality. Its holographic display projects information onto your field of vision, making it easy to stay connected and in control, even in the midst of the urban jungle.' ,
        },
        {
          "_id": "1002",
          "_ownerId": "0002",
          "item": 'Neural Impulse Controller',
          "imageUrl": '/images/controller.png',
          "price": '799',
          "availability": 'Underground black markets' ,
          "type": 'Experimental' ,
          "description": 'A sleek, ergonomic controller designed for seamless interaction with the digital realm. The NII harnesses the power of neuro-electric signal processing to interpret your thoughts and translate them into actions within the virtual world. Experience unparalleled immersion and control with the NII, the ultimate tool for gamers, hackers, and anyone seeking to blur the lines between reality and the digital domain.' ,
        },
        {
          "_id": "1001",
          "_ownerId": "0001",
          "item": 'Sky Seeker Drone',
          "imageUrl": '/images/drone.png',
          "price": '1200',
          "availability": 'Mass-Market Retail, Online Marketplace' ,
          "type": 'Advanced Surveillance' ,
          "description": 'The Sky Seeker is an invaluable tool for exploration and surveillance. Its compact size and maneuverability make it ideal for navigating tight spaces and gathering data, while its high-resolution cameras provide clear images even in low-light conditions. With the Sky Seeker, you can stay ahead of the curve in the ever-changing world of cyberpunk.' ,
        }
      ]
   
};
const endpoints = {
    register: "/users/register",
    login: "/users/login",
    logout: "/users/logout",
    catalog: "/data/cyberpunk?sortBy=_createdOn%20desc",
    create: "/data/cyberpunk",
    details: (id) => `/data/cyberpunk/${id}`,
    delete: (id) => `/data/cyberpunk/${id}`,
    own: (itemId, userId) => `/data/cyberpunk?where=_id%3D%22${itemId}%22%20and%20_ownerId%3D%22${userId}%22&count`,

};

let browser;
let context;
let page;

describe("E2E tests", function () {
    // Setup
    this.timeout(DEBUG ? 120000 : timeout);
    before(async () => {
        browser = await chromium.launch(DEBUG ? { headless: false, slowMo } : {});
    });
    after(async () => {
        await browser.close();

    });
    beforeEach(async function () {
        this.timeout(10000);
        context = await browser.newContext();
        setupContext(context);
        page = await context.newPage();
    });
    afterEach(async () => {
        await page.close();
        await context.close();
    });

    // Test proper
    describe("Authentication [ 20 Points ]", function () {
        it("Login does NOT work with empty fields [ 2.5 Points ]", async function () {
            const { post } = await handle(endpoints.login);
            const isCalled = post().isHandled;

            await page.goto(host);

            let loginBtn = await page.waitForSelector('text=Login', { timeout: interval });
            await loginBtn.click();

            await page.waitForSelector("form", { timeout: interval });
            await page.click('[type="submit"]');

            await page.waitForTimeout(interval);
            expect(isCalled()).to.equal(false, 'Login API was called when form inputs were empty');
        });

        it("Login with valid input makes correct API call [ 2.5 Points ]", async function () {
            const data = mockData.users[0];
            const { post } = await handle(endpoints.login);
            const { onRequest } = post(data);

            await page.goto(host);

            let loginBtn = await page.waitForSelector('text=Login', { timeout: interval });
            await loginBtn.click();

            //Can check using Ids if they are part of the provided HTML
            await page.waitForSelector("form", { timeout: interval });

            let emailElement = await page.waitForSelector('[name="email"]', { timeout: interval });
            let passwordElement = await page.waitForSelector('[name="password"]', { timeout: interval });

            await emailElement.fill(data.email);
            await passwordElement.fill(data.password);

            const [request] = await Promise.all([
                onRequest(),
                page.click('[type="submit"]'),
            ]);

            const postData = JSON.parse(request.postData());
            expect(postData.email).to.equal(data.email);
            expect(postData.password).to.equal(data.password);
        });
      
        
        it("Login shows alert on fail and does not redirect [ 2.5 Points ]", async function () {
            const data = mockData.users[0];
            const { post } = await handle(endpoints.login);
            let options = { json: true, status: 400 };
            const { onResponse } = post({ message: 'Error 400' }, options);
        
            await page.goto(host);
        
            let loginBtn = await page.waitForSelector('text=Login', { timeout: interval });
            await loginBtn.click();
        
            await page.waitForSelector('form', { timeout: interval });
        
            let emailElement = await page.waitForSelector('[name="email"]', { timeout: interval });
            let passwordElement = await page.waitForSelector('[name="password"]', { timeout: interval });
        
            await emailElement.fill(data.email);
            await passwordElement.fill(data.password);
        
            // Prepare for alert dialog or span with error message
            let alertPromise = new Promise(resolve => {
                page.on('dialog', async dialog => {
                    await dialog.accept();
                    resolve({type: dialog.type()});
                });
            });
            let errorMessageSpanPromise = page.waitForSelector('.notification', { state: 'visible', timeout: interval })
        .then(() => page.$eval('.msg', el => el.textContent))
        .then(text => ({type: 'error-span', message: text})) // Ensure consistent type
        .catch(() => ({type: 'none'})); // In case no notification appears
        
            await Promise.all([
                onResponse(),
                page.click('[type="submit"]'),
                Promise.race([alertPromise, errorMessageSpanPromise])
            ]);
        
            // Check if still on login page
            await page.waitForSelector('form', { timeout: interval });
        
            // Determine the type of error indication received
            let errorIndicator = await Promise.race([alertPromise, errorMessageSpanPromise]);
            if (errorIndicator.type === 'alert') {
                expect(errorIndicator.type).to.equal('alert');
            } else if (errorIndicator.type === 'error-span') { // Ensure this matches what you resolve in the promise
                expect(errorIndicator.message).to.include('Error 400');
            } else {
                throw new Error('No error indication received');
            }
        });

        it("Register does NOT work with different passwords [ 2.5 Points ]", async function () {
    const data = mockData.users[1];

    await page.goto(host);

    let registerBtn = await page.waitForSelector('text=Register', { timeout: interval });
    await registerBtn.click();

    await page.waitForSelector("form", { timeout: interval });

    let emailElement = await page.waitForSelector('[name="email"]', { timeout: interval });
    let passwordElement = await page.waitForSelector('[name="password"]', { timeout: interval });
    let repeatPasswordElement = await page.waitForSelector('[name="re-password"]', { timeout: interval });

    await emailElement.fill(data.email);
    await passwordElement.fill(data.password);
    await repeatPasswordElement.fill('nope');

    // Prepare for alert dialog
    let alertPromise = new Promise(resolve => {
        page.on('dialog', async dialog => {
            await dialog.accept();
            resolve({type: 'alert', message: dialog.message()});
        });
    }).catch(() => ({type: 'none'})); // Catch in case no dialog appears

    // Prepare for custom notification
    let notificationPromise = page.waitForSelector('.notification', { state: 'visible', timeout: 5000 })
        .then(() => page.$eval('.msg', el => el.textContent))
        .then(text => ({type: 'notification', message: text}))
        .catch(() => ({type: 'none'})); // Catch in case no notification appears

    // Click submit and wait for the first to occur
    await page.click('[type="submit"]');

    let errorIndicator = await Promise.race([alertPromise, notificationPromise]);

    // Assertion based on the type of error received
    if (errorIndicator.type === 'alert') {
        // Assert based on alert dialog properties
        expect(errorIndicator.message).to.include('Passwords don\'t match');
    } else if (errorIndicator.type === 'notification') {
        // Assert based on custom notification properties
        expect(errorIndicator.message).to.include('Passwords don\'t match');
    } else {
        throw new Error('No error indication received');
    }

    // Additional test logic as needed...
});

        

        it("Register does NOT work with empty fields [ 2.5 Points ]", async function () {
            const { post } = await handle(endpoints.register);
            const isCalled = post().isHandled;

            await page.goto(host);

            let registerBtn = await page.waitForSelector('text=Register', { timeout: interval });
            await registerBtn.click();

            await page.waitForSelector("form", { timeout: interval });
            await page.click('[type="submit"]');

            await page.waitForTimeout(interval);
            expect(isCalled()).to.be.false;
        });
        
        it("Register with valid input makes correct API call [ 2.5 Points ]", async function () {
            const data = mockData.users[1];
            const { post } = await handle(endpoints.register);
            const { onRequest } = post(data);

            await page.goto(host);

            let registerBtn = await page.waitForSelector('text=Register', { timeout: interval });
            await registerBtn.click();

            await page.waitForSelector("form", { timeout: interval });

            let emailElement = await page.waitForSelector('[name="email"]', { timeout: interval });
            let passwordElement = await page.waitForSelector('[name="password"]', { timeout: interval });
            let repeatPasswordElement = await page.waitForSelector('[name="re-password"]', { timeout: interval });

            await emailElement.fill(data.email);
            await passwordElement.fill(data.password);
            await repeatPasswordElement.fill(data.password);

            const [request] = await Promise.all([
                onRequest(),
                page.click('[type="submit"]'),
            ]);

            const postData = JSON.parse(request.postData());
            expect(postData.email).to.equal(data.email);
            expect(postData.password).to.equal(data.password);
        });
        it("Register shows alert on fail and does not redirect [ 2.5 Points ]", async function () {
            const data = mockData.users[1];
            const { post } = await handle(endpoints.register);
            let options = { json: true, status: 400 };
            const { onResponse } = post({ message: 'Error 409' }, options);

            await page.goto(host);

            let registerBtn = await page.waitForSelector('text=Register', { timeout: interval });
            await registerBtn.click();

            await page.waitForSelector('form', { timeout: interval });

            let emailElement = await page.waitForSelector('[name="email"]', { timeout: interval });
            let passwordElement = await page.waitForSelector('[name="password"]', { timeout: interval });
            let repeatPasswordElement = await page.waitForSelector('[name="re-password"]', { timeout: interval });

            await emailElement.fill(data.email);
            await passwordElement.fill(data.password);
            await repeatPasswordElement.fill(data.password);

            // Prepare for alert dialog or span with error message
            let alertPromise = new Promise(resolve => {
                page.on('dialog', async dialog => {
                    await dialog.accept();
                    resolve({type: dialog.type()});
                });
            });
            let errorMessageSpanPromise = page.waitForSelector('.notification', { state: 'visible', timeout: interval })
        .then(() => page.$eval('.msg', el => el.textContent))
        .then(text => ({type: 'error-span', message: text})) // Ensure consistent type
        .catch(() => ({type: 'none'})); // In case no notification appears
        
            await Promise.all([
                onResponse(),
                page.click('[type="submit"]'),
                Promise.race([alertPromise, errorMessageSpanPromise])
            ]);
        
            // Check if still on login page
            await page.waitForSelector('form', { timeout: interval });
        
            // Determine the type of error indication received
            let errorIndicator = await Promise.race([alertPromise, errorMessageSpanPromise]);
            if (errorIndicator.type === 'alert') {
                expect(errorIndicator.type).to.equal('alert');
            } else if (errorIndicator.type === 'error-span') { // Ensure this matches what you resolve in the promise
                expect(errorIndicator.message).to.include('Error 409');
            } else {
                throw new Error('No error indication received');
            }
        });


        it("Logout makes correct API call [ 2.5 Points ]", async function () {
            const data = mockData.users[2];
            const { post } = await handle(endpoints.login);
            const { get } = await handle(endpoints.logout);
            const { onResponse } = post(data);
            const { onRequest } = get("", { json: false, status: 204 });

            await page.goto(host);

            let loginBtn = await page.waitForSelector('text=Login', { timeout: interval });
            await loginBtn.click();

            //Can check using Ids if they are part of the provided HTML
            await page.waitForSelector("form", { timeout: interval });

            let emailElement = await page.waitForSelector('[name="email"]', { timeout: interval });
            let passwordElement = await page.waitForSelector('[name="password"]', { timeout: interval });

            await emailElement.fill(data.email);
            await passwordElement.fill(data.password);

            await Promise.all([onResponse(), page.click('[type="submit"]')]);

            let logoutBtn = await page.waitForSelector('nav >> text=Logout', { timeout: interval });

            const [request] = await Promise.all([
                onRequest(),
                logoutBtn.click()
            ]);

            const token = request.headers()["x-authorization"];
            expect(request.method()).to.equal("GET");
            expect(token).to.equal(data.accessToken);
        });
    });

    describe("Navigation bar [ 10 Points ]", () => {
        it("Logged user should see correct navigation [ 2.5 Points ]", async function () {
            // Login user
            const userData = mockData.users[0];
            const { post: loginPost } = await handle(endpoints.login);
            loginPost(userData);
            await page.goto(host);

            let loginBtn = await page.waitForSelector('text=Login', { timeout: interval });
            await loginBtn.click();

            await page.waitForSelector("form", { timeout: interval });

            let emailElement = await page.waitForSelector('[name="email"]', { timeout: interval });
            let passwordElement = await page.waitForSelector('[name="password"]', { timeout: interval });

            await emailElement.fill(userData.email);
            await passwordElement.fill(userData.password);

            await page.click('[type="submit"]');

            //Test for navigation
            await page.waitForSelector('nav >> text= Market', { timeout: interval });

            expect(await page.isVisible("nav >> text=Market")).to.be.true;
            expect(await page.isVisible("nav >> text=Sell")).to.be.true;
            expect(await page.isVisible("nav >> text=Logout")).to.be.true;
            


            expect(await page.isVisible("nav >> text=Login")).to.be.false;
            expect(await page.isVisible("nav >> text=Register")).to.be.false;
        });

        it("Guest user should see correct navigation [ 2.5 Points ]", async function () {
            await page.goto(host);

            await page.waitForSelector('nav >> text=Market', { timeout: interval });

            expect(await page.isVisible("nav"), "Dashboard is not visible").to.be.true;
            expect(await page.isVisible("nav >> text=Sell"), "Create is visible").to.be.false;
            expect(await page.isVisible("nav >> text=Logout"), "Logout is visible").to.be.false;
            expect(await page.isVisible("nav >> text=Login"), "Login is not visible").to.be.true;
            expect(await page.isVisible("nav >> text=Register"), "Ragister is not visible").to.be.true;
        });

        it("Guest user navigation should work [ 2.5 Points ]", async function () {
            const { get } = await handle(endpoints.catalog);
            get(mockData.catalog);
            await page.goto(host);

            let marketBtn = await page.waitForSelector('nav >> text=Market', { timeout: interval });
            await marketBtn.click();

            await page.waitForSelector('#dashboard', { timeout: interval });
            let loginBtn = await page.waitForSelector('nav >> text=Login', { timeout: interval });
            await loginBtn.click();


            await page.waitForSelector('#login', { timeout: interval });
            let registerBtn = await page.waitForSelector('nav >> text=Register', { timeout: interval });
            await registerBtn.click();

            await page.waitForSelector('#register', { timeout: interval });
            let logo = await page.waitForSelector('#logo', { timeout: interval });
            await logo.click();

            await page.waitForSelector('#hero', { timeout: interval });
        });

        it("Logged in user navigation should work [ 2.5 Points ]", async function () {
            // Login user
            const userData = mockData.users[0];
            const { post: loginPost } = await handle(endpoints.login);
            loginPost(userData);
            const { get } = await handle(endpoints.catalog);
            get(mockData.catalog);

            await page.goto(host);

            let loginBtn = await page.waitForSelector('text=Login', { timeout: interval });
            await loginBtn.click();

            await page.waitForSelector("form", { timeout: interval });

            let emailElement = await page.waitForSelector('[name="email"]', { timeout: interval });
            let passwordElement = await page.waitForSelector('[name="password"]', { timeout: interval });

            await emailElement.fill(userData.email);
            await passwordElement.fill(userData.password);

            await page.click('[type="submit"]');

            let marketBtn = await page.waitForSelector('nav >> text=Market', { timeout: interval });
            await marketBtn.click();

            await page.waitForSelector('#dashboard', { timeout: interval });
            let createBtn = await page.waitForSelector('nav >> text=Sell', { timeout: interval });
            await createBtn.click();

            await page.waitForSelector('#create', { timeout: interval });
            let logo = await page.waitForSelector('#logo', { timeout: interval });
            await logo.click();

            await page.waitForSelector('#hero', { timeout: interval });
        });
    });

    describe("Home Page [ 5 Points ]", function () {
        it("Show Home page text [ 2.5 Points ]", async function () {
            await page.goto(host);
            await page.waitForSelector('text=We know who you are, we will contact you', { timeout: interval });
            expect(await page.isVisible("text=We know who you are, we will contact you")).to.be.true;
        });

        it("Show home page image [ 2.5 Points ]", async function () {
            await page.goto(host);
            await page.waitForSelector('#hero img', { timeout: interval });
            expect(await page.isVisible('#hero img')).to.be.true;
        });
    });

    describe("Dashboard Page [ 15 Points ]", function () {
        it("Show Market page - 'Market' message [ 2.5 Points ]", async function () {
            const { get } = await handle(endpoints.catalog);
            get([]);
            await page.goto(host);

            let marketBtn = await page.waitForSelector('nav >> text= Market', { timeout: interval });
            await marketBtn.click();

            await page.waitForSelector('h3 >> text=Market', { timeout: interval });
            expect(await page.isVisible("h3 >> text=Market")).to.be.true;
        });

        it("Check Market page with 0 Items [ 2.5 Points ]", async function () {
            const { get } = await handle(endpoints.catalog);
            get([]);

            await page.goto(host);

            let marketBtn = await page.waitForSelector('nav >> text=Market', { timeout: interval });
            await marketBtn.click();

            await page.waitForSelector('text=No Items Yet', { timeout: interval });
            expect(await page.isVisible('text=No Items Yet')).to.be.true;

        });

        it("Check Items have correct images [ 2.5 Points ]", async function () {
            const { get } = await handle(endpoints.catalog);
            get(mockData.catalog);
            const data = mockData.catalog;

            await page.goto(host);

            let marketBtn = await page.waitForSelector('nav >> text=Market', { timeout: interval });
            await marketBtn.click();

            await page.waitForSelector(".item img", { timeout: interval });
            const images = await page.$$eval(".item img", (t) =>
                t.map((s) => s.src)
            );

            expect(images.length).to.equal(3);
            expect(images[0]).to.contains(`${encodeURI(data[0].imageUrl)}`);
            expect(images[1]).to.contains(`${encodeURI(data[1].imageUrl)}`);
            expect(images[2]).to.contains(`${encodeURI(data[2].imageUrl)}`);
        });

        it("Check Items have correct model [ 2.5 Points ]", async function () {
            const { get } = await handle(endpoints.catalog);
            get(mockData.catalog);
            const data = mockData.catalog;

            await page.goto(host);

            let marketBtn = await page.waitForSelector('nav >> text=Market', { timeout: interval });
            await marketBtn.click();

            await page.waitForSelector(".item .model", { timeout: interval });
            const categories = await page.$$eval(".item .model", (t) =>
                t.map((s) => s.textContent)
            );

            expect(categories.length).to.equal(3);
            expect(categories[0]).to.contains(`${data[0].item}`);
            expect(categories[1]).to.contains(`${data[1].item}`);
            expect(categories[2]).to.contains(`${data[2].item}`);
        });

        it("Check Items have correct price [ 2.5 Points ]", async function () {
            const { get } = await handle(endpoints.catalog);
            get(mockData.catalog.slice(0, 2));
            const data = mockData.catalog.slice(0, 2);

            await page.goto(host);

            let marketBtn = await page.waitForSelector('nav >> text=Market', { timeout: interval });
            await marketBtn.click();

            await page.waitForSelector(".item-info .price", { timeout: interval });
            const categories = await page.$$eval(".item-info .price", (t) =>
                t.map((s) => s.textContent)
            );

            expect(categories.length).to.equal(2);
            expect(categories[0]).to.contains(`${data[0].price}`);
            expect(categories[1]).to.contains(`${data[1].price}`);
        });
        it("Check Items have correct availability [ 2.5 Points ]", async function () {
            const { get } = await handle(endpoints.catalog);
            get(mockData.catalog.slice(0, 2));
            const data = mockData.catalog.slice(0, 2);

            await page.goto(host);

            let marketBtn = await page.waitForSelector('nav >> text=Market', { timeout: interval });
            await marketBtn.click();

            await page.waitForSelector(".item-info .availability", { timeout: interval });
            const categories = await page.$$eval(".item-info .availability", (t) =>
                t.map((s) => s.textContent)
            );

            expect(categories.length).to.equal(2);
            expect(categories[0]).to.contains(`${data[0].availability}`);
            expect(categories[1]).to.contains(`${data[1].availability}`);
        });
        it("Check Items have correct type [ 2.5 Points ]", async function () {
            const { get } = await handle(endpoints.catalog);
            get(mockData.catalog.slice(0, 2));
            const data = mockData.catalog.slice(0, 2);

            await page.goto(host);

            let marketBtn = await page.waitForSelector('nav >> text=Market', { timeout: interval });
            await marketBtn.click();

            await page.waitForSelector(".item-info .type", { timeout: interval });
            const categories = await page.$$eval(".item-info .type", (t) =>
                t.map((s) => s.textContent)
            );

            expect(categories.length).to.equal(2);
            expect(categories[0]).to.contains(`${data[0].type}`);
            expect(categories[1]).to.contains(`${data[1].type}`);
        });
       
    });

    describe("CRUD [ 50 Points ]", () => {
        describe('Create [ 12.5 Points ]', function () {
            it("Create does NOT work with empty fields [ 2.5 Points ]", async function () {
                //Login
                const userData = mockData.users[0];
                const { post: loginPost } = await handle(endpoints.login);
                loginPost(userData);
                await page.goto(host);
                let loginBtn = await page.waitForSelector('text=Login', { timeout: interval });
                await loginBtn.click();
                await page.waitForSelector("form", { timeout: interval });
                let emailElement = await page.waitForSelector('[name="email"]', { timeout: interval });
                let passwordElement = await page.waitForSelector('[name="password"]', { timeout: interval });
                await emailElement.fill(userData.email);
                await passwordElement.fill(userData.password);
                await page.click('[type="submit"]');

                const { post } = await handle(endpoints.create);
                const isCalled = post().isHandled;

                let addItemBtn = await page.waitForSelector('text=Sell', { timeout: interval });
                await addItemBtn.click();

                let submitBtn = await page.waitForSelector('[type="submit"]', { timeout: interval });
                await submitBtn.click();

                await page.waitForTimeout(interval);
                expect(isCalled()).to.equal(false, 'Create API was called when form inputs were empty');
            });

            it("Create makes correct API call [ 2.5 Points ]", async function () {
                //Login
                const userData = mockData.users[0];
                const { post: loginPost } = await handle(endpoints.login);
                loginPost(userData);
                await page.goto(host);
                let loginBtn = await page.waitForSelector('text=Login', { timeout: interval });
                await loginBtn.click();
                await page.waitForSelector("form", { timeout: interval });
                let emailElement = await page.waitForSelector('[name="email"]', { timeout: interval });
                let passwordElement = await page.waitForSelector('[name="password"]', { timeout: interval });
                await emailElement.fill(userData.email);
                await passwordElement.fill(userData.password);
                let loginSubmitBtn = await page.waitForSelector('[type="submit"]', { timeout: interval });
                await loginSubmitBtn.click();

                const data = mockData.catalog[0];
                const { post } = await handle(endpoints.create);
                const { onRequest } = post(data);

                let addItemBtn = await page.waitForSelector('text=Sell', { timeout: interval });
                await addItemBtn.click();

                let modelElement = await page.waitForSelector('[name="item"]', { timeout: interval });
                let imageElement = await page.waitForSelector('[name="imageUrl"]', { timeout: interval });
                let priceElement = await page.waitForSelector('[name="price"]', { timeout: interval });
                let weightElement = await page.waitForSelector('[name="availability"]', { timeout: interval });
                let speedElement = await page.waitForSelector('[name="type"]', { timeout: interval });
                let aboutElement = await page.waitForSelector('[name="description"]', { timeout: interval });
                let submitBtn = await page.waitForSelector('[type="submit"]', { timeout: interval });

                await modelElement.fill(data.item);
                await imageElement.fill(data.imageUrl);
                await priceElement.fill(data.price);
                await weightElement.fill(data.availability);
                await speedElement.fill(data.type);
                await aboutElement.fill(data.description);


                const [request] = await Promise.all([
                    onRequest(),
                    submitBtn.click(),
                ]);
            });

            it("Create sends correct data [ 2.5 Points ]", async function () {
                //Login
                const userData = mockData.users[0];
                const { post: loginPost } = await handle(endpoints.login);
                loginPost(userData);
                await page.goto(host);
                let loginBtn = await page.waitForSelector('text=Login', { timeout: interval });
                await loginBtn.click();
                await page.waitForSelector("form", { timeout: interval });
                let emailElement = await page.waitForSelector('[name="email"]', { timeout: interval });
                let passwordElement = await page.waitForSelector('[name="password"]', { timeout: interval });
                await emailElement.fill(userData.email);
                await passwordElement.fill(userData.password);
                let loginSubmitBtn = await page.waitForSelector('[type="submit"]', { timeout: interval });
                await loginSubmitBtn.click();

                const data = mockData.catalog[0];
                const { post } = await handle(endpoints.create);
                const { onRequest } = post(data);

                let addItemBtn = await page.waitForSelector('text=Sell', { timeout: interval });
                await addItemBtn.click();

          
                let modelElement = await page.waitForSelector('[name="item"]', { timeout: interval });
                let imageElement = await page.waitForSelector('[name="imageUrl"]', { timeout: interval });
                let priceElement = await page.waitForSelector('[name="price"]', { timeout: interval });
                let weightElement = await page.waitForSelector('[name="availability"]', { timeout: interval });
                let speedElement = await page.waitForSelector('[name="type"]', { timeout: interval });
                let aboutElement = await page.waitForSelector('[name="description"]', { timeout: interval });
                let submitBtn = await page.waitForSelector('[type="submit"]', { timeout: interval });

                await modelElement.fill(data.item);
                await imageElement.fill(data.imageUrl);
                await priceElement.fill(data.price);
                await weightElement.fill(data.availability);
                await speedElement.fill(data.type);
                await aboutElement.fill(data.description);

                const [request] = await Promise.all([
                    onRequest(),
                    submitBtn.click(),
                ]);

                const postData = JSON.parse(request.postData());

                expect(postData.item).to.equal(data.item);
                expect(postData.imageUrl).to.equal(data.imageUrl);
                expect(postData.price).to.equal(data.price);
                expect(postData.availability).to.equal(data.availability);
                expect(postData.type).to.equal(data.type);
                expect(postData.description).to.equal(data.description);


            });

            it("Create includes correct headers [ 2.5 Points ]", async function () {
                //Login
                const userData = mockData.users[0];
                const { post: loginPost } = await handle(endpoints.login);
                loginPost(userData);
                await page.goto(host);
                let loginBtn = await page.waitForSelector('text=Login', { timeout: interval });
                await loginBtn.click();
                await page.waitForSelector("form", { timeout: interval });
                let emailElement = await page.waitForSelector('[name="email"]', { timeout: interval });
                let passwordElement = await page.waitForSelector('[name="password"]', { timeout: interval });
                await emailElement.fill(userData.email);
                await passwordElement.fill(userData.password);
                let loginSubmitBtn = await page.waitForSelector('[type="submit"]', { timeout: interval });
                await loginSubmitBtn.click();

                const data = mockData.catalog[0];
                const { post } = await handle(endpoints.create);
                const { onRequest } = post(data);

                let addItemBtn = await page.waitForSelector('text=Sell', { timeout: interval });
                await addItemBtn.click();

                let modelElement = await page.waitForSelector('[name="item"]', { timeout: interval });
                let imageElement = await page.waitForSelector('[name="imageUrl"]', { timeout: interval });
                let priceElement = await page.waitForSelector('[name="price"]', { timeout: interval });
                let weightElement = await page.waitForSelector('[name="availability"]', { timeout: interval });
                let speedElement = await page.waitForSelector('[name="type"]', { timeout: interval });
                let aboutElement = await page.waitForSelector('[name="description"]', { timeout: interval });
                let submitBtn = await page.waitForSelector('[type="submit"]', { timeout: interval });

                await modelElement.fill(data.item);
                await imageElement.fill(data.imageUrl);
                await priceElement.fill(data.price);
                await weightElement.fill(data.availability);
                await speedElement.fill(data.type);
                await aboutElement.fill(data.description);

                const [request] = await Promise.all([
                    onRequest(),
                    submitBtn.click(),
                ]);

                const token = request.headers()["x-authorization"];
                expect(token).to.equal(userData.accessToken, 'Request did not send correct authorization header');
            });

            it("Create redirects to dashboard on success [ 2.5 Points ]", async function () {
                //Login
                const userData = mockData.users[0];
                const { post: loginPost } = await handle(endpoints.login);
                loginPost(userData);
                await page.goto(host);
                let loginBtn = await page.waitForSelector('text=Login', { timeout: interval });
                await loginBtn.click();
                await page.waitForSelector("form", { timeout: interval });
                let emailElement = await page.waitForSelector('[name="email"]', { timeout: interval });
                let passwordElement = await page.waitForSelector('[name="password"]', { timeout: interval });
                await emailElement.fill(userData.email);
                await passwordElement.fill(userData.password);
                let loginSubmitBtn = await page.waitForSelector('[type="submit"]', { timeout: interval });
                await loginSubmitBtn.click();

                const { get: catalogGet } = await handle(endpoints.catalog);
                catalogGet(mockData.catalog);
                const data = mockData.catalog[0];
                const { post } = await handle(endpoints.create);
                const { onResponse } = post(data);

                let addItemBtn = await page.waitForSelector('text=Sell', { timeout: interval });
                await addItemBtn.click();

                let modelElement = await page.waitForSelector('[name="item"]', { timeout: interval });
                let imageElement = await page.waitForSelector('[name="imageUrl"]', { timeout: interval });
                let priceElement = await page.waitForSelector('[name="price"]', { timeout: interval });
                let weightElement = await page.waitForSelector('[name="availability"]', { timeout: interval });
                let speedElement = await page.waitForSelector('[name="type"]', { timeout: interval });
                let aboutElement = await page.waitForSelector('[name="description"]', { timeout: interval });
                let submitBtn = await page.waitForSelector('[type="submit"]', { timeout: interval });

                await modelElement.fill(data.item);
                await imageElement.fill(data.imageUrl);
                await priceElement.fill(data.price);
                await weightElement.fill(data.availability);
                await speedElement.fill(data.type);
                await aboutElement.fill(data.description);

                await Promise.all([
                    onResponse(),
                    submitBtn.click(),
                ]);

                await page.waitForSelector('#dashboard', {timeout: interval});
            });
        })

        describe('Details [ 10 Points ]', function () {
            it("Details calls the correct API [ 2.5 Points ]", async function () {
                await page.goto(host);

                const { get: catalogGet } = await handle(endpoints.catalog);
                catalogGet(mockData.catalog);

                const data = mockData.catalog[1];
                const { get } = await handle(endpoints.details(data._id));
                let { onResponse, isHandled } = get(data);


                let marketBtn = await page.waitForSelector('nav >> text=Market', { timeout: interval });
                await marketBtn.click();

                let moreInfoButton = await page.waitForSelector(`.item:has-text("${data.item}") >> .details-btn`, { timeout: interval });

                await Promise.all([
                    onResponse(),
                    moreInfoButton.click()
                ]);

                expect(isHandled()).to.equal(true, 'Details API did not receive a correct call');
            });

            it("Details with guest calls shows correct info [ 2.5 Points ]", async function () {
                await page.goto(host);

                const { get: catalogGet } = await handle(endpoints.catalog);
                catalogGet(mockData.catalog);

                const data = mockData.catalog[1];
                const { get } = await handle(endpoints.details(data._id));
                let { isHandled } = get(data);


                let marketBtn = await page.waitForSelector('nav >> text=Market', { timeout: interval });
                await marketBtn.click();

                let moreInfoButton = await page.waitForSelector(`.item:has-text("${data.item}") >> .details-btn`, { timeout: interval });
                await moreInfoButton.click();

                let imageElement = await page.waitForSelector('#details-img', { timeout: interval });
                let modelElement = await page.waitForSelector('#details-title', { timeout: interval });
                let priceElement = await page.waitForSelector('.details-price', { timeout: interval });
                let weightElement = await page.waitForSelector('.details-availability', { timeout: interval });
                let speedElement = await page.waitForSelector('.type', { timeout: interval });
                let aboutElement = await page.waitForSelector('#item-description', { timeout: interval });



                let imageSrc = await imageElement.getAttribute('src');
                let model = await modelElement.textContent();
                let price = await priceElement.textContent();
                let weight = await weightElement.textContent();
                let speed = await speedElement.textContent();
                let about = await aboutElement.textContent();


                expect(imageSrc).to.contains(data.imageUrl);
                expect(model).to.contains(data.item);
                expect(price).to.contains(data.price);
                expect(weight).to.contains(data.availability);
                expect(speed).to.contains(data.type);
                expect(about).to.contains(data.description);
                expect(await page.isVisible('#action-buttons >> text="Delete"')).to.equal(false, 'Delete button was visible for non owner');
                expect(await page.isVisible('#action-buttons >> text="Edit"')).to.equal(false, 'Edit button was visible for non-owner');

                expect(isHandled()).to.equal(true, 'Details API was not called');
            });

            it("Details with logged in user shows correct info [ 2.5 Points ]", async function () {
                //Login
                const userData = mockData.users[0];
                const { post } = await handle(endpoints.login);
                post(userData);
                await page.goto(host);
                let loginBtn = await page.waitForSelector('text=Login', { timeout: interval });
                await loginBtn.click();
                await page.waitForSelector("form", { timeout: interval });
                let emailElement = await page.waitForSelector('[name="email"]', { timeout: interval });
                let passwordElement = await page.waitForSelector('[name="password"]', { timeout: interval });
                await emailElement.fill(userData.email);
                await passwordElement.fill(userData.password);
                let loginSubmitBtn = await page.waitForSelector('[type="submit"]', { timeout: interval });
                await loginSubmitBtn.click();

                const { get: catalogGet } = await handle(endpoints.catalog);
                catalogGet(mockData.catalog);

                const data = mockData.catalog[0];
                const { get } = await handle(endpoints.details(data._id));
                let { isHandled } = get(data);

                let marketBtn = await page.waitForSelector('nav >> text=Market', { timeout: interval });
                await marketBtn.click();

                let moreInfoButton = await page.waitForSelector(`.item:has-text("${data.item}") >> .details-btn`, { timeout: interval });
                await moreInfoButton.click();

                let imageElement = await page.waitForSelector('#details-img', { timeout: interval });
                let modelElement = await page.waitForSelector('#details-title', { timeout: interval });
                let priceElement = await page.waitForSelector('.details-price', { timeout: interval });
                let weightElement = await page.waitForSelector('.details-availability', { timeout: interval });
                let speedElement = await page.waitForSelector('.type', { timeout: interval });
                let aboutElement = await page.waitForSelector('#item-description', { timeout: interval });


                let imageSrc = await imageElement.getAttribute('src');
                let model = await modelElement.textContent();
                let price = await priceElement.textContent();
                let weight = await weightElement.textContent();
                let speed = await speedElement.textContent();
                let about = await aboutElement.textContent();

                expect(imageSrc).to.contains(data.imageUrl);
                expect(model).to.contains(data.item);
                expect(price).to.contains(data.price);
                expect(weight).to.contains(data.availability);
                expect(speed).to.contains(data.type);
                expect(about).to.contains(data.description);
                expect(await page.isVisible('#action-buttons >> text="Delete"')).to.equal(false, 'Delete button was visible for non owner');
                expect(await page.isVisible('#action-buttons >> text="Edit"')).to.equal(false, 'Edit button was visible for non-owner');

                expect(isHandled()).to.equal(true, 'Details API was not called');
            });

            it("Details with owner shows correct info [ 2.5 Points ]", async function () {
                //Login
                const userData = mockData.users[1];
                const { post } = await handle(endpoints.login);
                post(userData);
                await page.goto(host);
                let loginBtn = await page.waitForSelector('text=Login', { timeout: interval });
                await loginBtn.click();
                await page.waitForSelector("form", { timeout: interval });
                let emailElement = await page.waitForSelector('[name="email"]', { timeout: interval });
                let passwordElement = await page.waitForSelector('[name="password"]', { timeout: interval });
                await emailElement.fill(userData.email);
                await passwordElement.fill(userData.password);
                let loginSubmitBtn = await page.waitForSelector('[type="submit"]', { timeout: interval });
                await loginSubmitBtn.click();

                const { get: catalogGet } = await handle(endpoints.catalog);
                catalogGet(mockData.catalog);

                const data = mockData.catalog[0];
                const { get } = await handle(endpoints.details(data._id));
                let { isHandled } = get(data);


                let marketBtn = await page.waitForSelector('nav >> text=Market', { timeout: interval });
                await marketBtn.click();

                let moreInfoButton = await page.waitForSelector(`.item:has-text("${data.item}") >> .details-btn`, { timeout: interval });
                await moreInfoButton.click();

                let imageElement = await page.waitForSelector('#details-img', { timeout: interval });
                let modelElement = await page.waitForSelector('#details-title', { timeout: interval });
                let priceElement = await page.waitForSelector('.details-price', { timeout: interval });
                let weightElement = await page.waitForSelector('.details-availability', { timeout: interval });
                let speedElement = await page.waitForSelector('.type', { timeout: interval });
                let aboutElement = await page.waitForSelector('#item-description', { timeout: interval });


                let imageSrc = await imageElement.getAttribute('src');
                let model = await modelElement.textContent();
                let price = await priceElement.textContent();
                let weight = await weightElement.textContent();
                let speed = await speedElement.textContent();
                let about = await aboutElement.textContent();

                expect(imageSrc).to.contains(data.imageUrl);
                expect(model).to.contains(data.item);
                expect(price).to.contains(data.price);
                expect(weight).to.contains(data.availability);
                expect(speed).to.contains(data.type);
                expect(about).to.contains(data.description)
                expect(await page.isVisible('#action-buttons >> text="Delete"')).to.equal(true, 'Delete button was NOT visible for owner');
                expect(await page.isVisible('#action-buttons >> text="Edit"')).to.equal(true, 'Edit button was NOT visible for owner');

                expect(isHandled()).to.equal(true, 'Details API was not called');
            });
        })

        describe('Edit [ 17.5 Points ]', function () {
            it("Edit calls correct API to populate info [ 2.5 Points ]", async function () {
                //Login
                const userData = mockData.users[1];
                const { post } = await handle(endpoints.login);
                post(userData);
                await page.goto(host);
                let loginBtn = await page.waitForSelector('text=Login', { timeout: interval });
                await loginBtn.click();
                await page.waitForSelector("form", { timeout: interval });
                let emailElement = await page.waitForSelector('[name="email"]', { timeout: interval });
                let passwordElement = await page.waitForSelector('[name="password"]', { timeout: interval });
                await emailElement.fill(userData.email);
                await passwordElement.fill(userData.password);
                let loginSubmitBtn = await page.waitForSelector('[type="submit"]', { timeout: interval });
                await loginSubmitBtn.click();

                const { get: catalogGet } = await handle(endpoints.catalog);
                catalogGet(mockData.catalog);

                const data = mockData.catalog[1];
                const { get } = await handle(endpoints.details(data._id));
                let { onResponse, isHandled } = get(data);


                const { get: own } = await handle(endpoints.own(data._id, userData._id));
                own(1);

                let marketBtn = await page.waitForSelector('nav >> text=Market', { timeout: interval });
                await marketBtn.click();

                let moreInfoButton = await page.waitForSelector(`.item:has-text("${data.item}") >> .details-btn`, { timeout: interval });
                await moreInfoButton.click();

                let editButton = await page.waitForSelector('#action-buttons >> text="Edit"', { timeout: interval });

                await Promise.all([
                    onResponse(),
                    editButton.click()
                ]);

                expect(isHandled()).to.equal(true, 'Request was not sent to Details API to get Edit information');
            });

            it("Edit should populate form with correct data [ 2.5 Points ]", async function () {
                //Login
                const userData = mockData.users[1];
                const { post } = await handle(endpoints.login);
                post(userData);
                await page.goto(host);
                let loginBtn = await page.waitForSelector('text=Login', { timeout: interval });
                await loginBtn.click();
                await page.waitForSelector("form", { timeout: interval });
                let emailElement = await page.waitForSelector('[name="email"]', { timeout: interval });
                let passwordElement = await page.waitForSelector('[name="password"]', { timeout: interval });
                await emailElement.fill(userData.email);
                await passwordElement.fill(userData.password);
                let loginSubmitBtn = await page.waitForSelector('[type="submit"]', { timeout: interval });
                await loginSubmitBtn.click();

                const { get: catalogGet } = await handle(endpoints.catalog);
                catalogGet(mockData.catalog);

                const data = mockData.catalog[1];
                const { get } = await handle(endpoints.details(data._id));
                get(data);

                const { get: own } = await handle(endpoints.own(data._id, userData._id));
                own(1);

                let marketBtn = await page.waitForSelector('nav >> text=Market', { timeout: interval });
                await marketBtn.click();

                let moreInfoButton = await page.waitForSelector(`.item:has-text("${data.item}") >> .details-btn`, { timeout: interval });
                await moreInfoButton.click();

                let editButton = await page.waitForSelector('#action-buttons >> text="Edit"', { timeout: interval });
                await editButton.click();

                await page.waitForSelector('.form .edit-form input', { timeout: interval });
                await page.waitForSelector('.edit-form textarea', { timeout: interval });

                const inputs = await page.$$eval(".form .edit-form input", (t) => t.map((i) => i.value));
                const textareas = await page.$$eval(".edit-form textarea", (t) => t.map((i) => i.value));

                expect(inputs[0]).to.contains(data.item);
                expect(inputs[1]).to.contains(data.imageUrl);
                expect(inputs[2]).to.contains(data.price);
                expect(inputs[3]).to.contains(data.availability);
                expect(inputs[4]).to.contains(data.type);
                expect(textareas[0]).to.contains(data.description);
            });

            it("Edit does NOT work with empty fields [ 2.5 Points ]", async function () {
                //Login
                const userData = mockData.users[0];
                const { post } = await handle(endpoints.login);
                post(userData);
                await page.goto(host);
                let loginBtn = await page.waitForSelector('text=Login', { timeout: interval });
                await loginBtn.click();
                await page.waitForSelector("form", { timeout: interval });
                let emailElement = await page.waitForSelector('[name="email"]', { timeout: interval });
                let passwordElement = await page.waitForSelector('[name="password"]', { timeout: interval });
                await emailElement.fill(userData.email);
                await passwordElement.fill(userData.password);
                let loginSubmitBtn = await page.waitForSelector('[type="submit"]', { timeout: interval });
                await loginSubmitBtn.click();

                const { get: catalogGet } = await handle(endpoints.catalog);
                catalogGet(mockData.catalog);

                const data = mockData.catalog[2];
                const { get, put } = await handle(endpoints.details(data._id));
                get(data);
                const { isHandled } = put();


                const { get: own } = await handle(endpoints.own(data._id, userData._id));
                own(1);

                let marketBtn = await page.waitForSelector('nav >> text=Market', { timeout: interval });
                await marketBtn.click();

                let moreInfoButton = await page.waitForSelector(`.item:has-text("${data.item}") >> .details-btn`, { timeout: interval });
                await moreInfoButton.click();

                let editButton = await page.waitForSelector('#action-buttons >> text="Edit"', { timeout: interval });
                await editButton.click();

                let modelInput = await page.waitForSelector('[name="item"]', { timeout: interval });
                let imageInput = await page.waitForSelector('[name="imageUrl"]', { timeout: interval });
                let yearInput = await page.waitForSelector('[name="price"]', { timeout: interval });
                let mileageInput = await page.waitForSelector('[name="availability"]', { timeout: interval });
                let contactInput = await page.waitForSelector('[name="type"]', { timeout: interval });
                let aboutInput = await page.waitForSelector('[name="description"]', { timeout: interval });

                await modelInput.fill('');
                await imageInput.fill('');
                await yearInput.fill('');
                await mileageInput.fill('');
                await contactInput.fill('');
                await aboutInput.fill('');


                let submitBtn = await page.waitForSelector('[type="submit"]', { timeout: interval });
                await submitBtn.click();

                await page.waitForTimeout(interval);
                expect(isHandled()).to.equal(false, 'Edit API was called when form inputs were empty');
            });

            it("Edit sends information to the right API [ 2.5 Points ]", async function () {
                //Login
                const userData = mockData.users[0];
                const { post } = await handle(endpoints.login);
                post(userData);
                await page.goto(host);
                let loginBtn = await page.waitForSelector('text=Login', { timeout: interval });
                await loginBtn.click();
                await page.waitForSelector("form", { timeout: interval });
                let emailElement = await page.waitForSelector('[name="email"]', { timeout: interval });
                let passwordElement = await page.waitForSelector('[name="password"]', { timeout: interval });
                await emailElement.fill(userData.email);
                await passwordElement.fill(userData.password);
                let loginSubmitBtn = await page.waitForSelector('[type="submit"]', { timeout: interval });
                await loginSubmitBtn.click();

                const { get: catalogGet } = await handle(endpoints.catalog);
                catalogGet(mockData.catalog);

                const data = mockData.catalog[2];
                const modifiedData = Object.assign({}, data);
                modifiedData.item = 'Model Test';
                modifiedData.imageUrl = 'Image Test';
                modifiedData.price = '1';
                modifiedData.availability = '1';
                modifiedData.type = '1';
                modifiedData.description = 'About Test';


                const { get, put } = await handle(endpoints.details(data._id));
                get(data);
                const { isHandled, onResponse } = put(modifiedData);

                const { get: own } = await handle(endpoints.own(data._id, userData._id));
                own(1);

                let marketBtn = await page.waitForSelector('nav >> text=Market', { timeout: interval });
                await marketBtn.click();

                let moreInfoButton = await page.waitForSelector(`.item:has-text("${data.item}") >> .details-btn`, { timeout: interval });
                await moreInfoButton.click();

                let editButton = await page.waitForSelector('#action-buttons >> text="Edit"', { timeout: interval });
                await editButton.click();

                let modelInput = await page.waitForSelector('[name="item"]', { timeout: interval });
                let imageInput = await page.waitForSelector('[name="imageUrl"]', { timeout: interval });
                let yearInput = await page.waitForSelector('[name="price"]', { timeout: interval });
                let mileageInput = await page.waitForSelector('[name="availability"]', { timeout: interval });
                let contactInput = await page.waitForSelector('[name="type"]', { timeout: interval });
                let aboutInput = await page.waitForSelector('[name="description"]', { timeout: interval });

                await modelInput.fill(modifiedData.item);
                await imageInput.fill(modifiedData.imageUrl);
                await yearInput.fill(modifiedData.price);
                await mileageInput.fill(modifiedData.availability);
                await contactInput.fill(modifiedData.type);
                await aboutInput.fill(modifiedData.description);

                let submitBtn = await page.waitForSelector('[type="submit"]', { timeout: interval });

                await Promise.all([
                    onResponse(),
                    submitBtn.click(),
                ]);

                expect(isHandled()).to.equal(true, 'The Edit API was not called');
            });

            it("Edit sends correct headers [ 2.5 Points ]", async function () {
                //Login
                const userData = mockData.users[0];
                const { post } = await handle(endpoints.login);
                post(userData);
                await page.goto(host);
                let loginBtn = await page.waitForSelector('text=Login', { timeout: interval });
                await loginBtn.click();
                await page.waitForSelector("form", { timeout: interval });
                let emailElement = await page.waitForSelector('[name="email"]', { timeout: interval });
                let passwordElement = await page.waitForSelector('[name="password"]', { timeout: interval });
                await emailElement.fill(userData.email);
                await passwordElement.fill(userData.password);
                let loginSubmitBtn = await page.waitForSelector('[type="submit"]', { timeout: interval });
                await loginSubmitBtn.click();

                const { get: catalogGet } = await handle(endpoints.catalog);
                catalogGet(mockData.catalog);
                const data = mockData.catalog[2];
                const modifiedData = Object.assign({}, data);
                modifiedData.item = 'Model Test';
                modifiedData.imageUrl = 'Image Test';
                modifiedData.price = '1';
                modifiedData.availability = '1';
                modifiedData.type = '1';
                modifiedData.description = 'About Test';

                const { get, put } = await handle(endpoints.details(data._id));
                get(data);
                const { onRequest } = put(modifiedData);


                const { get: own } = await handle(endpoints.own(data._id, userData._id));
                own(1);

                let marketBtn = await page.waitForSelector('nav >> text=Market', { timeout: interval });
                await marketBtn.click();

                let moreInfoButton = await page.waitForSelector(`.item:has-text("${data.item}") >> .details-btn`, { timeout: interval });
                await moreInfoButton.click();

                let editButton = await page.waitForSelector('#action-buttons >> text="Edit"', { timeout: interval });
                await editButton.click();

               
                let modelInput = await page.waitForSelector('[name="item"]', { timeout: interval });
                let imageInput = await page.waitForSelector('[name="imageUrl"]', { timeout: interval });
                let yearInput = await page.waitForSelector('[name="price"]', { timeout: interval });
                let mileageInput = await page.waitForSelector('[name="availability"]', { timeout: interval });
                let contactInput = await page.waitForSelector('[name="type"]', { timeout: interval });
                let aboutInput = await page.waitForSelector('[name="description"]', { timeout: interval });

                await modelInput.fill(modifiedData.item);
                await imageInput.fill(modifiedData.imageUrl);
                await yearInput.fill(modifiedData.price);
                await mileageInput.fill(modifiedData.availability);
                await contactInput.fill(modifiedData.type);
                await aboutInput.fill(modifiedData.description);


                let submitBtn = await page.waitForSelector('[type="submit"]', { timeout: interval });

                let [request] = await Promise.all([
                    onRequest(),
                    submitBtn.click(),
                ]);

                const token = request.headers()["x-authorization"];
                expect(token).to.equal(userData.accessToken, 'Request did not send correct authorization header');
            });

            it("Edit sends correct information [ 2.5 Points ]", async function () {
                //Login
                const userData = mockData.users[0];
                const { post } = await handle(endpoints.login);
                post(userData);
                await page.goto(host);
                let loginBtn = await page.waitForSelector('text=Login', { timeout: interval });
                await loginBtn.click();
                await page.waitForSelector("form", { timeout: interval });
                let emailElement = await page.waitForSelector('[name="email"]', { timeout: interval });
                let passwordElement = await page.waitForSelector('[name="password"]', { timeout: interval });
                await emailElement.fill(userData.email);
                await passwordElement.fill(userData.password);
                let loginSubmitBtn = await page.waitForSelector('[type="submit"]', { timeout: interval });
                await loginSubmitBtn.click();

                const { get: catalogGet } = await handle(endpoints.catalog);
                catalogGet(mockData.catalog);
                const data = mockData.catalog[2];
                const modifiedData = Object.assign({}, data);
            modifiedData.item = 'Model Test';
                modifiedData.imageUrl = 'Image Test';
                modifiedData.price = '1';
                modifiedData.availability = '1';
                modifiedData.type = '1';
                modifiedData.description = 'About Test';

                const { get, put } = await handle(endpoints.details(data._id));
                get(data);
                const { onRequest } = put(modifiedData);


                const { get: own } = await handle(endpoints.own(data._id, userData._id));
                own(1);

                let marketBtn = await page.waitForSelector('nav >> text=Market', { timeout: interval });
                await marketBtn.click();

                let moreInfoButton = await page.waitForSelector(`.item:has-text("${data.item}") >> .details-btn`, { timeout: interval });
                await moreInfoButton.click();

                let editButton = await page.waitForSelector('#action-buttons >> text="Edit"', { timeout: interval });
                await editButton.click();

                let modelInput = await page.waitForSelector('[name="item"]', { timeout: interval });
                let imageInput = await page.waitForSelector('[name="imageUrl"]', { timeout: interval });
                let yearInput = await page.waitForSelector('[name="price"]', { timeout: interval });
                let mileageInput = await page.waitForSelector('[name="availability"]', { timeout: interval });
                let contactInput = await page.waitForSelector('[name="type"]', { timeout: interval });
                let aboutInput = await page.waitForSelector('[name="description"]', { timeout: interval });

                await modelInput.fill(modifiedData.item);
                await imageInput.fill(modifiedData.imageUrl);
                await yearInput.fill(modifiedData.price);
                await mileageInput.fill(modifiedData.availability);
                await contactInput.fill(modifiedData.type);
                await aboutInput.fill(modifiedData.description);


                let submitBtn = await page.waitForSelector('[type="submit"]', { timeout: interval });

                const [request] = await Promise.all([
                    onRequest(),
                    submitBtn.click(),
                ]);

                const postData = JSON.parse(request.postData());

                expect(postData.item).to.contains(modifiedData.item);
                expect(postData.imageUrl).to.contains(modifiedData.imageUrl);
                expect(postData.price).to.contains(modifiedData.price);
                expect(postData.availability).to.contains(modifiedData.availability);
                expect(postData.type).to.contains(modifiedData.type);
                expect(postData.description).to.contains(modifiedData.description);
            });

            it("Edit redirects to Details on success [ 2.5 Points ]", async function () {
                //Login
                const userData = mockData.users[0];
                const { post } = await handle(endpoints.login);
                post(userData);
                await page.goto(host);
                let loginBtn = await page.waitForSelector('text=Login', { timeout: interval });
                await loginBtn.click();
                await page.waitForSelector("form", { timeout: interval });
                let emailElement = await page.waitForSelector('[name="email"]', { timeout: interval });
                let passwordElement = await page.waitForSelector('[name="password"]', { timeout: interval });
                await emailElement.fill(userData.email);
                await passwordElement.fill(userData.password);
                let loginSubmitBtn = await page.waitForSelector('[type="submit"]', { timeout: interval });
                await loginSubmitBtn.click();

                const { get: catalogGet } = await handle(endpoints.catalog);
                catalogGet(mockData.catalog);
                const data = mockData.catalog[2];
                const modifiedData = Object.assign({}, data);
                modifiedData.item = 'Model Test';
                modifiedData.imageUrl = 'Image Test';
                modifiedData.price = '1';
                modifiedData.availability = '1';
                modifiedData.type = '1';
                modifiedData.description = 'About Test';

                const { get, put } = await handle(endpoints.details(data._id));
                get(data);
                const { onResponse } = put(modifiedData);


                const { get: own } = await handle(endpoints.own(data._id, userData._id));
                own(1);

                let marketBtn = await page.waitForSelector('nav >> text=Market', { timeout: interval });
                await marketBtn.click();

                let moreInfoButton = await page.waitForSelector(`.item:has-text("${data.item}") >> .details-btn`, { timeout: interval });
                await moreInfoButton.click();

                let editButton = await page.waitForSelector('#action-buttons >> text="Edit"', { timeout: interval });
                await editButton.click();

              
                let modelInput = await page.waitForSelector('[name="item"]', { timeout: interval });
                let imageInput = await page.waitForSelector('[name="imageUrl"]', { timeout: interval });
                let yearInput = await page.waitForSelector('[name="price"]', { timeout: interval });
                let mileageInput = await page.waitForSelector('[name="availability"]', { timeout: interval });
                let contactInput = await page.waitForSelector('[name="type"]', { timeout: interval });
                let aboutInput = await page.waitForSelector('[name="description"]', { timeout: interval });

                await modelInput.fill(modifiedData.item);
                await imageInput.fill(modifiedData.imageUrl);
                await yearInput.fill(modifiedData.price);
                await mileageInput.fill(modifiedData.availability);
                await contactInput.fill(modifiedData.type);
                await aboutInput.fill(modifiedData.description);

                let submitBtn = await page.waitForSelector('[type="submit"]', { timeout: interval });

                await Promise.all([
                    onResponse(),
                    submitBtn.click(),
                ]);

                await page.waitForSelector('#details', {timeout: interval});
            });
        })

        describe('Delete [ 10 Points ]', function () {
            it("Delete makes correct API call [ 2.5 Points ]", async function () {
                //Login
                const userData = mockData.users[0];
                const { post } = await handle(endpoints.login);
                post(userData);
                await page.goto(host);
                let loginBtn = await page.waitForSelector('text=Login', { timeout: interval });
                await loginBtn.click();
                await page.waitForSelector("form", { timeout: interval });
                let emailElement = await page.waitForSelector('[name="email"]', { timeout: interval });
                let passwordElement = await page.waitForSelector('[name="password"]', { timeout: interval });
                await emailElement.fill(userData.email);
                await passwordElement.fill(userData.password);
                let loginSubmitBtn = await page.waitForSelector('[type="submit"]', { timeout: interval });
                await loginSubmitBtn.click();
                const data = mockData.catalog[2];

                const { get: catalogGet } = await handle(endpoints.catalog);
                catalogGet(mockData.catalog);
                const { get, del } = await handle(endpoints.details(data._id));
                get(data);
                const { onRequest, onResponse, isHandled } = del({ "_deletedOn": 1688586307461 });


                const { get: own } = await handle(endpoints.own(data._id, userData._id));
                own(1);

                let marketBtn = await page.waitForSelector('nav >> text=Market', { timeout: interval });
                await marketBtn.click();

                let moreInfoButton = await page.waitForSelector(`.item:has-text("${data.item}") >> .details-btn`, { timeout: interval });
                await moreInfoButton.click();

                let deleteButton = await page.waitForSelector('#action-buttons >> text="Delete"', { timeout: interval });

                page.on('dialog', (dialog) => dialog.accept());

                let [request] = await Promise.all([onRequest(), onResponse(), deleteButton.click()]);

                const token = request.headers()["x-authorization"];
                expect(token).to.equal(userData.accessToken, 'Request did not send correct authorization header');
                expect(isHandled()).to.be.true;
            });

            it("Delete shows a confirm dialog [ 2.5 Points ]", async function () {
                //Login
                const userData = mockData.users[0];
                const { post } = await handle(endpoints.login);
                post(userData);
                await page.goto(host);
                let loginBtn = await page.waitForSelector('text=Login', { timeout: interval });
                await loginBtn.click();
                await page.waitForSelector("form", { timeout: interval });
                let emailElement = await page.waitForSelector('[name="email"]', { timeout: interval });
                let passwordElement = await page.waitForSelector('[name="password"]', { timeout: interval });
                await emailElement.fill(userData.email);
                await passwordElement.fill(userData.password);
                let loginSubmitBtn = await page.waitForSelector('[type="submit"]', { timeout: interval });
                await loginSubmitBtn.click();
                const data = mockData.catalog[2];

                const { get: catalogGet } = await handle(endpoints.catalog);
                catalogGet(mockData.catalog);
                const { get, del } = await handle(endpoints.details(data._id));
                get(data);
                const { onResponse, isHandled } = del({ "_deletedOn": 1688586307461 });


                const { get: own } = await handle(endpoints.own(data._id, userData._id));
                own(1);

                let marketBtn = await page.waitForSelector('nav >> text=Market', { timeout: interval });
                await marketBtn.click();

                let moreInfoButton = await page.waitForSelector(`.item:has-text("${data.item}") >> .details-btn`, { timeout: interval });
                await moreInfoButton.click();

                let deleteButton = await page.waitForSelector('#action-buttons >> text="Delete"', { timeout: interval });

                let alertPromise = new Promise(resolve => {
                    page.on('dialog', (dialog) => {
                        dialog.accept();
                        resolve(dialog.type());
                    });
                });

                let result = await Promise.all([alertPromise, onResponse(), deleteButton.click()]);
                expect(result[0]).to.equal('confirm');
            });

            it("Delete redirects to Dashboard on confirm accept [ 2.5 Points ]", async function () {
                //Login
                const userData = mockData.users[0];
                const { post } = await handle(endpoints.login);
                post(userData);
                await page.goto(host);
                let loginBtn = await page.waitForSelector('text=Login', { timeout: interval });
                await loginBtn.click();
                await page.waitForSelector("form", { timeout: interval });
                let emailElement = await page.waitForSelector('[name="email"]', { timeout: interval });
                let passwordElement = await page.waitForSelector('[name="password"]', { timeout: interval });
                await emailElement.fill(userData.email);
                await passwordElement.fill(userData.password);
                let loginSubmitBtn = await page.waitForSelector('[type="submit"]', { timeout: interval });
                await loginSubmitBtn.click();
                const data = mockData.catalog[2];

                const { get: catalogGet } = await handle(endpoints.catalog);
                catalogGet(mockData.catalog);
                const { get, del } = await handle(endpoints.details(data._id));
                get(data);
                const { onResponse, isHandled } = del({ "_deletedOn": 1688586307461 });

                const { get: own } = await handle(endpoints.own(data._id, userData._id));
                own(1);

                let marketBtn = await page.waitForSelector('nav >> text=Market', { timeout: interval });
                await marketBtn.click();

                let moreInfoButton = await page.waitForSelector(`.item:has-text("${data.item}") >> .details-btn`, { timeout: interval });
                await moreInfoButton.click();

                let deleteButton = await page.waitForSelector('#action-buttons >> text="Delete"', { timeout: interval });

                let alertPromise = new Promise(resolve => {
                    page.on('dialog', (dialog) => {
                        dialog.accept();
                        resolve(dialog.type());
                    });
                });

                await Promise.all([alertPromise, onResponse(), deleteButton.click()]);

                await page.waitForSelector('#dashboard', { timeout: interval });
            });

            it("Delete does not delete on confirm reject [ 2.5 Points ]", async function () {
                //Login
                const userData = mockData.users[0];
                const { post } = await handle(endpoints.login);
                post(userData);
                await page.goto(host);
                let loginBtn = await page.waitForSelector('text=Login', { timeout: interval });
                await loginBtn.click();
                await page.waitForSelector("form", { timeout: interval });
                let emailElement = await page.waitForSelector('[name="email"]', { timeout: interval });
                let passwordElement = await page.waitForSelector('[name="password"]', { timeout: interval });
                await emailElement.fill(userData.email);
                await passwordElement.fill(userData.password);
                let loginSubmitBtn = await page.waitForSelector('[type="submit"]', { timeout: interval });
                await loginSubmitBtn.click();
                const data = mockData.catalog[2];

                const { get: catalogGet } = await handle(endpoints.catalog);
                catalogGet(mockData.catalog);
                const { get, del } = await handle(endpoints.details(data._id));
                get(data);
                const { isHandled } = del({ "_deletedOn": 1688586307461 });

                const { get: own } = await handle(endpoints.own(data._id, userData._id));
                own(1);

                let marketBtn = await page.waitForSelector('nav >> text=Market', { timeout: interval });
                await marketBtn.click();

                let moreInfoButton = await page.waitForSelector(`.item:has-text("${data.item}") >> .details-btn`, { timeout: interval });
                await moreInfoButton.click();

                let deleteButton = await page.waitForSelector('#action-buttons >> text="Delete"', { timeout: interval });

                let alertPromise = new Promise(resolve => {
                    page.on('dialog', (dialog) => {
                        dialog.dismiss();
                        resolve(dialog.type());
                    });
                });

                await Promise.all([alertPromise, deleteButton.click()]);
                expect(isHandled()).to.equal(false, 'Delete API was called when the confirm dialog not accepted');

                //Check if we're still on Details page
                await page.waitForSelector('#details', { timeout: interval });
            });
        })
    });
    describe('BONUS: Notifications [ 10 Points ]', () => {
        it('Notification with invalid data [ 2.5 Points ]', async () => {
            const endpoint = '**' + endpoints.login;
            let called = false;
            page.route(endpoint, route => called = true);

            await page.goto(host);
            await page.click(' text="Login"');

            await page.waitForTimeout(300);
            await page.waitForSelector('form');

            const preClickNotification = await page.isVisible('#errorBox');
            expect(preClickNotification).to.be.false;

            await page.click('[type="submit"]');
            await page.waitForTimeout(300);

            const notification = await page.isVisible('#errorBox');
            expect(notification).to.be.true;

        });

        it('Login notification with invalid data [ 2.5 Points ]', async () => {
            const endpoint = '**' + endpoints.login;
            let called = false;
            page.route(endpoint, route => called = true);

            await page.goto(host);
            await page.click(' text="Login"');

            await page.waitForTimeout(300);
            await page.waitForSelector('form');

            const preClickNotification = await page.isVisible('#errorBox');
            expect(preClickNotification).to.be.false;

            await page.click('[type="submit"]');
            await page.waitForTimeout(300);

            const notification = await page.isVisible('#errorBox');
            expect(notification).to.be.true;

        });

        it('Register notification with invalid data [ 2.5 Points ]', async () => {
            const endpoint = '**' + endpoints.register;
            let called = false;
            page.route(endpoint, route => called = true);

            await page.goto(host);
            await page.click('text="Register"');

            await page.waitForTimeout(300);
            await page.waitForSelector('form');

            const preClickNotification = await page.isVisible('#errorBox');
            expect(preClickNotification).to.be.false;

            await page.click('[type="submit"]');
            await page.waitForTimeout(300);

            const notification = await page.isVisible('#errorBox');
            expect(notification).to.be.true;
        });

        it('Notification with invalid data 2 [ 2.5 Points ]', async () => {
            const endpoint = '**' + endpoints.register;
            let called = false;
            page.route(endpoint, route => called = true);

            await page.goto(host);
            await page.click('text="Register"');

            await page.waitForTimeout(300);
            await page.waitForSelector('form');

            const preClickNotification = await page.isVisible('#errorBox');
            expect(preClickNotification).to.be.false;

            await page.click('[type="submit"]');
            await page.waitForTimeout(300);

            const notification = await page.isVisible('#errorBox');
            expect(notification).to.be.true;
        });

        it('Create notification with invalid data [ 2.5 Points ]', async () => {
            //Login
            const userData = mockData.users[0];
            const { post: loginPost } = await handle(endpoints.login);
            loginPost(userData);
            await page.goto(host);
            let loginBtn = await page.waitForSelector('text=Login', { timeout: interval });
            await loginBtn.click();
            await page.waitForSelector("form", { timeout: interval });
            let emailElement = await page.waitForSelector('[name="email"]', { timeout: interval });
            let passwordElement = await page.waitForSelector('[name="password"]', { timeout: interval });
            await emailElement.fill(userData.email);
            await passwordElement.fill(userData.password);
            let loginSubmitBtn = await page.waitForSelector('[type="submit"]', { timeout: interval });
            await loginSubmitBtn.click();

            const data = mockData.catalog[0];
            const { post } = await handle(endpoints.create);
            const { onRequest } = post(data);

            let addItemBtn = await page.waitForSelector('text=Sell', { timeout: interval });
            await addItemBtn.click();

            await page.waitForTimeout(300);

            const preClickNotification = await page.isVisible('#errorBox');
            expect(preClickNotification).to.be.false;

            await page.click('[type="submit"]');
            await page.waitForTimeout(300);

            const notification = await page.isVisible('#errorBox');
            expect(notification).to.be.true;
        });
        
        it('Edit notification with invalid data [ 2.5 Points ]', async () => {
       //Login
       const userData = mockData.users[0];
       const { post } = await handle(endpoints.login);
       post(userData);
       await page.goto(host);
       let loginBtn = await page.waitForSelector('text=Login', { timeout: interval });
       await loginBtn.click();
       await page.waitForSelector("form", { timeout: interval });
       let emailElement = await page.waitForSelector('[name="email"]', { timeout: interval });
       let passwordElement = await page.waitForSelector('[name="password"]', { timeout: interval });
       await emailElement.fill(userData.email);
       await passwordElement.fill(userData.password);
       let loginSubmitBtn = await page.waitForSelector('[type="submit"]', { timeout: interval });
       await loginSubmitBtn.click();

       const { get: catalogGet } = await handle(endpoints.catalog);
       catalogGet(mockData.catalog);

       const data = mockData.catalog[2];
       const modifiedData = Object.assign({}, data);
       modifiedData.item = 'Model Test';
       modifiedData.imageUrl = 'Image Test';
       modifiedData.price = '1';
       modifiedData.availability = '1';
       modifiedData.type = '1';
       modifiedData.description = '';


       const { get, put } = await handle(endpoints.details(data._id));
       get(data);
       const { isHandled, onResponse } = put(modifiedData);

       const { get: own } = await handle(endpoints.own(data._id, userData._id));
       own(1);

       let marketBtn = await page.waitForSelector('nav >> text=Market', { timeout: interval });
       await marketBtn.click();

       let moreInfoButton = await page.waitForSelector(`.item:has-text("${data.item}") >> .details-btn`, { timeout: interval });
       await moreInfoButton.click();

       let editButton = await page.waitForSelector('#action-buttons >> text="Edit"', { timeout: interval });
       await editButton.click();

       let modelInput = await page.waitForSelector('[name="item"]', { timeout: interval });
       let imageInput = await page.waitForSelector('[name="imageUrl"]', { timeout: interval });
       let yearInput = await page.waitForSelector('[name="price"]', { timeout: interval });
       let mileageInput = await page.waitForSelector('[name="availability"]', { timeout: interval });
       let contactInput = await page.waitForSelector('[name="type"]', { timeout: interval });
       let aboutInput = await page.waitForSelector('[name="description"]', { timeout: interval });

       await modelInput.fill(modifiedData.item);
       await imageInput.fill(modifiedData.imageUrl);
       await yearInput.fill(modifiedData.price);
       await mileageInput.fill(modifiedData.availability);
       await contactInput.fill(modifiedData.type);
       await aboutInput.fill(modifiedData.description);

       let submitBtn = await page.waitForSelector('[type="submit"]', { timeout: interval });

       await Promise.all([
           submitBtn.click(),
       ]);
            await page.waitForTimeout(300);

            const notification = await page.isVisible('#errorBox');
            expect(notification).to.be.true;
        });
    });
});

async function setupContext(context) {
    // Block external calls
    await context.route(
        (url) => url.href.slice(0, host.length) != host,
        (route) => {
            if (DEBUG) {
                console.log("Preventing external call to " + route.request().url());
            }
            route.abort();
        }
    );
}

function handle(match, handlers) {
    return handleRaw.call(page, match, handlers);
}

function handleContext(context, match, handlers) {
    return handleRaw.call(context, match, handlers);
}

async function handleRaw(match, handlers) {
    const methodHandlers = {};
    const result = {
        get: (returns, options) => request("GET", returns, options),
        post: (returns, options) => request("POST", returns, options),
        put: (returns, options) => request("PUT", returns, options),
        patch: (returns, options) => request("PATCH", returns, options),
        del: (returns, options) => request("DELETE", returns, options),
        delete: (returns, options) => request("DELETE", returns, options),
    };

    const context = this;

    await context.route(urlPredicate, (route, request) => {
        if (DEBUG) {
            console.log(">>>", request.method(), request.url());
        }

        const handler = methodHandlers[request.method().toLowerCase()];
        if (handler == undefined) {
            route.continue();
        } else {
            handler(route, request);
        }
    });

    if (handlers) {
        for (let method in handlers) {
            if (typeof handlers[method] == "function") {
                handlers[method](result[method]);
            } else {
                result[method](handlers[method]);
            }
        }
    }

    return result;

    function request(method, returns, options) {
        let handled = false;

        methodHandlers[method.toLowerCase()] = (route, request) => {
            handled = true;
            route.fulfill(respond(returns, options));
        };

        return {
            onRequest: () => context.waitForRequest(urlPredicate),
            onResponse: () => context.waitForResponse(urlPredicate),
            isHandled: () => handled,
        };
    }

    function urlPredicate(current) {
        if (current instanceof URL) {
            return current.href.toLowerCase().endsWith(match.toLowerCase());
        } else {
            return current.url().toLowerCase().endsWith(match.toLowerCase());
        }
    }
}

function respond(data, options = {}) {
    options = Object.assign(
        {
            json: true,
            status: 200,
        },
        options
    );

    const headers = {
        "Access-Control-Allow-Origin": "*",
    };
    if (options.json) {
        headers["Content-Type"] = "application/json";
        data = JSON.stringify(data);
    }

    return {
        status: options.status,
        headers,
        body: data,
    };
}