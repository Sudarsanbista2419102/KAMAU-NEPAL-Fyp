import express from 'express';
import adminRoute from './adminRoute.js';

const app = express();
app.use(express.json());

// Mount admin routes
app.use('/api/admin', adminRoute);

// Test server
const PORT = 3001;
app.listen(PORT, () => {
  console.log(`🧪 Test server running on http://localhost:${PORT}`);
  
  // List all registered routes
  console.log('\n📋 Registered Admin Routes:');
  
  function printRoutes(stack, basePath = '') {
    stack.forEach((layer) => {
      if (layer.route) {
        const methods = Object.keys(layer.route.methods).join(', ').toUpperCase();
        console.log(`   ${methods} ${basePath}${layer.route.path}`);
      } else if (layer.name === 'router' && layer.handle.stack) {
        const routerPath = layer.regexp.source
          .replace('\\/?(?=\\/|$)', '')
          .replace(/\\\//g, '/')
          .replace('^', '');
        printRoutes(layer.handle.stack, basePath + routerPath);
      }
    });
  }
  
  printRoutes(app._router.stack);
  
  // Check specifically for unblock route
  const hasUnblockRoute = JSON.stringify(app._router.stack).includes('unblock');
  console.log(`\n🔍 Unblock route exists: ${hasUnblockRoute ? '✅ YES' : '❌ NO'}`);
  
  console.log('\n🎯 Test completed. Press Ctrl+C to exit.');
});