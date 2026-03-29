const fs = require('fs');
const path = require('path');

const files = [
  'c:/Users/manik/OneDrive/Desktop/xoon to submit/server/src/index.ts',
  'c:/Users/manik/OneDrive/Desktop/xoon to submit/server/src/routes/payment.ts'
];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');

  // 1. Remove console.logs in production paths (Keeping necessary ones like server port)
  content = content.replace(/console\.log\(`\[Payments\] Membership activated for user: \${payment\.userId}`\);/g, '');
  content = content.replace(/console\.log\('Admin account initialized: admin@xoon\.com \/ admin@xoon321'\);/g, '');

  // 2. Fix missing 'next' in function parameters where next is called in catch
  // Match handlers like: app.get('/...', async (req, res: Response) => { try { ... } catch (error) { next(error); } })
  // We look for patterns where next(error) is called but 'next' is not in the (req, res...) part
  
  // Replace async (req, res: Response) => with async (req, res, next) => if catch uses next
  content = content.replace(/async\s*\((req,\s*res(:?\s*Response)?)\)\s*=>\s*\{([\s\S]*?next\()/g, 'async ($1, next) => {$3');

  fs.writeFileSync(file, content);
  console.log(`Processed ${path.basename(file)}`);
});
