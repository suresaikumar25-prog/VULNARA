const fs = require('fs');
const path = require('path');

const modalsPath = path.join(__dirname, 'src', 'components');
const modals = [
  'AdvancedSecurityModal.tsx',
  'AIRemediationModal.tsx',
  'ContextualRiskModal.tsx',
  'ThreatIntelligenceModal.tsx',
  'PredictiveAnalyticsModal.tsx'
];

modals.forEach((modal) => {
  const filePath = path.join(modalsPath, modal);
  if (!fs.existsSync(filePath)) return;
  
  let content = fs.readFileSync(filePath, 'utf-8');
  
  content = content.replace(/<div className="flex items-center justify-between w-full">\s*<div className="flex items-center space-x-3">/, '<div className="flex items-center space-x-3">');

  fs.writeFileSync(filePath, content, 'utf-8');
});
