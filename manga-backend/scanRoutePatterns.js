// 📁 scanRoutePatterns.js
const fs = require('fs');
const path = require('path');

const ROUTES_DIR = path.join(__dirname, 'src', 'routes');

const badPatternRegex = /['"`]\/:(?:[^a-zA-Z_]|$)|\/:\)|\/:\(/g;
const interpolatedRegex = /['"`]\/:\$\{.*\}/g;

const files = fs.readdirSync(ROUTES_DIR).filter(f => f.endsWith('.js'));

console.log('🔍 Escaneando rutas problemáticas...\n');

let hasIssues = false;

files.forEach(file => {
  const filePath = path.join(ROUTES_DIR, file);
  const content = fs.readFileSync(filePath, 'utf8');

  const lines = content.split('\n');
  lines.forEach((line, index) => {
    if (badPatternRegex.test(line) || interpolatedRegex.test(line)) {
      console.log(`⚠️ Posible error en ${file}:${index + 1}`);
      console.log(`   → ${line.trim()}`);
      hasIssues = true;
    }
  });
});

if (!hasIssues) {
  console.log('✅ No se detectaron rutas problemáticas.');
}
