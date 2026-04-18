import React from 'react';

const ScoreButton = ({ type, text, active, onClick }) => {
  const getStyles = () => {
    switch(type) {
      case 'yes':
        return active 
          ? 'bg-primary text-on-primary border-primary shadow-md transform scale-105'
          : 'bg-primary/10 text-primary border-primary/15 hover:bg-primary hover:text-on-primary transition-all hover:scale-[1.02] active:scale-95';
      case 'sometimes':
        return active
          ? 'bg-secondary text-on-secondary border-secondary shadow-md transform scale-105'
          : 'bg-secondary/10 text-secondary border-secondary/15 hover:bg-secondary hover:text-on-secondary transition-all hover:scale-[1.02] active:scale-95';
      case 'no':
        return active
          ? 'bg-error text-on-error border-error shadow-md transform scale-105'
          : 'bg-error/10 text-error border-error/15 hover:bg-error hover:text-on-error transition-all hover:scale-[1.02] active:scale-95';
      default:
        return '';
    }
  };

  return (
    <button
      onClick={onClick}
      className={`min-h-[60px] w-full border-2 font-bold font-headline rounded-2xl text-xl px-6 py-4 flex items-center justify-center transition-all duration-300 ${getStyles()}`}
      aria-label={`Score ${text}`}
      type="button"
    >
      {text}
    </button>
  );
};

export default ScoreButton;
