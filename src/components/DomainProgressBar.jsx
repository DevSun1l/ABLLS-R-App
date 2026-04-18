import React, { useRef, useEffect } from 'react';
import { ABLLS_DOMAINS } from '../data/ablls';

const DomainProgressBar = ({ currentDomainId, studentDomains, onSelectDomain }) => {
  const containerRef = useRef(null);

  useEffect(() => {
    if (containerRef.current) {
        const activeEl = containerRef.current.querySelector('.domain-active');
        if (activeEl) {
           activeEl.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
        }
    }
  }, [currentDomainId]);

  return (
    <div ref={containerRef} className="w-full overflow-x-auto pb-4 hide-scrollbar">
      <div className="flex space-x-3 min-w-max px-2 items-center">
        {ABLLS_DOMAINS.map((domain, index) => {
          const isActive = currentDomainId === domain.id;
          const status = studentDomains?.[domain.id];

          let bgColor = 'bg-surface-container-low text-on-surface-variant shadow-sm border border-outline-variant/10';
          if (isActive) {
             bgColor = 'domain-active bg-primary text-on-primary ring-4 ring-primary-container shadow-md scale-110 z-10';
          } else if (status) {
             const allNotAssessed = Object.values(status.skills || {}).every(s => s === "not_assessed");
             const someScored = Object.keys(status.skills || {}).length > 0;
             if (allNotAssessed && someScored) {
                bgColor = 'bg-error text-on-error shadow-sm'; // skipped
             } else if (someScored) {
                bgColor = 'bg-secondary text-on-secondary shadow-sm'; // done
             }
          }

          return (
            <button 
              key={domain.id} 
              onClick={() => onSelectDomain(index)}
              className={`flex items-center justify-center w-11 h-11 rounded-full font-extrabold text-sm shrink-0 transition-all duration-300 cursor-pointer hover:scale-105 hover:-translate-y-1 ${bgColor}`}
              title={domain.name}
            >
              {domain.id}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default DomainProgressBar;
