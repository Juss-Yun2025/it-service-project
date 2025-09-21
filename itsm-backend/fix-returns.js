const fs = require('fs');
const path = require('path');

const controllersDir = path.join(__dirname, 'src', 'controllers');

// Controller files to fix
const files = [
  'authController.ts',
  'serviceController.ts', 
  'userController.ts',
  'inquiryController.ts',
  'faqController.ts',
  'reportController.ts'
];

files.forEach(filename => {
  const filePath = path.join(controllersDir, filename);
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Find patterns like:
  // res.status(401).json({
  //   success: false,
  //   message: '...'
  // } as ApiResponse);
  // (without return)
  
  // And add return; after them
  
  // Pattern 1: Error responses in if blocks
  content = content.replace(
    /(\s+)(res\.status\(\d+\)\.json\(\{[^}]*\}\s*as\s*ApiResponse\);\s*)(?!\s*return;)/g,
    '$1$2\n$1return;'
  );
  
  fs.writeFileSync(filePath, content);
  console.log(`Fixed ${filename}`);
});

console.log('All files fixed!');
