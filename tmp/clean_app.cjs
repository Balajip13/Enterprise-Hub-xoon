const fs = require('fs');
const file = 'c:/Users/manik/OneDrive/Desktop/xoon to submit/App.tsx';

let content = fs.readFileSync(file, 'utf8');

// Use regex to comment out all console.log lines in App.tsx
// This is more robust than manual replacement
content = content.replace(/(\s*)(console\.log\()/g, '$1\/\/ $2');

fs.writeFileSync(file, content);
console.log('Successfully commented out console.logs in App.tsx');
