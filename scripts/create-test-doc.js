const fs   = require('fs');
const path = require('path');

// Minimal valid 1x1 white PNG
const PNG = Buffer.from([
  137,80,78,71,13,10,26,10,
  0,0,0,13,73,72,68,82,0,0,0,1,0,0,0,1,8,2,0,0,0,144,119,83,222,
  0,0,0,12,73,68,65,84,8,215,99,248,15,0,0,1,1,0,5,24,213,78,
  0,0,0,0,73,69,78,68,174,66,96,130
]);

const targets = [
  path.resolve(__dirname, '../src/modules/Administration/UserManagement/EmployeeMaster/data/test-doc.png'),
  path.resolve(__dirname, '../src/modules/Administration/UserManagement/UserMaster/data/test-doc.png'),
];

targets.forEach(p => {
  fs.writeFileSync(p, PNG);
  console.log('Created:', p, '|', fs.statSync(p).size, 'bytes');
});
