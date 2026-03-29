const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(function(file) {
    file = dir + '/' + file;
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) { 
      results = results.concat(walk(file));
    } else { 
      if (file.endsWith('.tsx') || file.endsWith('.ts')) results.push(file);
    }
  });
  return results;
}

const files = walk('c:/Users/manik/OneDrive/Desktop/xoon to submit/views').concat(['c:/Users/manik/OneDrive/Desktop/xoon to submit/services/apiService.ts']);

files.forEach(f => {
  let content = fs.readFileSync(f, 'utf8');
  let original = content;
  
  // Replace string literals (e.g. 'http://localhost:5000/api/auth')
  content = content.replace(/'http:\/\/localhost:5000\/api\/([^']+)'/g, '`${import.meta.env.VITE_API_URL}/$1`');
  content = content.replace(/"http:\/\/localhost:5000\/api\/([^"]+)"/g, '`${import.meta.env.VITE_API_URL}/$1`');
  
  // Replace base constants
  content = content.replace(/'http:\/\/localhost:5000\/api'/g, 'import.meta.env.VITE_API_URL');
  content = content.replace(/"http:\/\/localhost:5000\/api"/g, 'import.meta.env.VITE_API_URL');

  // Replace inside template literals (e.g. `http://localhost:5000/api/admin/support/${id}`) -> `${import.meta.env.VITE_API_URL}/admin/support/${id}`
  content = content.replace(/http:\/\/localhost:5000\/api/g, '${import.meta.env.VITE_API_URL}');
  
  if (content !== original) {
    fs.writeFileSync(f, content);
    console.log('Updated', f);
  }
});
