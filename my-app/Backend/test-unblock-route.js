import express from 'express';
import adminRoute from './adminRoute.js';

const app = express();

// Test if the route is properly registered
app.use('/api/admin', adminRoute);

// Get all registered routes
function getRoutes(app) {
  const routes = [];
  
  app._router.stack.forEach(function(middleware) {
    if (middleware.route) {
      routes.push({
        method: Object.keys(middleware.route.methods)[0].toUpperCase(),
        path: middleware.route.path
      });
    } else if (middleware.name === 'router') {
      middleware.handle.stack.forEach(function(handler) {
        if (handler.route) {
          const basePath = middleware.regexp.source.replace('\\/?(?=\\/|$)', '').replace(/\\\//g, '/').replace('^', '');
          routes.push({
            method: Object.keys(handler.route.methods)[0].toUpperCase(),
            path: basePath + handler.route.path
          });
        }
      });
    }
  });
  
  return routes;
}

console.log('🔍 Checking registered admin routes...\n');

const routes = getRoutes(app);
const unblockRoute = routes.find(r => r.path.includes('unblock'));

if (unblockRoute) {
  console.log('✅ Unblock route found:');
  console.log(`   ${unblockRoute.method} ${unblockRoute.path}`);
} else {
  console.log('❌ Unblock route NOT found');
  console.log('\n📋 All admin routes:');
  routes.forEach(route => {
    if (route.path.startsWith('/api/admin')) {
      console.log(`   ${route.method} ${route.path}`);
    }
  });
}

console.log('\n🎯 Route registration test completed');
process.exit(0);