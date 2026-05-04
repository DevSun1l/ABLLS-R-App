import React, { useState } from 'react';
import SurveyForm from '../components/SurveyForm';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';

const SurveyPage = () => {
  const [submitted, setSubmitted] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleSurveySubmit = async (data) => {
    try {
      const { error } = await supabase
        .from('feedback')
        .insert({
          ...data,
          user_id: user.id,
          created_at: new Date().toISOString()
        });

      if (!error) {
        setSubmitted(true);
      } else {
        throw error;
      }
    } catch (e) {
      console.error(e);
      alert('Error submitting feedback: ' + e.message);
    }
  };

  return (
    <div className="py-8 px-4">
      {submitted ? (
        <div className="max-w-xl mx-auto bg-card border border-border rounded-xl p-12 text-center shadow-lg transform transition-all scale-100">
           <div className="w-20 h-20 bg-success/10 text-success rounded-full flex items-center justify-center text-4xl mx-auto mb-6">
              ✓
           </div>
           <h2 className="text-3xl font-bold text-textPrimary mb-3 tracking-tight">Thank you for your feedback!</h2>
           <p className="text-textSecondary mb-8 text-lg">Your input helps us improve the ABLLS-R portal for all specialists.</p>
           <button 
             onClick={() => navigate(user?.role === 'admin' ? '/admin' : '/dashboard')}
             className="bg-primary text-white font-bold px-8 py-3.5 rounded-lg hover:bg-primary/90 transition-all shadow-md active:scale-95"
           >
             Return to Dashboard
           </button>
        </div>
      ) : (
        <SurveyForm onSubmit={handleSurveySubmit} />
      )}
    </div>
  );
};

export default SurveyPage;
