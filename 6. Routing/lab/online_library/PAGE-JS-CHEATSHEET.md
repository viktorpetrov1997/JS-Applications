# 📘 Page.js Cheat Sheet

## 🎯 Core Concepts

### What is Page.js?
- **Micro routing library** for client-side navigation
- Intercepts clicks and changes URL without page reload
- Uses History API
- ~1200 lines of code, very lightweight

---

## 📝 Syntax

### 1. Basic route definition
```javascript
page('/path', handlerFunction);
```

### 2. Route with parameter
```javascript
page('/books/:id', (ctx) => {
    console.log(ctx.params.id);
});
```

### 3. Route with multiple parameters
```javascript
page('/category/:cat/book/:id', (ctx) => {
    console.log(ctx.params.cat);  // category
    console.log(ctx.params.id);   // ID
});
```

### 4. Wildcard route
```javascript
page('*', show404);  // Matches all URLs
```

### 5. Root route
```javascript
page('/', showHome);  // Root URL only
```

---

## 🔧 Context Object (ctx)

Page.js passes a `ctx` object to every handler:

```javascript
{
  params: {},        // URL parameters from :param
  path: '',          // Full path (/books/1)
  pathname: '',      // Path without query string
  querystring: '',   // Query string (?search=test)
  state: {},         // Custom state
  hash: '',          // Hash (#section)
  title: ''          // Page title
}
```

### Example:
```javascript
// URL: /books/123?sort=title#reviews

page('/books/:id', (ctx) => {
    ctx.params.id       // '123'
    ctx.path            // '/books/123?sort=title'
    ctx.pathname        // '/books/123'
    ctx.querystring     // 'sort=title'
    ctx.hash            // '#reviews'
});
```

---

## ⚠️ Critical Rules

### 1. Route order is IMPORTANT!
```javascript
// ✅ CORRECT
page('/books/add', handler1);     // Specific
page('/books/:id', handler2);     // Dynamic

// ❌ WRONG
page('/books/:id', handler2);     // 'add' will be caught here!
page('/books/add', handler1);     // Will never be reached
```

**Rule:** From specific to general, from concrete to dynamic!

### 2. Starting the router
```javascript
// At the end, REQUIRED:
page();  // Without this, Page.js WON'T work!
```

### 3. Parameters are strings!
```javascript
page('/books/:id', (ctx) => {
    ctx.params.id         // '1' (string!)
    Number(ctx.params.id) // 1 (number)
});
```

---

## 🚀 API Methods

### Navigation
```javascript
page('/books');              // Navigate to /books
page.redirect('/books');     // Redirect to /books
page.replace('/books');      // Replace (no history entry)
page.back();                 // Go back
```

### State management
```javascript
page('/books', { state: 'data' });  // Pass state
```

### Event listeners
```javascript
page.start();                // Start router
page.stop();                 // Stop router
```

### Middleware pattern
```javascript
// Middleware executes BEFORE handler
function checkAuth(ctx, next) {
    if (isLoggedIn) {
        next();  // Continue to handler
    } else {
        page.redirect('/login');
    }
}

page('/admin', checkAuth, showAdmin);
```

---

## 💡 Practical Examples

### Example 1: Simple routing
```javascript
import { render, html } from 'lit-html';

const main = document.querySelector('main');

// Handlers
function showHome() {
    render(html`<h1>Home</h1>`, main);
}

function showAbout() {
    render(html`<h1>About</h1>`, main);
}

// Routes
page('/', showHome);
page('/about', showAbout);

// Start
page();
```

### Example 2: Dynamic routes
```javascript
function showUser(ctx) {
    const userId = ctx.params.id;
    const user = getUser(userId);
    render(html`<h1>${user.name}</h1>`, main);
}

page('/users/:id', showUser);
page();
```

### Example 3: Query strings
```javascript
function showSearch(ctx) {
    const query = new URLSearchParams(ctx.querystring);
    const search = query.get('q');
    
    render(html`<h1>Search: ${search}</h1>`, main);
}

page('/search', showSearch);
// URL: /search?q=books
```

### Example 4: 404 page
```javascript
function show404() {
    render(html`<h1>404 - Not Found</h1>`, main);
}

// At the end, after all routes:
page('*', show404);
page();
```

### Example 5: Middleware for auth
```javascript
function requireAuth(ctx, next) {
    if (!user.isLoggedIn) {
        page.redirect('/login');
    } else {
        next();
    }
}

page('/profile', requireAuth, showProfile);
page('/settings', requireAuth, showSettings);
page();
```

---

## 🐛 Common Mistakes

### 1. Forgetting page()
```javascript
page('/', showHome);
// ❌ You forgot page() - WON'T work!

page('/', showHome);
page();  // ✅
```

### 2. Wrong order
```javascript
// ❌
page('/books/:id', showBook);
page('/books/new', showNew);  // Will never match!

// ✅
page('/books/new', showNew);
page('/books/:id', showBook);
```

### 3. Forgetting params are strings
```javascript
page('/books/:id', (ctx) => {
    const id = ctx.params.id;
    if (id > 10) {  // ❌ String comparison!
        // ...
    }
    
    const id = Number(ctx.params.id);
    if (id > 10) {  // ✅
        // ...
    }
});
```

### 4. Hash routing conflict
```javascript
// If using hash (#) routes:
page({ hashbang: true });  // Enable hashbang mode
```

---

## 📊 Comparison with Other Libraries

| Feature | Page.js | React Router | Vue Router |
|---------|---------|--------------|------------|
| Size | ~4KB | ~12KB | ~15KB |
| Learning curve | Easy | Medium | Medium |
| Framework | Agnostic | React only | Vue only |
| Features | Basic | Advanced | Advanced |
| Best for | Simple SPAs | React apps | Vue apps |

---

## 🔗 Useful Resources

- **Official Documentation:** https://visionmedia.github.io/page.js/
- **GitHub:** https://github.com/visionmedia/page.js
- **Examples:** https://github.com/visionmedia/page.js/tree/master/examples

---

## 🎓 Practice

### Task 1: Basic routing
Create 3 routes:
- `/` → home
- `/about` → about
- `/contact` → contact

### Task 2: Dynamic route
Create route `/products/:id` that displays a product

### Task 3: Route order
Create routes:
- `/products/new` → form for new product
- `/products/:id` → product details
In the correct order!

### Task 4: 404
Add wildcard route for 404 page

### Task 5: Query strings
Create `/search` route that extracts the `?q=` parameter

---

## 📌 Quick Facts

- ✅ Works with all frameworks (React, Vue, Svelte, Lit)
- ✅ Works with vanilla JS
- ✅ Uses History API (pushState)
- ✅ Automatically intercepts `<a>` clicks
- ✅ Supports browser back/forward buttons
- ✅ Can be used on server (Node.js)
- ✅ No dependencies

---

**Remember:** Page.js is a tool, not magic. What it does is simple:
1. Listens for URL changes
2. Matches URL with pattern
3. Calls your function

**That's it!** 🎉

