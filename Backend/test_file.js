import fs from 'fs';

try {
  const buffer = fs.readFileSync('d:\\A\\Final year Project\\my-app\\Frontend\\public\\assets\\categories\\mechanic.png');
  console.log('File read successfully. Size:', buffer.length);
  console.log('First 8 bytes (PNG signature):', buffer.slice(0, 8));
} catch (err) {
  console.error('Error reading file:', err);
}
