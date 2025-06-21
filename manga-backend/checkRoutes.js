// checkRoutes.js
const fs = require('fs');
const path = require('path');

const ROUTES_DIR = path.join(__dirname, 'src', 'routes');

const regex = /router\.(get|post|put|delete|patch)\s*\(\s*['"`]([^'"`]+)['"`]/g;

const isMalformed = (route) => {
  return (
    route === '/:' ||
    route.includes('::') ||
    route.match(/^\/:[^a-zA-Z0-9]/) ||
    route.match(/\/:$/) ||
    route.match(/\/:[^a-zA-Z]/) ||  // como "/:1id"
    route.match(/^\/:$/)
  );
};

function checkRoutesInFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const matches = [...content.matchAll(regex)];

  matches.forEach((match) => {
    const route = match[2];
    if (isMalformed(route)) {
      console.log(`❌ Ruta malformada en ${filePath} => "${route}"`);
    }
  });
}

function scanRoutes(dir) {
  const files = fs.readdirSync(dir);
  files.forEach((file) => {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      scanRoutes(fullPath);
    } else if (file.endsWith('.js')) {
      checkRoutesInFile(fullPath);
    }
  });
}

console.log('🔍 Escaneando rutas en src/routes...');
scanRoutes(ROUTES_DIR);
console.log('✅ Análisis completado.');
