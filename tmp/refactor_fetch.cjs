const fs = require('fs');
const file = 'c:/Users/manik/OneDrive/Desktop/xoon to submit/services/apiService.ts';

let content = fs.readFileSync(file, 'utf8');

const fetchWrapper = `
const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
  const token = localStorage.getItem('token');
  const headers = new Headers(options.headers || {});
  if (token) {
    headers.set('Authorization', \`Bearer \${token}\`);
  }
  return fetch(url, { ...options, headers });
};
`;

if (!content.includes('fetchWithAuth')) {
  // Insert exactly after API_URL definition
  content = content.replace(/(const API_URL = [^\n]+\n+)/, '$1' + fetchWrapper + '\n');
  
  // Replace 'await fetch(' with 'await fetchWithAuth(' globally
  content = content.replace(/await fetch\(/g, 'await fetchWithAuth(');
  
  fs.writeFileSync(file, content);
  console.log('Successfully injected fetchWithAuth into apiService.ts');
} else {
  console.log('Already injected.');
}
