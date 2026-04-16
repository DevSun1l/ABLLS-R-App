import React from 'react';

const ScoreButton = ({ type, text, active, onClick }) => {
  const getStyles = () => {
    switch(type) {
      case 'yes':
        return active 
          ? 'bg-success text-white border-success ring-2 ring-success ring-offset-2 scale-105 shadow-md'
          : 'bg-[#EAF3DE] text-[#27500A] border-[#97C459] hover:bg-success hover:text-white transition-all hover:scale-[1.02] active:scale-95';
      case 'sometimes':
        return active
          ? 'bg-warning text-white border-warning ring-2 ring-warning ring-offset-2 scale-105 shadow-md'
          : 'bg-[#FAEEDA] text-[#633806] border-warning hover:bg-warning hover:text-white transition-all hover:scale-[1.02] active:scale-95';
      case 'no':
        return active
          ? 'bg-danger text-white border-danger ring-2 ring-danger ring-offset-2 scale-105 shadow-md'
          : 'bg-[#FCEBEB] text-[#791F1F] border-[#F09595] hover:bg-danger hover:text-white transition-all hover:scale-[1.02] active:scale-95';
      default:
        return '';
    }
  };

  return (
    <button
      onClick={onClick}
      className={`min-h-[56px] w-full border-2 font-semibold rounded-xl text-lg px-6 py-4 flex items-center justify-center transition-all ${getStyles()}`}
      aria-label={`Score ${text}`}
      type="button"
    >
      {text}
    </button>
  );
};

export default ScoreButton;
