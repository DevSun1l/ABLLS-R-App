import React, { useState } from 'react';

const FeedbackModal = ({ onClose }) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [wordRating, setWordRating] = useState('');
  const [mood, setMood] = useState('neutral');
  const [description, setDescription] = useState('');
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);

  const wordOptions = ['Excellent', 'Intuitive', 'Buggy', 'Confusing', 'Slow', 'Average'];
  const moods = [
    { id: 'happy', emoji: '😊', label: 'Positive' },
    { id: 'neutral', emoji: '😐', label: 'Neutral' },
    { id: 'sad', emoji: '😞', label: 'Frustrated' }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!rating) return;
    setProcessing(true);
    try {
      const token = sessionStorage.getItem('ablls_token');
      const res = await fetch('/api/feedback/submit', {
        method: 'POST',
        headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ rating, word_rating: wordRating, mood, description })
      });
      if (res.ok) {
        setSuccess(true);
        setTimeout(onClose, 2000);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setProcessing(false);
    }
  };

  if (success) {
      return (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
             <div className="bg-surface-container-lowest w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 p-12 text-center flex flex-col items-center">
                 <div className="w-20 h-20 bg-success/20 text-success rounded-full flex items-center justify-center mb-6 border animate-bounce-subtle">
                     <span className="material-symbols-outlined text-4xl">check_circle</span>
                 </div>
                 <h2 className="text-2xl font-black font-headline text-on-surface mb-2">Feedback Captured</h2>
                 <p className="text-sm font-medium text-on-surface-variant">Thank you for your insights.</p>
             </div>
          </div>
      );
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-surface-container-lowest w-full max-w-lg rounded-3xl shadow-2xl border border-outline-variant/20 overflow-hidden animate-in slide-in-from-bottom-8 duration-300">
        <div className="p-8 pb-0 flex justify-between items-start border-b border-outline-variant/10">
          <div>
            <h3 className="text-2xl font-black font-headline text-on-surface tracking-tight">System Feedback</h3>
            <p className="text-on-surface-variant text-sm font-medium opacity-70">Help us refine clinical workflows.</p>
          </div>
          <button onClick={onClose} className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-surface-container-high transition-colors text-on-surface-variant">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          
          {/* Star Rating */}
          <div className="space-y-3 flex flex-col items-center text-center">
             <label className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">System Efficacy</label>
             <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map(star => (
                   <button
                     key={star}
                     type="button"
                     onMouseEnter={() => setHoverRating(star)}
                     onMouseLeave={() => setHoverRating(0)}
                     onClick={() => setRating(star)}
                     className={`material-symbols-outlined text-4xl transition-colors ${
                         (hoverRating || rating) >= star ? 'text-[#ffc107]' : 'text-outline-variant/20'
                     } hover:scale-110`}
                     style={{ fontVariationSettings: `'FILL' ${(hoverRating || rating) >= star ? 1 : 0}` }}
                   >
                       star
                   </button>
                ))}
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             {/* Word Selection */}
             <div className="space-y-3">
                 <label className="text-[10px] font-black uppercase tracking-[0.2em] text-primary ml-4">One Word Summary</label>
                 <div className="flex flex-wrap gap-2">
                     {wordOptions.map(word => (
                         <button
                           key={word}
                           type="button"
                           onClick={() => setWordRating(word)}
                           className={`px-4 py-2 rounded-full text-xs font-bold transition-all border ${
                               wordRating === word ? 'bg-primary text-on-primary border-primary' : 'bg-surface-container-low text-on-surface-variant border-transparent'
                           }`}
                         >
                             {word}
                         </button>
                     ))}
                 </div>
             </div>

             {/* Mood Emojis */}
             <div className="space-y-3">
                 <label className="text-[10px] font-black uppercase tracking-[0.2em] text-primary ml-4">Current Mood</label>
                 <div className="flex gap-3 justify-center">
                     {moods.map(m => (
                         <button
                           key={m.id}
                           type="button"
                           onClick={() => setMood(m.id)}
                           className={`flex flex-col items-center gap-1 p-3 rounded-2xl transition-all border ${
                               mood === m.id ? 'bg-primary/10 border-primary shadow-sm' : 'bg-surface-container-low border-transparent grayscale opacity-50 hover:grayscale-0 hover:opacity-100'
                           }`}
                         >
                             <span className="text-3xl leading-none">{m.emoji}</span>
                             <span className="text-[9px] font-black uppercase">{m.label}</span>
                         </button>
                     ))}
                 </div>
             </div>
          </div>

          <div className="space-y-2">
             <label className="text-[10px] font-black uppercase tracking-widest text-primary ml-4">Detailed Description</label>
             <textarea 
                className="w-full bg-surface-container-high border-none rounded-2xl p-6 text-sm font-medium focus:ring-2 focus:ring-primary transition-all resize-none h-24"
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="What functioned well? What impaired your workflow?"
             />
          </div>

          <button 
             type="submit"
             disabled={processing || rating === 0}
             className="w-full bg-primary text-on-primary h-14 rounded-full font-black text-xs uppercase tracking-[0.2em] shadow-lg shadow-primary/20 hover:bg-primary-dim transition-all active:scale-95 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
             {processing ? <div className="w-5 h-5 border-2 border-on-primary border-t-transparent animate-spin rounded-full" /> : 'Log Feedback Protocol'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default FeedbackModal;
