const { chromium } = require('playwright-chromium');
const { expect } = require('chai');

const host = "http://localhost:3000"; // Application host (NOT service host - that can be anything)
const interval = 3000;
const timeout = 5000;
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
            "model": "TEST-DJI Avata",
            "imageUrl": "/images/avata2.jpg",
            "price": "450",
            "condition": "New",
            "weight": "410",
            "phone": "0987654321",
            "description": "TEST-The DJI Avata is an innovative FPV (First-Person View) drone designed for immersive flying experiences. With a compact and robust design, it features a 4K camera capable of capturing stunning aerial footage at 60 fps. Equipped with advanced stabilization technology, the Avata ensures smooth video even in dynamic environments.",
            "_createdOn": 1617194210928
        },
        {
            "_id": "1002",
            "_ownerId": "0002",
            "model": "TEST-DJI Inspire 3",
            "imageUrl": "/images/inspire3.jpg",
            "price": "9999",
            "condition": "Used",
            "weight": "3995",
            "phone": "0983244321",
            "description": "TEST-The DJI Inspire 3 is a professional-grade aerial platform designed for filmmakers and content creators. Featuring an 8K camera with a large 4/3 CMOS sensor, it delivers breathtakingly high-resolution video and stunning low-light performance. The Inspire 3 boasts advanced AI capabilities and intelligent flight modes.",
            "_createdOn": 1617194295474
        },
        {
            "_id": "1001",
            "_ownerId": "0001",
            "model": "TEST-DJI Mini 3 Pro",
            "imageUrl": "/images/mini3.png",
            "price": "520",
            "condition": "New",
            "weight": "249",
            "phone": "0984234321",
            "description": "TEST-The DJI Mini 3 Pro is a lightweight and compact drone that combines advanced features with user-friendly controls, making it perfect for both beginners and experienced pilots. Weighing just 249 grams, it boasts an impressive 4K HDR camera with a 1/1.3-inch sensor, enabling stunning image quality and vibrant colors.",
            "_createdOn": 1617194295480
        }
    ]


};
const endpoints = {
    register: "/users/register",
    login: "/users/login",
    logout: "/users/logout",
    catalog: "/data/drones?sortBy=_createdOn%20desc",
    create: "/data/drones",
    details: (id) => `/data/drones/${id}`,
    delete: (id) => `/data/drones/${id}`,
    own: (itemId, userId) => `/data/drones?where=_id%3D%22${itemId}%22%20and%20_ownerId%3D%22${userId}%22&count`,

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

            await page.click('text=Login', { timeout: interval });

            await page.waitForSelector("form", { timeout: interval });

            await page.waitForSelector("form", { timeout: interval });
            await page.click('[type="submit"]', { timeout: interval });

            expect(isCalled()).to.equal(false, 'Login API was called when form inputs were empty');
        });

        it("Login with valid input makes correct API call [ 2.5 Points ]", async function () {
            const userData = mockData.users[0];
            const { post } = await handle(endpoints.login);
            const { onRequest } = post(userData);

            await page.goto(host);

            await page.click('text=Login', { timeout: interval });

            await page.waitForSelector("form", { timeout: interval });

            //Can check using Ids if they are part of the provided HTML
            await page.waitForSelector("form", { timeout: interval });

            await page.fill('[name="email"]', userData.email, { timeout: interval })
            await page.fill('[name="password"]', userData.password, { timeout: interval })

            const [request] = await Promise.all([
                onRequest(),
                page.click('[type="submit"]'),
            ]);

            const postData = JSON.parse(request.postData());
            expect(postData.email).to.equal(userData.email);
            expect(postData.password).to.equal(userData.password);
        });


        it("Login shows alert on fail and does not redirect [ 2.5 Points ]", async function () {
            const userData = mockData.users[0];
            const { post } = await handle(endpoints.login);
            let options = { json: true, status: 400 };
            const { onResponse } = post({ message: 'Error 400' }, options);

            await page.goto(host);

            await page.click('text=Login', { timeout: interval });

            await page.waitForSelector("form", { timeout: interval });

            await page.waitForSelector('form', { timeout: interval });

            await page.fill('[name="email"]', userData.email, { timeout: interval })
            await page.fill('[name="password"]', userData.password, { timeout: interval })

            // Prepare for alert dialog or span with error message
            let alertPromise = new Promise(resolve => {
                page.on('dialog', async dialog => {
                    await dialog.accept();
                    resolve({ type: dialog.type() });
                });
            });
            let errorMessageSpanPromise = page.waitForSelector('.notification', { state: 'visible', timeout: interval })
                .then(() => page.$eval('.msg', el => el.textContent))
                .then(text => ({ type: 'error-span', message: text })) // Ensure consistent type
                .catch(() => ({ type: 'none' })); // In case no notification appears

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
            const userData = mockData.users[1];

            await page.goto(host);

            await page.click('text=Register', { timeout: interval });

            await page.waitForSelector("form", { timeout: interval });

            await page.fill('[name="email"]', userData.email, { timeout: interval })
            await page.fill('[name="password"]', userData.password, { timeout: interval })
            await page.fill('[name="re-password"]', 'nope', { timeout: interval })


            // Prepare for alert dialog
            let alertPromise = new Promise(resolve => {
                page.on('dialog', async dialog => {
                    await dialog.accept();
                    resolve({ type: 'alert', message: dialog.message() });
                });
            }).catch(() => ({ type: 'none' })); 


            let notificationPromise = page.waitForSelector('.notification', { state: 'visible', timeout: 5000 })
                .then(() => page.$eval('.msg', el => el.textContent))
                .then(text => ({ type: 'notification', message: text }))
                .catch(() => ({ type: 'none' })); 


                await page.click('[type="submit"]', { timeout: interval });

            let errorIndicator = await Promise.race([alertPromise, notificationPromise]);
            if (errorIndicator.type === 'alert') {
                expect(errorIndicator.message).to.include('Passwords don\'t match');
            } else if (errorIndicator.type === 'notification') {
                expect(errorIndicator.message).to.include('Passwords don\'t match');
            } else {
                throw new Error('No error indication received');
            }

        });



        it("Register does NOT work with empty fields [ 2.5 Points ]", async function () {
            const { post } = await handle(endpoints.register);
            const isCalled = post().isHandled;

            await page.goto(host);

            await page.click('text=Register', { timeout: interval });

            await page.waitForSelector("form", { timeout: interval });
            await page.click('[type="submit"]', { timeout: interval });

            expect(isCalled()).to.be.false;
        });

        it("Register with valid input makes correct API call [ 2.5 Points ]", async function () {
            const userData = mockData.users[1];
            const { post } = await handle(endpoints.register);
            const { onRequest } = post(userData);

            await page.goto(host);

            await page.click('text=Register', { timeout: interval });

            await page.waitForSelector("form", { timeout: interval });

            let emailElement = await page.waitForSelector('[name="email"]', { timeout: interval });
            let passwordElement = await page.waitForSelector('[name="password"]', { timeout: interval });
            let repeatPasswordElement = await page.waitForSelector('[name="re-password"]', { timeout: interval });

            await emailElement.fill(userData.email);
            await passwordElement.fill(userData.password);
            await repeatPasswordElement.fill(userData.password);

            const [request] = await Promise.all([
                onRequest(),
                page.click('[type="submit"]'),
            ]);

            const postData = JSON.parse(request.postData());
            expect(postData.email).to.equal(userData.email);
            expect(postData.password).to.equal(userData.password);
        });
        it("Register shows alert on fail and does not redirect [ 2.5 Points ]", async function () {
            const userData = mockData.users[1];
            const { post } = await handle(endpoints.register);
            let options = { json: true, status: 400 };
            const { onResponse } = post({ message: 'Error 409' }, options);

            await page.goto(host);

            await page.click('text=Register', { timeout: interval });

            await page.waitForSelector('form', { timeout: interval });

            let emailElement = await page.waitForSelector('[name="email"]', { timeout: interval });
            let passwordElement = await page.waitForSelector('[name="password"]', { timeout: interval });
            let repeatPasswordElement = await page.waitForSelector('[name="re-password"]', { timeout: interval });

            await emailElement.fill(userData.email);
            await passwordElement.fill(userData.password);
            await repeatPasswordElement.fill(userData.password);

            // Prepare for alert dialog or span with error message
            let alertPromise = new Promise(resolve => {
                page.on('dialog', async dialog => {
                    await dialog.accept();
                    resolve({ type: dialog.type() });
                });
            });
            let errorMessageSpanPromise = page.waitForSelector('.notification', { state: 'visible', timeout: interval })
                .then(() => page.$eval('.msg', el => el.textContent))
                .then(text => ({ type: 'error-span', message: text })) // Ensure consistent type
                .catch(() => ({ type: 'none' })); // In case no notification appears

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
            const userData = mockData.users[2];
            const { post } = await handle(endpoints.login);
            const { get } = await handle(endpoints.logout);
            const { onResponse } = post(userData);
            const { onRequest } = get("", { json: false, status: 204 });

            await page.goto(host);

            await page.click('text=Login', { timeout: interval });

            await page.waitForSelector("form", { timeout: interval });

            //Can check using Ids if they are part of the provided HTML
            await page.waitForSelector("form", { timeout: interval });

            await page.fill('[name="email"]', userData.email, { timeout: interval })
            await page.fill('[name="password"]', userData.password, { timeout: interval })

            await Promise.all([onResponse(), page.click('[type="submit"]')]);

            let logoutBtn = await page.waitForSelector('nav >> text=Logout', { timeout: interval });

            const [request] = await Promise.all([
                onRequest(),
                logoutBtn.click()
            ]);

            const token = request.headers()["x-authorization"];
            expect(request.method()).to.equal("GET");
            expect(token).to.equal(userData.accessToken);
        });
    });

    describe("Navigation bar [ 10 Points ]", () => {
        it("Logged user should see correct navigation [ 2.5 Points ]", async function () {
            // Login user
            const userData = mockData.users[0];
            const { post: loginPost } = await handle(endpoints.login);
            loginPost(userData);
            await page.goto(host);

            await page.click('text=Login', { timeout: interval });

            await page.waitForSelector("form", { timeout: interval });

            await page.waitForSelector("form", { timeout: interval });

            await page.fill('[name="email"]', userData.email, { timeout: interval })
            await page.fill('[name="password"]', userData.password, { timeout: interval })

            await page.click('[type="submit"]', { timeout: interval });

            //Test for navigation
            await page.waitForSelector('nav >> text=Marketplace', { timeout: interval });

            expect(await page.isVisible("nav >> text=Marketplace")).to.be.true;
            expect(await page.isVisible("nav >> text=Sell")).to.be.true;
            expect(await page.isVisible("nav >> text=Logout")).to.be.true;



            expect(await page.isVisible("nav >> text=Login")).to.be.false;
            expect(await page.isVisible("nav >> text=Register")).to.be.false;
        });

        it("Guest user should see correct navigation [ 2.5 Points ]", async function () {
            await page.goto(host);

            await page.waitForSelector('nav >> text=Marketplace', { timeout: interval });

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

            await page.click('nav >> text=Marketplace', { timeout: interval })

            await page.waitForSelector('#dashboard', { timeout: interval });
            await page.click('text=Login', { timeout: interval });


            await page.waitForSelector('#login', { timeout: interval });
            await page.click('text=Register', { timeout: interval });

            await page.waitForSelector('#register', { timeout: interval });
            await page.click('#logo', { timeout: interval });

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

            await page.click('text=Login', { timeout: interval });

            await page.waitForSelector("form", { timeout: interval });

            await page.waitForSelector("form", { timeout: interval });

            await page.fill('[name="email"]', userData.email, { timeout: interval })
            await page.fill('[name="password"]', userData.password, { timeout: interval })

            await page.click('[type="submit"]', { timeout: interval });

            await page.click('nav >> text=Marketplace', { timeout: interval })

            await page.waitForSelector('#dashboard', { timeout: interval });
            await page.click('text=Sell', { timeout: interval });

            await page.waitForSelector('#create', { timeout: interval });
            let logo = await page.waitForSelector('#logo', { timeout: interval });
            await page.click('#logo', { timeout: interval });

            await page.waitForSelector('#hero', { timeout: interval });
        });
    });

    describe("Home Page [ 5 Points ]", function () {
        it("Show Home page text [ 2.5 Points ]", async function () {
            await page.goto(host);
            await page.waitForSelector('text=Discover the best deals on drones! Buy, sell, and trade top-quality drones with ease on Drone Deals - your trusted marketplace for all things drone.', { timeout: interval });
            expect(await page.isVisible("text=Discover the best deals on drones! Buy, sell, and trade top-quality drones with ease on Drone Deals - your trusted marketplace for all things drone.")).to.be.true;
        });

        it("Show home page hero [ 2.5 Points ]", async function () {
            await page.goto(host);
            await page.waitForSelector('#hero', { timeout: interval });
            expect(await page.isVisible('#hero')).to.be.true;
        });
    });

    describe("Dashboard Page [ 15 Points ]", function () {
        it("Show Marketplace page - 'Marketplace' message [ 2.5 Points ]", async function () {
            const { get } = await handle(endpoints.catalog);
            get([]);
            await page.goto(host);

            await page.click('nav >> text=Marketplace', { timeout: interval })

            await page.waitForSelector('h3 >> text=Marketplace', { timeout: interval });
            expect(await page.isVisible("h3 >> text=Marketplace")).to.be.true;
        });

        it("Check Marketplace page with 0 Items [ 2.5 Points ]", async function () {
            const { get } = await handle(endpoints.catalog);
            get([]);

            await page.goto(host);

            await page.click('nav >> text=Marketplace', { timeout: interval })

            await page.waitForSelector('text=No Drones Available', { timeout: interval });
            expect(await page.isVisible('text=No Drones Available')).to.be.true;

        });

        it("Check Drones have correct images [ 2.5 Points ]", async function () {
            const { get } = await handle(endpoints.catalog);
            get(mockData.catalog);
            const data = mockData.catalog;

            await page.goto(host);

            await page.click('nav >> text=Marketplace', { timeout: interval })

            await page.waitForSelector(".drone img", { timeout: interval });
            const images = await page.$$eval(".drone img", (t) =>
                t.map((s) => s.src)
            );

            expect(images.length).to.equal(3);
            expect(images[0]).to.contains(`${encodeURI(data[0].imageUrl)}`);
            expect(images[1]).to.contains(`${encodeURI(data[1].imageUrl)}`);
            expect(images[2]).to.contains(`${encodeURI(data[2].imageUrl)}`);
        });

        it("Check Drones have correct model [ 2.5 Points ]", async function () {
            const { get } = await handle(endpoints.catalog);
            get(mockData.catalog);
            const data = mockData.catalog;

            await page.goto(host);

            await page.click('nav >> text=Marketplace', { timeout: interval })

            await page.waitForSelector(".drone .model", { timeout: interval });
            const categories = await page.$$eval(".drone .model", (t) =>
                t.map((s) => s.textContent)
            );

            expect(categories.length).to.equal(3);
            expect(categories[0]).to.contains(`${data[0].model}`);
            expect(categories[1]).to.contains(`${data[1].model}`);
            expect(categories[2]).to.contains(`${data[2].model}`);
        });

        it("Check Drones have correct price [ 2.5 Points ]", async function () {
            const { get } = await handle(endpoints.catalog);
            get(mockData.catalog.slice(0, 2));
            const data = mockData.catalog.slice(0, 2);

            await page.goto(host);

            await page.click('nav >> text=Marketplace', { timeout: interval })

            await page.waitForSelector(".drone-info .price", { timeout: interval });
            const categories = await page.$$eval(".drone-info .price", (t) =>
                t.map((s) => s.textContent)
            );

            expect(categories.length).to.equal(2);
            expect(categories[0]).to.contains(`${data[0].price}`);
            expect(categories[1]).to.contains(`${data[1].price}`);
        });
        it("Check Drones have correct condition [ 2.5 Points ]", async function () {
            const { get } = await handle(endpoints.catalog);
            get(mockData.catalog.slice(0, 2));
            const data = mockData.catalog.slice(0, 2);

            await page.goto(host);

            await page.click('nav >> text=Marketplace', { timeout: interval })

            await page.waitForSelector(".drone-info .condition", { timeout: interval });
            const categories = await page.$$eval(".drone-info .condition", (t) =>
                t.map((s) => s.textContent)
            );

            expect(categories.length).to.equal(2);
            expect(categories[0]).to.contains(`${data[0].condition}`);
            expect(categories[1]).to.contains(`${data[1].condition}`);
        });
        it("Check Drones have correct type [ 2.5 Points ]", async function () {
            const { get } = await handle(endpoints.catalog);
            get(mockData.catalog.slice(0, 2));
            const data = mockData.catalog.slice(0, 2);

            await page.goto(host);

            await page.click('nav >> text=Marketplace', { timeout: interval })

            await page.waitForSelector(".drone-info .weight", { timeout: interval });
            const categories = await page.$$eval(".drone-info .weight", (t) =>
                t.map((s) => s.textContent)
            );

            expect(categories.length).to.equal(2);
            expect(categories[0]).to.contains(`${data[0].weight}`);
            expect(categories[1]).to.contains(`${data[1].weight}`);
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
                await page.click('text=Login', { timeout: interval });
                await page.waitForSelector("form", { timeout: interval });
                await page.fill('[name="email"]', userData.email, { timeout: interval })
                await page.fill('[name="password"]', userData.password, { timeout: interval })
                await page.click('[type="submit"]', { timeout: interval });

                const { post } = await handle(endpoints.create);
                const isCalled = post().isHandled;

                await page.click('text=Sell', { timeout: interval });

                await page.click('[type="submit"]', { timeout: interval });

              
                expect(isCalled()).to.equal(false, 'Create API was called when form inputs were empty');
            });

            it("Create makes correct API call [ 2.5 Points ]", async function () {
                //Login
                const userData = mockData.users[0];
                const { post: loginPost } = await handle(endpoints.login);
                loginPost(userData);
                await page.goto(host);
                await page.click('text=Login', { timeout: interval });
                await page.waitForSelector("form", { timeout: interval });
                await page.fill('[name="email"]', userData.email, { timeout: interval })
                await page.fill('[name="password"]', userData.password, { timeout: interval })
                await page.click('[type="submit"]', { timeout: interval })

                const data = mockData.catalog[0];
                const { post } = await handle(endpoints.create);
                const { onRequest } = post(data);

                await page.click('text=Sell', { timeout: interval });
                let modelElement = await page.waitForSelector('[name="model"]', { timeout: interval });
                let imageElement = await page.waitForSelector('[name="imageUrl"]', { timeout: interval });
                let priceElement = await page.waitForSelector('[name="price"]', { timeout: interval });
                let phoneElement = await page.waitForSelector('[name="phone"]', { timeout: interval });
                let conditionElement = await page.waitForSelector('[name="condition"]', { timeout: interval });
                let weightElement = await page.waitForSelector('[name="weight"]', { timeout: interval });
                let descriptionElement = await page.waitForSelector('[name="description"]', { timeout: interval });
                let submitBtn = await page.waitForSelector('[type="submit"]', { timeout: interval });

                await modelElement.fill(data.model);
                await imageElement.fill(data.imageUrl);
                await priceElement.fill(data.price);
                await conditionElement.fill(data.condition);
                await phoneElement.fill(data.phone);
                await weightElement.fill(data.weight);
                await descriptionElement.fill(data.description);


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
                await page.click('text=Login', { timeout: interval });
                await page.waitForSelector("form", { timeout: interval });
                await page.fill('[name="email"]', userData.email, { timeout: interval })
                await page.fill('[name="password"]', userData.password, { timeout: interval })
                await page.click('[type="submit"]', { timeout: interval })

                const data = mockData.catalog[0];
                const { post } = await handle(endpoints.create);
                const { onRequest } = post(data);

                await page.click('text=Sell', { timeout: interval });


                let modelElement = await page.waitForSelector('[name="model"]', { timeout: interval });
                let imageElement = await page.waitForSelector('[name="imageUrl"]', { timeout: interval });
                let priceElement = await page.waitForSelector('[name="price"]', { timeout: interval });
                let phoneElement = await page.waitForSelector('[name="phone"]', { timeout: interval });
                let conditionElement = await page.waitForSelector('[name="condition"]', { timeout: interval });
                let weightElement = await page.waitForSelector('[name="weight"]', { timeout: interval });
                let descriptionElement = await page.waitForSelector('[name="description"]', { timeout: interval });
                let submitBtn = await page.waitForSelector('[type="submit"]', { timeout: interval });

                await modelElement.fill(data.model);
                await imageElement.fill(data.imageUrl);
                await priceElement.fill(data.price);
                await conditionElement.fill(data.condition);
                await phoneElement.fill(data.phone);
                await weightElement.fill(data.weight);
                await descriptionElement.fill(data.description);

                const [request] = await Promise.all([
                    onRequest(),
                    submitBtn.click(),
                ]);

                const postData = JSON.parse(request.postData());

                expect(postData.model).to.equal(data.model);
                expect(postData.imageUrl).to.equal(data.imageUrl);
                expect(postData.price).to.equal(data.price);
                expect(postData.condition).to.equal(data.condition);
                expect(postData.weight).to.equal(data.weight);
                expect(postData.description).to.equal(data.description);


            });

            it("Create includes correct headers [ 2.5 Points ]", async function () {
                //Login
                const userData = mockData.users[0];
                const { post: loginPost } = await handle(endpoints.login);
                loginPost(userData);
                await page.goto(host);
                await page.click('text=Login', { timeout: interval });
                await page.waitForSelector("form", { timeout: interval });
                await page.fill('[name="email"]', userData.email, { timeout: interval })
                await page.fill('[name="password"]', userData.password, { timeout: interval })
                await page.click('[type="submit"]', { timeout: interval })

                const data = mockData.catalog[0];
                const { post } = await handle(endpoints.create);
                const { onRequest } = post(data);

                await page.click('text=Sell', { timeout: interval });

                let modelElement = await page.waitForSelector('[name="model"]', { timeout: interval });
                let imageElement = await page.waitForSelector('[name="imageUrl"]', { timeout: interval });
                let priceElement = await page.waitForSelector('[name="price"]', { timeout: interval });
                let phoneElement = await page.waitForSelector('[name="phone"]', { timeout: interval });
                let conditionElement = await page.waitForSelector('[name="condition"]', { timeout: interval });
                let weightElement = await page.waitForSelector('[name="weight"]', { timeout: interval });
                let descriptionElement = await page.waitForSelector('[name="description"]', { timeout: interval });
                let submitBtn = await page.waitForSelector('[type="submit"]', { timeout: interval });

                await modelElement.fill(data.model);
                await imageElement.fill(data.imageUrl);
                await priceElement.fill(data.price);
                await conditionElement.fill(data.condition);
                await phoneElement.fill(data.phone);
                await weightElement.fill(data.weight);
                await descriptionElement.fill(data.description);

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
                await page.click('text=Login', { timeout: interval });
                await page.waitForSelector("form", { timeout: interval });
                await page.fill('[name="email"]', userData.email, { timeout: interval })
                await page.fill('[name="password"]', userData.password, { timeout: interval })
                await page.click('[type="submit"]', { timeout: interval })

                const { get: catalogGet } = await handle(endpoints.catalog);
                catalogGet(mockData.catalog);
                const data = mockData.catalog[0];
                const { post } = await handle(endpoints.create);
                const { onResponse } = post(data);

                await page.click('text=Sell', { timeout: interval });

                let modelElement = await page.waitForSelector('[name="model"]', { timeout: interval });
                let imageElement = await page.waitForSelector('[name="imageUrl"]', { timeout: interval });
                let priceElement = await page.waitForSelector('[name="price"]', { timeout: interval });
                let phoneElement = await page.waitForSelector('[name="phone"]', { timeout: interval });
                let conditionElement = await page.waitForSelector('[name="condition"]', { timeout: interval });
                let weightElement = await page.waitForSelector('[name="weight"]', { timeout: interval });
                let descriptionElement = await page.waitForSelector('[name="description"]', { timeout: interval });
                let submitBtn = await page.waitForSelector('[type="submit"]', { timeout: interval });

                await modelElement.fill(data.model);
                await imageElement.fill(data.imageUrl);
                await priceElement.fill(data.price);
                await conditionElement.fill(data.condition);
                await phoneElement.fill(data.phone);
                await weightElement.fill(data.weight);
                await descriptionElement.fill(data.description);

                await Promise.all([
                    onResponse(),
                    submitBtn.click(),
                ]);

                await page.waitForSelector('#dashboard', { timeout: interval });
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


                await page.click('nav >> text=Marketplace', { timeout: interval })

                let moreInfoButton = await page.waitForSelector(`.drone:has-text("${data.model}") >> .details-btn`, { timeout: interval });

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


                await page.click('nav >> text=Marketplace', { timeout: interval })

                await page.click(`.drone:has-text("${data.model}") >> .details-btn`, { timeout: interval });

                let imageSrc = await page.getAttribute('#details-img', 'src', { timeout: interval });
                let model = await page.textContent('#details-model', { timeout: interval });
                let price = await page.textContent('.details-price', { timeout: interval });
                let weight = await page.textContent('.details-weight', { timeout: interval });
                let condition = await page.textContent('.details-condition', { timeout: interval });
                let phone = await page.textContent('.phone-number', { timeout: interval });
                let about = await page.textContent('.drone-description', { timeout: interval });



                expect(imageSrc).to.contains(data.imageUrl);
                expect(model).to.contains(data.model);
                expect(price).to.contains(data.price);
                expect(condition).to.contains(data.condition);
                expect(weight).to.contains(data.weight);
                expect(about).to.contains(data.description);
                expect(phone).to.contains(data.phone);
                expect(await page.isVisible('.buttons >> text="Delete"')).to.equal(false, 'Delete button was visible for non owner');
                expect(await page.isVisible('.buttons >> text="Edit"')).to.equal(false, 'Edit button was visible for non-owner');

                expect(isHandled()).to.equal(true, 'Details API was not called');
            });

            it("Details with logged in user shows correct info [ 2.5 Points ]", async function () {
                //Login
                const userData = mockData.users[0];
                const { post } = await handle(endpoints.login);
                post(userData);
                await page.goto(host);
                await page.click('text=Login', { timeout: interval });
                await page.waitForSelector("form", { timeout: interval });
                await page.fill('[name="email"]', userData.email, { timeout: interval })
                await page.fill('[name="password"]', userData.password, { timeout: interval })
                await page.click('[type="submit"]', { timeout: interval })

                const { get: catalogGet } = await handle(endpoints.catalog);
                catalogGet(mockData.catalog);

                const data = mockData.catalog[0];
                const { get } = await handle(endpoints.details(data._id));
                let { isHandled } = get(data);

                await page.click('nav >> text=Marketplace', { timeout: interval })

                await page.click(`.drone:has-text("${data.model}") >> .details-btn`, { timeout: interval });

                let imageSrc = await page.getAttribute('#details-img', 'src', { timeout: interval });
                let model = await page.textContent('#details-model', { timeout: interval });
                let price = await page.textContent('.details-price', { timeout: interval });
                let weight = await page.textContent('.details-weight', { timeout: interval });
                let condition = await page.textContent('.details-condition', { timeout: interval });
                let phone = await page.textContent('.phone-number', { timeout: interval });
                let about = await page.textContent('.drone-description', { timeout: interval });

                expect(imageSrc).to.contains(data.imageUrl);
                expect(model).to.contains(data.model);
                expect(price).to.contains(data.price);
                expect(condition).to.contains(data.condition);
                expect(weight).to.contains(data.weight);
                expect(about).to.contains(data.description);
                expect(phone).to.contains(data.phone);
                expect(await page.isVisible('.buttons >> text="Delete"')).to.equal(false, 'Delete button was visible for non owner');
                expect(await page.isVisible('.buttons >> text="Edit"')).to.equal(false, 'Edit button was visible for non-owner');

                expect(isHandled()).to.equal(true, 'Details API was not called');
            });

            it("Details with owner shows correct info [ 2.5 Points ]", async function () {
                //Login
                const userData = mockData.users[1];
                const { post } = await handle(endpoints.login);
                post(userData);
                await page.goto(host);
                await page.click('text=Login', { timeout: interval });
                await page.waitForSelector("form", { timeout: interval });
                await page.fill('[name="email"]', userData.email, { timeout: interval })
                await page.fill('[name="password"]', userData.password, { timeout: interval })
                await page.click('[type="submit"]', { timeout: interval })

                const { get: catalogGet } = await handle(endpoints.catalog);
                catalogGet(mockData.catalog);

                const data = mockData.catalog[0];
                const { get } = await handle(endpoints.details(data._id));
                let { isHandled } = get(data);


                await page.click('nav >> text=Marketplace', { timeout: interval })

                await page.click(`.drone:has-text("${data.model}") >> .details-btn`, { timeout: interval });

                let imageSrc = await page.getAttribute('#details-img', 'src', { timeout: interval });
                let model = await page.textContent('#details-model', { timeout: interval });
                let price = await page.textContent('.details-price', { timeout: interval });
                let weight = await page.textContent('.details-weight', { timeout: interval });
                let condition = await page.textContent('.details-condition', { timeout: interval });
                let phone = await page.textContent('.phone-number', { timeout: interval });
                let about = await page.textContent('.drone-description', { timeout: interval });

                expect(imageSrc).to.contains(data.imageUrl);
                expect(model).to.contains(data.model);
                expect(price).to.contains(data.price);
                expect(condition).to.contains(data.condition);
                expect(weight).to.contains(data.weight);
                expect(about).to.contains(data.description);
                expect(phone).to.contains(data.phone);
                expect(await page.isVisible('.buttons >> text="Delete"')).to.equal(true, 'Delete button was NOT visible for owner');
                expect(await page.isVisible('.buttons >> text="Edit"')).to.equal(true, 'Edit button was NOT visible for owner');

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
                await page.click('text=Login', { timeout: interval });
                await page.waitForSelector("form", { timeout: interval });
                await page.fill('[name="email"]', userData.email, { timeout: interval })
                await page.fill('[name="password"]', userData.password, { timeout: interval })
                await page.click('[type="submit"]', { timeout: interval })

                const { get: catalogGet } = await handle(endpoints.catalog);
                catalogGet(mockData.catalog);

                const data = mockData.catalog[1];
                const { get } = await handle(endpoints.details(data._id));
                let { onResponse, isHandled } = get(data);


                const { get: own } = await handle(endpoints.own(data._id, userData._id));
                own(1);

                await page.click('nav >> text=Marketplace', { timeout: interval })

                await page.click(`.drone:has-text("${data.model}") >> .details-btn`, { timeout: interval });

                let editButton = await page.waitForSelector('.buttons >> text="Edit"', { timeout: interval });

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
                await page.click('text=Login', { timeout: interval });
                await page.waitForSelector("form", { timeout: interval });
                await page.fill('[name="email"]', userData.email, { timeout: interval })
                await page.fill('[name="password"]', userData.password, { timeout: interval })
                await page.click('[type="submit"]', { timeout: interval })

                const { get: catalogGet } = await handle(endpoints.catalog);
                catalogGet(mockData.catalog);

                const data = mockData.catalog[1];
                const { get } = await handle(endpoints.details(data._id));
                get(data);

                const { get: own } = await handle(endpoints.own(data._id, userData._id));
                own(1);

                await page.click('nav >> text=Marketplace', { timeout: interval })

                await page.click(`.drone:has-text("${data.model}") >> .details-btn`, { timeout: interval });

                await page.click('.buttons >> text="Edit"', { timeout: interval });

                await page.waitForSelector('.form .edit-form input', { timeout: interval });
                await page.waitForSelector('.edit-form textarea', { timeout: interval });

                const inputs = await page.$$eval(".form .edit-form input", (t) => t.map((i) => i.value));
                const textareas = await page.$$eval(".edit-form textarea", (t) => t.map((i) => i.value));
                

                expect(inputs[0]).to.contains(data.model);
                expect(inputs[1]).to.contains(data.imageUrl);
                expect(inputs[2]).to.contains(data.price);
                expect(inputs[3]).to.contains(data.weight);
                expect(inputs[4]).to.contains(data.phone);
                expect(inputs[5]).to.equal(data.condition);
                expect(textareas[0]).to.contains(data.description);
            });


            it("Edit does NOT work with empty fields [ 2.5 Points ]", async function () {
                //Login
                const userData = mockData.users[0];
                const { post } = await handle(endpoints.login);
                post(userData);
                await page.goto(host);
                await page.click('text=Login', { timeout: interval });
                await page.waitForSelector("form", { timeout: interval });
                await page.fill('[name="email"]', userData.email, { timeout: interval })
                await page.fill('[name="password"]', userData.password, { timeout: interval })
                await page.click('[type="submit"]', { timeout: interval })

                const { get: catalogGet } = await handle(endpoints.catalog);
                catalogGet(mockData.catalog);

                const data = mockData.catalog[2];
                const { get, put } = await handle(endpoints.details(data._id));
                get(data);
                const { isHandled } = put();


                const { get: own } = await handle(endpoints.own(data._id, userData._id));
                own(1);

                await page.click('nav >> text=Marketplace', { timeout: interval })

                await page.click(`.drone:has-text("${data.model}") >> .details-btn`, { timeout: interval });

                await page.click('.buttons >> text="Edit"', { timeout: interval });

                let modelInput = await page.waitForSelector('[name="model"]', { timeout: interval });
                let imageInput = await page.waitForSelector('[name="imageUrl"]', { timeout: interval });
                let priceInput = await page.waitForSelector('[name="price"]', { timeout: interval });
                let conditionInput = await page.waitForSelector('[name="condition"]', { timeout: interval });
                let contactInput = await page.waitForSelector('[name="weight"]', { timeout: interval });
                let aboutInput = await page.waitForSelector('[name="description"]', { timeout: interval });

                await modelInput.fill('');
                await imageInput.fill('');
                await priceInput.fill('');
                await contactInput.fill('');
                await conditionInput.fill('');
                await aboutInput.fill('');


                await page.click('[type="submit"]', { timeout: interval });

                expect(isHandled()).to.equal(false, 'Edit API was called when form inputs were empty');
            });

            it("Edit sends information to the right API [ 2.5 Points ]", async function () {
                //Login
                const userData = mockData.users[0];
                const { post } = await handle(endpoints.login);
                post(userData);
                await page.goto(host);
                await page.click('text=Login', { timeout: interval });
                await page.waitForSelector("form", { timeout: interval });
                await page.fill('[name="email"]', userData.email, { timeout: interval })
                await page.fill('[name="password"]', userData.password, { timeout: interval })
                await page.click('[type="submit"]', { timeout: interval })

                const { get: catalogGet } = await handle(endpoints.catalog);
                catalogGet(mockData.catalog);

                const data = mockData.catalog[2];
                const modifiedData = Object.assign({}, data);
                modifiedData.model = 'Model Test';
                modifiedData.imageUrl = 'Image Test';
                modifiedData.price = '1';
                modifiedData.weight = '1';
                modifiedData.condition = 'Test New';
                modifiedData.description = 'About Test';


                const { get, put } = await handle(endpoints.details(data._id));
                get(data);
                const { isHandled, onResponse } = put(modifiedData);

                const { get: own } = await handle(endpoints.own(data._id, userData._id));
                own(1);

                await page.click('nav >> text=Marketplace', { timeout: interval })

                await page.click(`.drone:has-text("${data.model}") >> .details-btn`, { timeout: interval });

                await page.click('.buttons >> text="Edit"', { timeout: interval });

                let modelInput = await page.waitForSelector('[name="model"]', { timeout: interval });
                let imageInput = await page.waitForSelector('[name="imageUrl"]', { timeout: interval });
                let priceInput = await page.waitForSelector('[name="price"]', { timeout: interval });
                let conditionInput = await page.waitForSelector('[name="condition"]', { timeout: interval });
                let contactInput = await page.waitForSelector('[name="weight"]', { timeout: interval });
                let aboutInput = await page.waitForSelector('[name="description"]', { timeout: interval });

                await modelInput.fill(modifiedData.model);
                await imageInput.fill(modifiedData.imageUrl);
                await priceInput.fill(modifiedData.price);
                await conditionInput.fill(modifiedData.condition);
                await contactInput.fill(modifiedData.weight);
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
                await page.click('text=Login', { timeout: interval });
                await page.waitForSelector("form", { timeout: interval });
                await page.fill('[name="email"]', userData.email, { timeout: interval })
                await page.fill('[name="password"]', userData.password, { timeout: interval })
                await page.click('[type="submit"]', { timeout: interval })

                const { get: catalogGet } = await handle(endpoints.catalog);
                catalogGet(mockData.catalog);
                const data = mockData.catalog[2];
                const modifiedData = Object.assign({}, data);
                modifiedData.model = 'Model Test';
                modifiedData.imageUrl = 'Image Test';
                modifiedData.price = '1';
                modifiedData.condition = 'New';
                modifiedData.weight = '1';
                modifiedData.description = 'About Test';

                const { get, put } = await handle(endpoints.details(data._id));
                get(data);
                const { onRequest } = put(modifiedData);


                const { get: own } = await handle(endpoints.own(data._id, userData._id));
                own(1);

                await page.click('nav >> text=Marketplace', { timeout: interval })

                await page.click(`.drone:has-text("${data.model}") >> .details-btn`, { timeout: interval });

                await page.click('.buttons >> text="Edit"', { timeout: interval });


                let modelInput = await page.waitForSelector('[name="model"]', { timeout: interval });
                let imageInput = await page.waitForSelector('[name="imageUrl"]', { timeout: interval });
                let priceInput = await page.waitForSelector('[name="price"]', { timeout: interval });
                let conditionInput = await page.waitForSelector('[name="condition"]', { timeout: interval });
                let contactInput = await page.waitForSelector('[name="weight"]', { timeout: interval });
                let aboutInput = await page.waitForSelector('[name="description"]', { timeout: interval });

                await modelInput.fill(modifiedData.model);
                await imageInput.fill(modifiedData.imageUrl);
                await priceInput.fill(modifiedData.price);
                await conditionInput.fill(modifiedData.price);
                await contactInput.fill(modifiedData.weight);
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
                await page.click('text=Login', { timeout: interval });
                await page.waitForSelector("form", { timeout: interval });
                await page.fill('[name="email"]', userData.email, { timeout: interval })
                await page.fill('[name="password"]', userData.password, { timeout: interval })
                await page.click('[type="submit"]', { timeout: interval })

                const { get: catalogGet } = await handle(endpoints.catalog);
                catalogGet(mockData.catalog);
                const data = mockData.catalog[2];
                const modifiedData = Object.assign({}, data);
                modifiedData.model = 'Model Test';
                modifiedData.imageUrl = 'Image Test';
                modifiedData.price = '1';
                modifiedData.condition = 'New';
                modifiedData.weight = '1';
                modifiedData.description = 'About Test';

                const { get, put } = await handle(endpoints.details(data._id));
                get(data);
                const { onRequest } = put(modifiedData);


                const { get: own } = await handle(endpoints.own(data._id, userData._id));
                own(1);

                await page.click('nav >> text=Marketplace', { timeout: interval })

                await page.click(`.drone:has-text("${data.model}") >> .details-btn`, { timeout: interval });

                await page.click('.buttons >> text="Edit"', { timeout: interval });

                let modelInput = await page.waitForSelector('[name="model"]', { timeout: interval });
                let imageInput = await page.waitForSelector('[name="imageUrl"]', { timeout: interval });
                let priceInput = await page.waitForSelector('[name="price"]', { timeout: interval });
                let conditionInput = await page.waitForSelector('[name="condition"]', { timeout: interval });
                let contactInput = await page.waitForSelector('[name="weight"]', { timeout: interval });
                let aboutInput = await page.waitForSelector('[name="description"]', { timeout: interval });

                await modelInput.fill(modifiedData.model);
                await imageInput.fill(modifiedData.imageUrl);
                await priceInput.fill(modifiedData.price);
                await conditionInput.fill(modifiedData.condition);
                await contactInput.fill(modifiedData.weight);
                await aboutInput.fill(modifiedData.description);


                let submitBtn = await page.waitForSelector('[type="submit"]', { timeout: interval });

                const [request] = await Promise.all([
                    onRequest(),
                    submitBtn.click(),
                ]);

                const postData = JSON.parse(request.postData());

                expect(postData.model).to.contains(modifiedData.model);
                expect(postData.imageUrl).to.contains(modifiedData.imageUrl);
                expect(postData.price).to.contains(modifiedData.price);
                expect(postData.condition).to.contains(modifiedData.condition);
                expect(postData.weight).to.contains(modifiedData.weight);
                expect(postData.description).to.contains(modifiedData.description);
            });

            it("Edit redirects to Details on success [ 2.5 Points ]", async function () {
                //Login
                const userData = mockData.users[0];
                const { post } = await handle(endpoints.login);
                post(userData);
                await page.goto(host);
                await page.click('text=Login', { timeout: interval });
                await page.waitForSelector("form", { timeout: interval });
                await page.fill('[name="email"]', userData.email, { timeout: interval })
                await page.fill('[name="password"]', userData.password, { timeout: interval })
                await page.click('[type="submit"]', { timeout: interval })

                const { get: catalogGet } = await handle(endpoints.catalog);
                catalogGet(mockData.catalog);
                const data = mockData.catalog[2];
                const modifiedData = Object.assign({}, data);
                modifiedData.model = 'Model Test';
                modifiedData.imageUrl = 'Image Test';
                modifiedData.price = '1';
                modifiedData.condition = 'New';
                modifiedData.weight = '1';
                modifiedData.description = 'About Test';

                const { get, put } = await handle(endpoints.details(data._id));
                get(data);
                const { onResponse } = put(modifiedData);


                const { get: own } = await handle(endpoints.own(data._id, userData._id));
                own(1);

                await page.click('nav >> text=Marketplace', { timeout: interval })

                await page.click(`.drone:has-text("${data.model}") >> .details-btn`, { timeout: interval });

                await page.click('.buttons >> text="Edit"', { timeout: interval });


                let modelInput = await page.waitForSelector('[name="model"]', { timeout: interval });
                let imageInput = await page.waitForSelector('[name="imageUrl"]', { timeout: interval });
                let priceInput = await page.waitForSelector('[name="price"]', { timeout: interval });
                let conditionInput = await page.waitForSelector('[name="condition"]', { timeout: interval });
                let contactInput = await page.waitForSelector('[name="weight"]', { timeout: interval });
                let aboutInput = await page.waitForSelector('[name="description"]', { timeout: interval });

                await modelInput.fill(modifiedData.model);
                await imageInput.fill(modifiedData.imageUrl);
                await priceInput.fill(modifiedData.price);
                await conditionInput.fill(modifiedData.condition);
                await contactInput.fill(modifiedData.weight);
                await aboutInput.fill(modifiedData.description);

                let submitBtn = await page.waitForSelector('[type="submit"]', { timeout: interval });

                await Promise.all([
                    onResponse(),
                    submitBtn.click(),
                ]);

                await page.waitForSelector('#details', { timeout: interval });
            });
        })

        describe('Delete [ 10 Points ]', function () {
            it("Delete makes correct API call [ 2.5 Points ]", async function () {
                //Login
                const userData = mockData.users[0];
                const { post } = await handle(endpoints.login);
                post(userData);
                await page.goto(host);
                await page.click('text=Login', { timeout: interval });
                await page.waitForSelector("form", { timeout: interval });
                await page.fill('[name="email"]', userData.email, { timeout: interval })
                await page.fill('[name="password"]', userData.password, { timeout: interval })
                await page.click('[type="submit"]', { timeout: interval })
                const data = mockData.catalog[2];

                const { get: catalogGet } = await handle(endpoints.catalog);
                catalogGet(mockData.catalog);
                const { get, del } = await handle(endpoints.details(data._id));
                get(data);
                const { onRequest, onResponse, isHandled } = del({ "_deletedOn": 1688586307461 });


                const { get: own } = await handle(endpoints.own(data._id, userData._id));
                own(1);

                await page.click('nav >> text=Marketplace', { timeout: interval })

                await page.click(`.drone:has-text("${data.model}") >> .details-btn`, { timeout: interval });

                let deleteButton = await page.waitForSelector('.buttons >> text="Delete"', { timeout: interval });

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
                await page.click('text=Login', { timeout: interval });
                await page.waitForSelector("form", { timeout: interval });
                await page.fill('[name="email"]', userData.email, { timeout: interval })
                await page.fill('[name="password"]', userData.password, { timeout: interval })
                await page.click('[type="submit"]', { timeout: interval })
                const data = mockData.catalog[2];

                const { get: catalogGet } = await handle(endpoints.catalog);
                catalogGet(mockData.catalog);
                const { get, del } = await handle(endpoints.details(data._id));
                get(data);
                const { onResponse, isHandled } = del({ "_deletedOn": 1688586307461 });


                const { get: own } = await handle(endpoints.own(data._id, userData._id));
                own(1);

                await page.click('nav >> text=Marketplace', { timeout: interval })

                await page.click(`.drone:has-text("${data.model}") >> .details-btn`, { timeout: interval });

                let deleteButton = await page.waitForSelector('.buttons >> text="Delete"', { timeout: interval });

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
                await page.click('text=Login', { timeout: interval });
                await page.waitForSelector("form", { timeout: interval });
                await page.fill('[name="email"]', userData.email, { timeout: interval })
                await page.fill('[name="password"]', userData.password, { timeout: interval })
                await page.click('[type="submit"]', { timeout: interval })
                const data = mockData.catalog[2];

                const { get: catalogGet } = await handle(endpoints.catalog);
                catalogGet(mockData.catalog);
                const { get, del } = await handle(endpoints.details(data._id));
                get(data);
                const { onResponse, isHandled } = del({ "_deletedOn": 1688586307461 });

                const { get: own } = await handle(endpoints.own(data._id, userData._id));
                own(1);

                await page.click('nav >> text=Marketplace', { timeout: interval })

                await page.click(`.drone:has-text("${data.model}") >> .details-btn`, { timeout: interval });

                let deleteButton = await page.waitForSelector('.buttons >> text="Delete"', { timeout: interval });

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
                await page.click('text=Login', { timeout: interval });
                await page.waitForSelector("form", { timeout: interval });
                await page.fill('[name="email"]', userData.email, { timeout: interval })
                await page.fill('[name="password"]', userData.password, { timeout: interval })
                await page.click('[type="submit"]', { timeout: interval })
                const data = mockData.catalog[2];

                const { get: catalogGet } = await handle(endpoints.catalog);
                catalogGet(mockData.catalog);
                const { get, del } = await handle(endpoints.details(data._id));
                get(data);
                const { isHandled } = del({ "_deletedOn": 1688586307461 });

                const { get: own } = await handle(endpoints.own(data._id, userData._id));
                own(1);

                await page.click('nav >> text=Marketplace', { timeout: interval })

                await page.click(`.drone:has-text("${data.model}") >> .details-btn`, { timeout: interval });

                let deleteButton = await page.waitForSelector('.buttons >> text="Delete"', { timeout: interval });

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
            await page.click(' text="Login"', { timeout: interval });

            await page.waitForSelector('form', { timeout: interval });

            const preClickNotification = await page.isVisible('#errorBox');
            expect(preClickNotification).to.be.false;

            await page.click('[type="submit"]', { timeout: interval });

            const notification = await page.isVisible('#errorBox');
            expect(notification).to.be.true;

        });

        it('Login notification with invalid data [ 2.5 Points ]', async () => {
            const endpoint = '**' + endpoints.login;
            let called = false;
            page.route(endpoint, route => called = true);

            await page.goto(host);
            await page.click(' text="Login"', { timeout: interval });

            await page.waitForSelector('form'), { timeout: interval };

            const preClickNotification = await page.isVisible('#errorBox');
            expect(preClickNotification).to.be.false;

            await page.click('[type="submit"]', { timeout: interval });


            const notification = await page.isVisible('#errorBox');
            expect(notification).to.be.true;

        });

        it('Register notification with invalid data [ 2.5 Points ]', async () => {
            const endpoint = '**' + endpoints.register;
            let called = false;
            page.route(endpoint, route => called = true);

            await page.goto(host);
            await page.click('text="Register"', { timeout: interval });


            await page.waitForSelector('form'), { timeout: interval };

            const preClickNotification = await page.isVisible('#errorBox');
            expect(preClickNotification).to.be.false;

            await page.click('[type="submit"]', { timeout: interval });


            const notification = await page.isVisible('#errorBox');
            expect(notification).to.be.true;
        });

        it('Notification with invalid data 2 [ 2.5 Points ]', async () => {
            const endpoint = '**' + endpoints.register;
            let called = false;
            page.route(endpoint, route => called = true);

            await page.goto(host);
            await page.click('text="Register"', { timeout: interval });


            await page.waitForSelector('form'), { timeout: interval };

            const preClickNotification = await page.isVisible('#errorBox');
            expect(preClickNotification).to.be.false;

            await page.click('[type="submit"]', { timeout: interval });
        

            const notification = await page.isVisible('#errorBox');
            expect(notification).to.be.true;
        });

        it('Create notification with invalid data [ 2.5 Points ]', async () => {
            //Login
            const userData = mockData.users[0];
            const { post: loginPost } = await handle(endpoints.login);
            loginPost(userData);
            await page.goto(host);
            await page.click('text=Login', { timeout: interval });

            await page.waitForSelector("form", { timeout: interval });
            await page.waitForSelector("form", { timeout: interval });
            await page.fill('[name="email"]', userData.email, { timeout: interval })
            await page.fill('[name="password"]', userData.password, { timeout: interval })
            await page.click('[type="submit"]', { timeout: interval });

            const data = mockData.catalog[0];
            const { post } = await handle(endpoints.create);
            const { onRequest } = post(data);

            await page.click('text=Sell', { timeout: interval });

           

            const preClickNotification = await page.isVisible('#errorBox');
            expect(preClickNotification).to.be.false;

            await page.click('[type="submit"]', { timeout: interval });
   

            const notification = await page.isVisible('#errorBox');
            expect(notification).to.be.true;
        });

        it('Edit notification with invalid data [ 2.5 Points ]', async () => {
            //Login
            const userData = mockData.users[0];
            const { post } = await handle(endpoints.login);
            post(userData);
            await page.goto(host);
            await page.click('text=Login', { timeout: interval });
            await page.waitForSelector("form", { timeout: interval });
            await page.fill('[name="email"]', userData.email, { timeout: interval })
            await page.fill('[name="password"]', userData.password, { timeout: interval })
            await page.click('[type="submit"]', { timeout: interval });

            const { get: catalogGet } = await handle(endpoints.catalog);
            catalogGet(mockData.catalog);

            const data = mockData.catalog[2];
            const modifiedData = Object.assign({}, data);
            modifiedData.model = 'Model Test';
            modifiedData.imageUrl = 'Image Test';
            modifiedData.price = '1';
            modifiedData.condition = 'New';
            modifiedData.weight = '1';
            modifiedData.description = '';


            const { get, put } = await handle(endpoints.details(data._id));
            get(data);
            const { isHandled, onResponse } = put(modifiedData);

            const { get: own } = await handle(endpoints.own(data._id, userData._id));
            own(1);

            await page.click('nav >> text=Marketplace', { timeout: interval })

            let moreInfoButton = await page.waitForSelector(`.drone:has-text("${data.model}") >> .details-btn`, { timeout: interval });
            await moreInfoButton.click();

            await page.click('.buttons >> text="Edit"', { timeout: interval });

            let modelInput = await page.waitForSelector('[name="model"]', { timeout: interval });
            let imageInput = await page.waitForSelector('[name="imageUrl"]', { timeout: interval });
            let priceInput = await page.waitForSelector('[name="price"]', { timeout: interval });
            let conditionInput = await page.waitForSelector('[name="condition"]', { timeout: interval });
            let contactInput = await page.waitForSelector('[name="weight"]', { timeout: interval });
            let aboutInput = await page.waitForSelector('[name="description"]', { timeout: interval });

            await modelInput.fill(modifiedData.model);
            await imageInput.fill(modifiedData.imageUrl);
            await priceInput.fill(modifiedData.price);
            await conditionInput.fill(modifiedData.condition);
            await contactInput.fill(modifiedData.weight);
            await aboutInput.fill(modifiedData.description);

            let submitBtn = await page.waitForSelector('[type="submit"]', { timeout: interval });

            await Promise.all([
                submitBtn.click(),
            ]);
         

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
            onRequest: () => context.waitForRequest(request => urlPredicate(request) && request.method() === method),
            onResponse: () => context.waitForResponse(response => urlPredicate(response.request()) && response.request().method() === method),
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