const fs = require('fs');
const file = 'c:/Users/manik/OneDrive/Desktop/xoon to submit/server/src/index.ts';

let content = fs.readFileSync(file, 'utf8');

// Step 1: Replace all standard 500 blocks natively with next(error)
const original = content;

// Many catch blocks look like:
// catch (error) { console.error('...', error); res.status(500).json({ message: 'Internal server error' }); }
content = content.replace(/catch\s*\(([^)]+)\)\s*\{[\s\S]*?res\.status\(500\)\.json\([^\)]+\);[\s\S]*?\}/g, (match, param) => {
  return `catch (${param}) {
    console.error('Error caught in route:', ${param});
    next(${param});
  }`;
});

// Step 2: Ensure any route handler (app.get, app.post, etc) that we just added next() to actually accepts next as a parameter!
// E.g. app.get('/...', async (req, res) => {  ... next(error) ... })
// Needs to be async (req, res, next) => {
content = content.replace(/async \((req,\s*res)\)\s*=>/g, 'async (req, res, next) =>');

if (content !== original) {
  fs.writeFileSync(file, content);
  console.log('Successfully refactored 500 error handlers to next(error)!');
} else {
  console.log('No matches found.');
}
