import React, { useState } from 'react';

const MOODS = [
  { icon: '😊', label: 'Happy', value: 'happy' },
  { icon: '😐', label: 'Neutral', value: 'neutral' },
  { icon: '😟', label: 'Sad', value: 'sad' }
];

const SurveyForm = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    name: '',
    assessorType: 'BCBA',
    rating: 0,
    oneWord: '',
    mood: '',
    comments: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-card border border-border rounded-xl p-6 shadow-sm max-w-2xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold text-textPrimary">Your Feedback Matters</h2>
      
      <div>
        <label className="block text-sm font-semibold text-textSecondary mb-2">Your Name</label>
        <input 
          type="text" required
          value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
          className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-primary focus:border-primary outline-none"
        />
      </div>
      
      <div>
        <label className="block text-sm font-semibold text-textSecondary mb-2">Assessor Type</label>
        <select 
          value={formData.assessorType} onChange={e => setFormData({...formData, assessorType: e.target.value})}
          className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-primary focus:border-primary outline-none"
        >
          <option>BCBA</option>
          <option>Speech Therapist</option>
          <option>OT</option>
          <option>SENCo</option>
          <option>Other</option>
        </select>
      </div>
      
      <div>
        <label className="block text-sm font-semibold text-textSecondary mb-2">Overall Rating (1-5)</label>
        <div className="flex gap-2">
           {[1,2,3,4,5].map(star => (
             <button type="button" key={star} onClick={() => setFormData({...formData, rating: star})}
               className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg transition-all ${
                 formData.rating >= star ? 'bg-warning text-white' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
               }`}
             >★</button>
           ))}
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-semibold text-textSecondary mb-2">One-word Feedback</label>
        <input 
          type="text" required maxLength={20}
          value={formData.oneWord} onChange={e => setFormData({...formData, oneWord: e.target.value})}
          className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-primary focus:border-primary outline-none"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-textSecondary mb-2">Mood Today</label>
        <div className="flex gap-3">
          {MOODS.map(m => (
            <button
              key={m.value} type="button"
              onClick={() => setFormData({...formData, mood: m.value})}
              className={`text-3xl p-3 border-2 rounded-xl transition-all hover:scale-105 active:scale-95 ${
                formData.mood === m.value ? 'bg-primary/10 border-primary' : 'bg-transparent border-gray-200 hover:border-gray-300'
              }`}
            >
              <span role="img" aria-label={m.label}>{m.icon}</span>
            </button>
          ))}
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-semibold text-textSecondary mb-2">Additional Comments</label>
        <textarea 
          rows={4}
          value={formData.comments} onChange={e => setFormData({...formData, comments: e.target.value})}
          className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary focus:border-primary outline-none"
        ></textarea>
      </div>
      
      <button type="submit" className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-3.5 px-6 rounded-lg transition-colors">
        Submit Feedback
      </button>
    </form>
  );
};

export default SurveyForm;
