import React from 'react';
import { ABLLS_DOMAINS } from '../data/ablls';

const DomainProgressBar = ({ currentDomainId, studentDomains }) => {
  return (
    <div className="w-full overflow-x-auto pb-4 hide-scrollbar">
      <div className="flex space-x-2 min-w-max px-2">
        {ABLLS_DOMAINS.map((domain) => {
          const isActive = currentDomainId === domain.id;
          const status = studentDomains?.[domain.id];
          
          // Determine color:
          // grey = not started, blue = active, green = done, red = skipped
          let bgColor = 'bg-gray-200 text-gray-500'; // Default not started
          if (isActive) {
             bgColor = 'bg-info text-white ring-2 ring-info ring-offset-2';
          } else if (status) {
             const allNotAssessed = Object.values(status.skills || {}).every(s => s === "not_assessed");
             const someScored = Object.keys(status.skills || {}).length > 0;
             if (allNotAssessed && someScored) {
                bgColor = 'bg-danger text-white opacity-70'; // skipped
             } else if (someScored) {
                bgColor = 'bg-success text-white'; // done
             }
          }

          return (
            <div 
              key={domain.id} 
              className={`flex items-center justify-center w-10 h-10 rounded-full font-bold text-sm shrink-0 transition-all ${bgColor}`}
              title={domain.name}
            >
              {domain.id}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DomainProgressBar;
