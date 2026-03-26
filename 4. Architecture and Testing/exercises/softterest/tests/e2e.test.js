
const { chromium } = require('playwright-chromium');
const { expect } = require('chai');

const host = 'http://localhost:3000'; // Application host (NOT service host - that can be anything)
const interval = 300;
const timeout = 8000;
const DEBUG = false;
const slowMo = 500;

const mockData = require('./mock-data.json');
const endpoints = {
  register: '/users/register',
  login: '/users/login',
  logout: '/users/logout',
  ideas: '/data/ideas?select=_id%2Ctitle%2Cimg&sortBy=_createdOn%20desc',
  create: '/data/ideas',
  details: '/data/ideas/',
  delete: '/data/ideas/',
};

function json(data) {
  return {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  };
}

let browser;
let context;
let page;

describe('E2E tests', function () {
  if (DEBUG) {
    this.timeout(120000);
  } else {
    this.timeout(timeout);
  }

  before(async () => {
    if (DEBUG) {
      browser = await chromium.launch({ headless: false, slowMo: 500 });
    } else {
      browser = await chromium.launch();
    }
  });

  after(async () => {
    await browser.close();
  });

  beforeEach(async () => {
    context = await browser.newContext();

    await context.route('**' + endpoints.ideas, (route) =>
      route.fulfill(json(mockData.ideas))
    );
    await context.route('**' + endpoints.details + '*', (route) =>
      route.fulfill(json(mockData.details))
    );

    page = await context.newPage();
  });

  afterEach(async () => {
    await page.close();
    await context.close();
  });

  describe('Catalog', () => {
    it('show most recent ideas', async () => {
      await page.goto(host);
      await page.click('text=Dashboard', { timeout: interval });
      await page.waitForSelector('#dashboard-holder', { timeout: interval });

      const titles = await page.$$eval(
        '#dashboard-holder .card.overflow-hidden.current-card.details p.card-text',
        (t) => t.map((s) => s.textContent)
      );
      expect(titles.length).to.equal(3);
      expect(titles[0]).to.contains('111111');
      expect(titles[1]).to.contains('222222');
      expect(titles[2]).to.contains('333333');
    });

    it('show idea details', async () => {
      await page.goto(host);
      await page.click('text=Dashboard', { timeout: interval });
      await page.waitForSelector('#dashboard-holder', { timeout: interval });
      await page.click('div.card:has-text("111111") >> text=Details', { timeout: interval });

      const title = await page.textContent('h2');
      const desc = await page.textContent('p.idea-description');
      const img = await page.getAttribute('.det-img', 'src');

      expect(title).to.equal(mockData.details.title);
      expect(desc).to.equal(mockData.details.description);
      expect(img).to.equal(mockData.details.img);
    });

    it('guest does NOT see delete button', async () => {
      await page.goto(host);
      await page.click('text=Dashboard', { timeout: interval });
      await page.waitForSelector('#dashboard-holder', { timeout: interval });
      await page.click('div.card:has-text("111111") >> text=Details', { timeout: interval });
      await page.waitForSelector('h2:has-text("111111")', { timeout: interval });

      const btn = await page.$$('text=Delete');
      expect(btn.length).to.equal(0);
    });
  });

  describe('Authentication', () => {
    it('register makes correct API call', async () => {
      const endpoint = '**' + endpoints.register;
      const email = 'john@abv.bg';
      const password = '123456';

      page.route(endpoint, (route) =>
        route.fulfill(json({ _id: '0001', email, accessToken: 'AAAA' }))
      );

      await page.goto(host);
      await page.click('text=Register', { timeout: interval });

      await page.waitForSelector('form');

      await page.fill('[name="email"]', email);
      await page.fill('[name="password"]', password);
      await page.fill('[name="repeatPassword"]', password);

      const [response] = await Promise.all([
        page.waitForResponse(endpoint),
        page.click('[type="submit"]', { timeout: interval }),
      ]);

      const postData = JSON.parse(response.request().postData());
      expect(postData.email).to.equal(email);
      expect(postData.password).to.equal(password);
    });

    it('login makes correct API call', async () => {
      const endpoint = '**' + endpoints.login;
      const email = 'john@abv.bg';
      const password = '123456';

      page.route(endpoint, (route) =>
        route.fulfill(json({ _id: '0001', email, accessToken: 'AAAA' }))
      );

      await page.goto(host);
      await page.click('text=Login', { timeout: interval });

      await page.waitForSelector('form', { timeout: interval });

      await page.fill('[name="email"]', email);
      await page.fill('[name="password"]', password);

      const [response] = await Promise.all([
        page.waitForResponse(endpoint),
        page.click('[type="submit"]', { timeout: interval }),
      ]);

      const postData = JSON.parse(response.request().postData());
      expect(postData.email).to.equal(email);
      expect(postData.password).to.equal(password);
    });
  });

  describe('CRUD', () => {
    const email = 'john@abv.bg';
    const password = '123456';

    // Login user
    const loginUser = async () => {
      const endpoint = '**' + endpoints.login;

      page.route(endpoint, (route) =>
        route.fulfill(json({ _id: '0001', email, accessToken: 'AAAA' }))
      );

      await page.goto(host);
      await page.click('text=Login', { timeout: interval });

      await page.waitForSelector('form', { timeout: interval });

      await page.fill('[name="email"]', email);
      await page.fill('[name="password"]', password);

      await Promise.all([
        page.waitForResponse(endpoint),
        page.click('[type="submit"]', { timeout: interval }),
      ]);
    };

    it('create makes correct API call for logged in user', async () => {
      await loginUser();
      const endpoint = '**' + endpoints.create;
      const mock = mockData.details;

      page.route(endpoint, (route) => route.fulfill(json(mock)));

      await page.click('text=Create', { timeout: interval });

      await page.waitForSelector('form');

      await page.fill('[name="title"]', mock.title);
      await page.fill('[name="description"]', mock.description);
      await page.fill('[name="imageURL"]', mock.img);

      const [response] = await Promise.all([
        page.waitForResponse(endpoint),
        page.click('[type="submit"]', { timeout: interval }),
      ]);

      const postData = JSON.parse(response.request().postData());
      expect(postData.title).to.equal(mock.title);
      expect(postData.description).to.equal(mock.description);
      expect(postData.img).to.equal(mock.img);
    });

    it('non-author does NOT see delete button', async () => {
      await loginUser();
      const mock = Object.assign({}, mockData.details, { _ownerId: '0002' }); // Replace mock with non-owned object
      await page.route('**' + endpoints.details + '*', (route) =>
        route.fulfill(json(mock))
      );

      await page.click('text=Dashboard', { timeout: interval });
      await page.waitForSelector('#dashboard-holder', { timeout: interval });
      await page.click('div.card:has-text("111111") >> text=Details', { timeout: interval });
      await page.waitForSelector('h2:has-text("111111")', { timeout: interval });

      const btn = await page.$$('text=Delete');
      expect(btn.length).to.equal(0);
    });

    it('author sees delete button', async () => {
      await loginUser();
      await page.click('text=Dashboard', { timeout: interval });
      await page.waitForSelector('#dashboard-holder', { timeout: interval });
      await page.click('div.card:has-text("111111") >> text=Details', { timeout: interval });
      await page.waitForSelector('h2:has-text("111111")', { timeout: interval });

      expect(await page.isVisible('text=Delete')).to.be.true;
      expect(await page.isEnabled('text=Delete')).to.be.true;
    });

    it('delete makes correct API call for logged in user', async () => {
      await loginUser();
      await page.click('text=Dashboard', { timeout: interval });
      await page.waitForSelector('#dashboard-holder', { timeout: interval });
      await page.click('div.card:has-text("111111") >> text=Details', { timeout: interval });
      await page.waitForSelector('h2:has-text("111111")', { timeout: interval });

      page.on('dialog', (dialog) => dialog.accept());

      const [request] = await Promise.all([
        page.waitForRequest('**' + endpoints.delete + '0003'),
        page.click('a:text("Delete")', { timeout: interval }),
      ]);

      expect(request.method()).to.equal('DELETE');
    });
  });
});
