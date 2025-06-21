#!/usr/bin/env node

/**
 * 🚀 SOLUCIÓN RÁPIDA para el error "Missing parameter name"
 * ========================================================
 * 
 * Ejecuta este script desde el directorio raíz de tu proyecto:
 * node quick-fix.js
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 MangaVerse - Solución Rápida');
console.log('===============================\n');

// Verificar que estamos en el directorio correcto
if (!fs.existsSync('./src/routes')) {
  console.log('❌ Error: No se encuentra el directorio ./src/routes');
  console.log('💡 Asegúrate de ejecutar este script desde el directorio raíz del proyecto\n');
  process.exit(1);
}

const mangaRoutesPath = './src/routes/manga.routes.js';

// Verificar que existe manga.routes.js
if (!fs.existsSync(mangaRoutesPath)) {
  console.log('❌ Error: No se encuentra ./src/routes/manga.routes.js');
  process.exit(1);
}

console.log('✅ Archivo encontrado: manga.routes.js');

// Leer el contenido actual
const currentContent = fs.readFileSync(mangaRoutesPath, 'utf8');

// Verificar el problema específico
const trendingPos = currentContent.indexOf("router.get('/trending'");
const idParamPos = currentContent.indexOf("router.get('/:id'");
const statsPos = currentContent.indexOf("router.get('/stats'");

console.log('\n🔍 Análisis del problema:');

if (trendingPos === -1) {
  console.log('⚠️  No se encontró la ruta /trending');
} else if (idParamPos === -1) {
  console.log('⚠️  No se encontró la ruta /:id');
} else if (trendingPos > idParamPos) {
  console.log('🔴 PROBLEMA ENCONTRADO: /trending está definido DESPUÉS de /:id');
  console.log('   Esto causa el error "Missing parameter name"');
  
  // Crear backup
  const backupPath = mangaRoutesPath + '.backup.' + Date.now();
  fs.copyFileSync(mangaRoutesPath, backupPath);
  console.log(`✅ Backup creado: ${backupPath}`);
  
  // Aplicar corrección automática
  console.log('\n🔧 Aplicando corrección...');
  
  const correctedContent = fixRouteOrder(currentContent);
  fs.writeFileSync(mangaRoutesPath, correctedContent);
  
  console.log('✅ Corrección aplicada exitosamente');
  console.log('\n🚀 Ahora puedes ejecutar: node src/app.js');
  
} else {
  console.log('✅ El orden de rutas parece estar correcto');
  console.log('💡 El problema podría estar en otra parte. Revisando...');
  
  // Buscar otros problemas comunes
  const issues = findOtherIssues(currentContent);
  if (issues.length > 0) {
    console.log('\n⚠️  Otros problemas encontrados:');
    issues.forEach(issue => console.log(`   - ${issue}`));
  }
}

function fixRouteOrder(content) {
  const lines = content.split('\n');
  const fixedLines = [];
  const specificRoutes = [];
  const paramRoutes = [];
  let currentRoute = [];
  let isCollectingRoute = false;
  let routeType = null;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Detectar inicio de ruta
    const routeMatch = line.match(/router\.(get|post|put|delete)\s*\(\s*['"`]([^'"`]+)['"`]/);
    
    if (routeMatch) {
      // Si ya estábamos recolectando una ruta, guardarla
      if (isCollectingRoute && currentRoute.length > 0) {
        if (routeType === 'specific') {
          specificRoutes.push(...currentRoute);
        } else {
          paramRoutes.push(...currentRoute);
        }
      }
      
      // Iniciar nueva ruta
      const route = routeMatch[2];
      currentRoute = [line];
      isCollectingRoute = true;
      
      // Determinar tipo de ruta
      if (route.includes(':') || route === '/') {
        routeType = 'param';
      } else {
        routeType = 'specific';
      }
    } else if (isCollectingRoute) {
      currentRoute.push(line);
      
      // Si encontramos el final de la función, guardar la ruta
      if (line.trim() === '});' && currentRoute.length > 5) {
        if (routeType === 'specific') {
          specificRoutes.push(...currentRoute);
        } else {
          paramRoutes.push(...currentRoute);
        }
        currentRoute = [];
        isCollectingRoute = false;
      }
    } else {
      // Líneas que no son parte de rutas
      if (!line.includes('router.')) {
        fixedLines.push(line);
      }
    }
  }
  
  // Guardar la última ruta si quedó pendiente
  if (isCollectingRoute && currentRoute.length > 0) {
    if (routeType === 'specific') {
      specificRoutes.push(...currentRoute);
    } else {
      paramRoutes.push(...currentRoute);
    }
  }
  
  // Reconstruir el archivo con el orden correcto
  const result = [
    ...fixedLines.slice(0, findInsertPosition(fixedLines)),
    '',
    '// ✅ RUTAS ESPECÍFICAS PRIMERO',
    '// ===========================',
    '',
    ...specificRoutes,
    '',
    '// ✅ RUTAS CON PARÁMETROS DESPUÉS', 
    '// ==============================',
    '',
    ...paramRoutes,
    '',
    ...fixedLines.slice(findInsertPosition(fixedLines))
  ];
  
  return result.join('\n');
}

function findInsertPosition(lines) {
  // Encontrar la posición después de los middlewares y antes de las rutas
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('// GET ') || lines[i].includes('router.')) {
      return i;
    }
  }
  return lines.length;
}

function findOtherIssues(content) {
  const issues = [];
  const lines = content.split('\n');
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Buscar rutas malformadas
    if (line.includes('router.')) {
      const routeMatch = line.match(/router\.\w+\s*\(\s*['"`]([^'"`]+)['"`]/);
      if (routeMatch) {
        const route = routeMatch[1];
        
        // Verificar problemas específicos
        if (route.endsWith(':')) {
          issues.push(`Línea ${i + 1}: Parámetro sin nombre al final: "${route}"`);
        }
        
        if (route.includes('::')) {
          issues.push(`Línea ${i + 1}: Doble ":" en ruta: "${route}"`);
        }
        
        if (route.includes(':') && !route.match(/:[a-zA-Z][a-zA-Z0-9_]*/)) {
          issues.push(`Línea ${i + 1}: Parámetro mal formado: "${route}"`);
        }
      }
    }
  }
  
  return issues;
}

console.log('\n📝 Notas importantes:');
console.log('   - Se creó un backup del archivo original');
console.log('   - La corrección reordena las rutas automáticamente');
console.log('   - Las rutas específicas van antes que las de parámetros');
console.log('   - Si tienes más problemas, revisa los demás archivos de rutas');

console.log('\n🔍 Para más diagnósticos, ejecuta el script de debug completo');