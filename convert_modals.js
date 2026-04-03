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
  
  // 1. Replace outer container with Drawer container
  content = content.replace(
    /<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">([\s\S]*?)<div className="flex items-center space-x-3">/g,
    `<div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-md transition-opacity animate-in fade-in duration-300"
        onClick={onClose}
      />
      
      {/* Drawer Panel */}
      <div className="relative w-full max-w-3xl h-full bg-[#02040b] border-l border-white/10 shadow-2xl flex flex-col animate-in slide-in-from-right duration-500 pointer-events-auto overflow-hidden text-white font-sans">
        
        {/* Cinematic Backgrounds */}
        <div className="absolute top-0 left-0 w-full h-[500px] bg-[radial-gradient(circle_at_0%_0%,rgba(168,85,247,0.15),transparent_70%)] pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-full h-[500px] bg-[radial-gradient(circle_at_100%_100%,rgba(6,182,212,0.1),transparent_70%)] pointer-events-none" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay pointer-events-none" />

        <div className="flex justify-between items-center p-6 border-b border-white/10 relative z-10 bg-[#02040b]/50 backdrop-blur-md">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center space-x-3">`
  );

  // 2. Fix the Close X button in the header
  content = content.replace(
    /<X className="h-6 w-6" \/>/g,
    `<X className="h-6 w-6 text-white/50 group-hover:text-cyan-400 group-hover:rotate-90 transition-all duration-300" />`
  );

  // 3. Fix the footer container close button
  content = content.replace(
    /className="flex justify-end pt-6 border-t mt-6"([\s\S]*?)Close\s*<\/button>\s*<\/div>\s*<\/div>\s*\)\s*:\s*null}\s*<\/div>\s*<\/div>\s*<\/div>/,
    `>
              </div>
            </div>
          ) : null}
        </div>
        
        {/* Footer Actions */}
        <div className="absolute bottom-0 left-0 right-0 p-6 bg-[#02040b]/90 backdrop-blur-xl border-t border-white/10 flex justify-end">
          <button
            onClick={onClose}
            className="px-8 py-3 font-bold uppercase tracking-widest text-[11px] rounded-xl flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
            style={{
              background: 'linear-gradient(135deg, rgba(168,85,247,0.3) 0%, rgba(59,130,246,0.3) 100%)',
              color: '#fff',
              border: '1px solid rgba(168,85,247,0.5)',
            }}
          >
            Acknowledge & Close
          </button>
        </div>
      </div>
    </div>`
  );

  // 4. Transform Light Mode classes to Dark Glass Mode classes
  content = content.replace(/bg-gray-50/g, 'bg-white/5 border border-white/10');
  content = content.replace(/bg-gray-100/g, 'bg-white/10 border border-white/10');
  content = content.replace(/border-gray-200/g, 'border-white/10');
  content = content.replace(/text-gray-900/g, 'text-white');
  content = content.replace(/text-gray-800/g, 'text-white/90');
  content = content.replace(/text-gray-700/g, 'text-white/80');
  content = content.replace(/text-gray-600/g, 'text-white/60');
  content = content.replace(/text-gray-500/g, 'text-white/50');
  
  // Specific accent mappings
  content = content.replace(/bg-purple-50/g, 'bg-purple-500/10 border border-purple-500/20');
  content = content.replace(/bg-blue-50/g, 'bg-blue-500/10 border border-blue-500/20');
  content = content.replace(/bg-red-50/g, 'bg-red-500/10 border border-red-500/20');
  content = content.replace(/bg-green-50/g, 'bg-emerald-500/10 border border-emerald-500/20');
  
  content = content.replace(/text-purple-900|text-purple-800/g, 'text-white');
  content = content.replace(/text-purple-600/g, 'text-fuchsia-400');
  content = content.replace(/text-blue-900|text-blue-800/g, 'text-white');
  content = content.replace(/text-blue-600/g, 'text-cyan-400');
  
  // Inner wrapper
  content = content.replace(/<div className="p-6">/g, '<div className="p-8 overflow-y-auto h-full space-y-8 pb-32">');

  fs.writeFileSync(filePath, content, 'utf-8');
});
