#!/usr/bin/env node

/**
 * 🔧 Script de solución rápida para problemas de rutas en Express
 * 
 * Este script identifica y corrige problemas comunes con rutas
 * que causan el error "Missing parameter name" en Express 5.x
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 MangaVerse Route Fixer');
console.log('========================');

// Función para buscar archivos de rutas
function findRouteFiles(dir) {
  const files = [];
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      files.push(...findRouteFiles(fullPath));
    } else if (item.endsWith('.routes.js') || item.endsWith('.route.js')) {
      files.push(fullPath);
    }
  }
  
  return files;
}

// Función para analizar problemas en archivos de rutas
function analyzeRouteFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  const issues = [];
  
  let routerRoutes = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Buscar definiciones de rutas
    const routeMatch = line.match(/router\.(get|post|put|delete|patch|all)\s*\(\s*['"`]([^'"`]+)['"`]/);
    if (routeMatch) {
      const method = routeMatch[1];
      const route = routeMatch[2];
      
      routerRoutes.push({
        line: i + 1,
        method,
        route,
        fullLine: line
      });
      
      // Buscar problemas específicos
      
      // 1. Wildcard sin nombre en Express 5.x
      if (route === '*' || route.includes('*') && !route.includes('*') === false) {
        issues.push({
          type: 'wildcard',
          line: i + 1,
          issue: `Wildcard sin nombre: "${route}"`,
          suggestion: `Cambiar "${route}" por "/*catchall" o similar`,
          severity: 'high'
        });
      }
      
      // 2. Caracteres problemáticos
      if (route.includes('?') || route.includes('+')) {
        issues.push({
          type: 'special_chars',
          line: i + 1,
          issue: `Caracteres especiales problemáticos en: "${route}"`,
          suggestion: 'Usar sintaxis de grupos con llaves {...}',
          severity: 'medium'
        });
      }
      
      // 3. Parámetros mal formados
      if (route.includes(':') && !route.match(/:[a-zA-Z][a-zA-Z0-9_]*/)) {
        issues.push({
          type: 'malformed_param',
          line: i + 1,
          issue: `Parámetro mal formado en: "${route}"`,
          suggestion: 'Asegurar que los parámetros sigan el formato :nombreParametro',
          severity: 'high'
        });
      }
    }
  }
  
  // Verificar orden de rutas
  for (let i = 0; i < routerRoutes.length - 1; i++) {
    const current = routerRoutes[i];
    const next = routerRoutes[i + 1];
    
    // Si una ruta específica viene después de una ruta con parámetros
    if (current.route.includes(':') && !next.route.includes(':') && 
        current.method === next.method) {
      issues.push({
        type: 'route_order',
        line: next.line,
        issue: `Ruta específica "${next.route}" después de ruta con parámetros "${current.route}"`,
        suggestion: `Mover "${next.route}" antes de "${current.route}"`,
        severity: 'high'
      });
    }
  }
  
  return { routes: routerRoutes, issues };
}

// Función principal
function main() {
  const routesDir = path.join(__dirname, 'routes');
  
  if (!fs.existsSync(routesDir)) {
    console.log('❌ Directorio de rutas no encontrado:', routesDir);
    return;
  }
  
  console.log('📁 Buscando archivos de rutas en:', routesDir);
  
  const routeFiles = findRouteFiles(routesDir);
  console.log(`📄 Encontrados ${routeFiles.length} archivos de rutas`);
  
  let totalIssues = 0;
  
  for (const filePath of routeFiles) {
    console.log(`\n🔍 Analizando: ${path.basename(filePath)}`);
    
    try {
      const analysis = analyzeRouteFile(filePath);
      
      if (analysis.issues.length === 0) {
        console.log('  ✅ No se encontraron problemas');
      } else {
        console.log(`  ⚠️  ${analysis.issues.length} problema(s) encontrado(s):`);
        
        for (const issue of analysis.issues) {
          const severity = issue.severity === 'high' ? '🔴' : '🟡';
          console.log(`    ${severity} Línea ${issue.line}: ${issue.issue}`);
          console.log(`       💡 Sugerencia: ${issue.suggestion}`);
        }
        
        totalIssues += analysis.issues.length;
      }
      
    } catch (error) {
      console.log(`  ❌ Error analizando archivo: ${error.message}`);
    }
  }
  
  console.log(`\n📊 Resumen:`);
  console.log(`   - Archivos analizados: ${routeFiles.length}`);
  console.log(`   - Problemas encontrados: ${totalIssues}`);
  
  if (totalIssues > 0) {
    console.log('\n🔧 Soluciones recomendadas:');
    console.log('   1. Actualizar rutas con wildcards: * → /*catchall');
    console.log('   2. Mover rutas específicas antes que rutas con parámetros');
    console.log('   3. Verificar sintaxis de parámetros (:nombre)');
    console.log('   4. Usar Express 4.x temporalmente si es necesario');
    
    console.log('\n📦 Para usar Express 4.x:');
    console.log('   npm install express@^4.18.2');
    console.log('   npm install express-rate-limit@^6.10.0');
  } else {
    console.log('\n✅ ¡Todo se ve bien! El problema puede estar en otro lugar.');
  }
  
  console.log('\n🚀 Para más ayuda, consulta:');
  console.log('   https://github.com/expressjs/express/issues/5936');
  console.log('   https://github.com/pillarjs/path-to-regexp');
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  main();
}

module.exports = { analyzeRouteFile, findRouteFiles };