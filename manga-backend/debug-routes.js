const fs = require('fs');
const path = require('path');

console.log('🔍 Escaneando posibles errores en app.use(...)');

const sourceFile = path.join(__dirname, 'src', 'app.js');
const content = fs.readFileSync(sourceFile, 'utf8');

const regex = /app\.use\(([^)]+)\)/g;
let match;
let foundIssues = false;

while ((match = regex.exec(content)) !== null) {
  const line = match[0].trim();

  // Revisamos si el primer argumento es una variable (no string)
  const arg = match[1].split(',')[0].trim();
  const isString = /^['"`]/.test(arg);

  if (!isString && !arg.startsWith('/')) {
    console.log(`⚠️  Posible problema con esta línea:`);
    console.log(`   → ${line}\n`);
    foundIssues = true;
  }
}

if (!foundIssues) {
  console.log('✅ Todas las rutas parecen estar bien definidas');
}
