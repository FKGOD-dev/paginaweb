import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Necesario en ESModules para __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const baseDir = path.join(__dirname, 'src');

const suspiciousPatterns = [
  /\/:\W/g,
  /\/:\s*$/g,
  /\/api\/:/g,
  /\$\{\s*\}/g,
  /\/\$\{.*\}/g
];

function scanDir(dir) {
  const results = [];

  fs.readdirSync(dir).forEach(file => {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      results.push(...scanDir(fullPath));
    } else if (/\.(js|jsx|ts|tsx)$/.test(fullPath)) {
      const content = fs.readFileSync(fullPath, 'utf-8');
      suspiciousPatterns.forEach(pattern => {
        const matches = [...content.matchAll(pattern)];
        matches.forEach(match => {
          results.push({
            file: fullPath,
            match: match[0],
            line: content.substring(0, match.index).split('\n').length
          });
        });
      });
    }
  });

  return results;
}

console.log('🔍 Escaneando archivos del frontend...');
const issues = scanDir(baseDir);

if (issues.length === 0) {
  console.log('✅ No se encontraron rutas sospechosas.');
} else {
  console.log(`⚠️  Se encontraron ${issues.length} coincidencias sospechosas:\n`);
  issues.forEach(issue => {
    console.log(`📄 ${issue.file} (línea ${issue.line}): "${issue.match}"`);
  });
}
