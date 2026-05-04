import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { getMatchingGoals } from '../utils/goalMatcher';
import { ABLLS_DOMAINS } from '../data/ablls';
import { getTopWeaknesses } from '../utils/scoring';
import SmartGoalCard from '../components/SmartGoalCard';
import { Layers, Download } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { exportInterventionPlanPdf } from '../utils/pdfExport';
import { supabase } from '../lib/supabase';

const DEBUG_ENDPOINT = 'http://127.0.0.1:7745/ingest/2093a418-4f5e-4810-841e-d97f9aa410f6';

const InterventionPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [student, setStudent] = useState(null);
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const generateGoals = useCallback(async (targetStudent) => {
    setLoading(true);
    setError(null);
    try {
      const selectedGoals = getMatchingGoals(targetStudent);
      const weakDomains = getTopWeaknesses(targetStudent, ABLLS_DOMAINS, 5);

      // #region agent log
      fetch(DEBUG_ENDPOINT,{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'016185'},body:JSON.stringify({sessionId:'016185',runId:'pre-fix',hypothesisId:'H5',location:'src/pages/InterventionPage.jsx:31',message:'goal generation request prepared',data:{studentId:id,selectedGoalsCount:selectedGoals.length,weakDomainsCount:weakDomains.length},timestamp:Date.now()})}).catch(()=>{});
      // #endregion

      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student: { ...targetStudent, weakDomains },
          selectedGoals
        })
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        // #region agent log
        fetch(DEBUG_ENDPOINT,{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'016185'},body:JSON.stringify({sessionId:'016185',runId:'pre-fix',hypothesisId:'H5',location:'src/pages/InterventionPage.jsx:45',message:'goal generation request failed',data:{status:response.status,error:errData.error||'unknown'},timestamp:Date.now()})}).catch(()=>{});
        // #endregion
        throw new Error(errData.error || 'Goal generation failed.');
      }

      const generatedSmartGoals = await response.json();
      // #region agent log
      fetch(DEBUG_ENDPOINT,{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'016185'},body:JSON.stringify({sessionId:'016185',runId:'pre-fix',hypothesisId:'H5',location:'src/pages/InterventionPage.jsx:50',message:'goal generation request succeeded',data:{goalsReturned:Array.isArray(generatedSmartGoals)?generatedSmartGoals.length:0},timestamp:Date.now()})}).catch(()=>{});
      // #endregion
      setGoals(generatedSmartGoals);

      // Save to Supabase
      const { error: saveError } = await supabase
        .from('assessments')
        .update({
          smart_goals: generatedSmartGoals,
          updated_at: new Date().toISOString()
        })
        .eq('student_id', id);
      
      if (saveError) console.error("Failed to save goals:", saveError);

    } catch (err) {
      console.error(err);
      setError(err.message || "Goal generation failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [studentRes, assessmentRes] = await Promise.all([
          supabase.from('students').select('*').eq('id', id).single(),
          supabase.from('assessments').select('*').eq('student_id', id).single()
        ]);

        let foundStudent = studentRes.data || { id, name: 'Current Student' };
        
        if (assessmentRes.data) {
          foundStudent.domains = assessmentRes.data.domain_data || {};
          if (assessmentRes.data.smart_goals) {
            const parsed = assessmentRes.data.smart_goals;
            setGoals(typeof parsed === 'string' ? JSON.parse(parsed) : parsed);
            setStudent(foundStudent);
            setLoading(false);
            return;
          }
        } else {
          foundStudent.domains = {};
        }

        setStudent(foundStudent);
        generateGoals(foundStudent);
      } catch (e) {
        console.error(e);
        setError('Failed to load the intervention plan.');
        setLoading(false);
      }
    };

    fetchData();
  }, [id, generateGoals]);

  const handleRegenerate = () => {
    if (student) generateGoals(student);
  };

  const handleExportPDF = () => {
     const authorName = [user?.first_name, user?.last_name].filter(Boolean).join(' ') || 'Therapist / Teacher';
     exportInterventionPlanPdf(student, goals, authorName);
  };

  if (!student) return <div className="p-8 text-center text-textSecondary text-lg font-medium">Loading student...</div>;

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="w-16 h-16 border-4 border-info border-t-transparent rounded-full animate-spin mb-6"></div>
        <h2 className="text-2xl font-bold text-textPrimary tracking-tight mb-2">Generating personalised goals for {student.name}...</h2>
        <p className="text-textSecondary">Our AI specialist is analysing weaknesses and formulating SMART interventions.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-xl mx-auto flex flex-col items-center justify-center min-h-[50vh] text-center bg-card border border-danger/20 rounded-2xl p-8 shadow-sm">
        <div className="bg-danger/10 text-danger w-16 h-16 rounded-full flex items-center justify-center mb-4 text-2xl">!</div>
        <p className="text-danger font-medium mb-6">{error}</p>
        <button onClick={handleRegenerate} className="px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors">
          Retry Generation
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-textPrimary tracking-tight flex items-center gap-2">
            <Layers className="text-primary h-8 w-8" />
            Intervention Plan
          </h1>
          <p className="text-textSecondary mt-1 text-lg">Personalised SMART Goals for {student.name}</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleRegenerate}
            className="bg-white border border-gray-300 text-textPrimary font-semibold py-2.5 px-5 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Regenerate goals
          </button>
          <button
            onClick={handleExportPDF}
            className="bg-primary hover:bg-primary/90 text-white font-bold py-2.5 px-6 rounded-lg shadow-md hover:shadow-lg transition-all flex items-center gap-2"
          >
            <Download className="w-5 h-5" /> Export PDF
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 bg-white p-4 sm:p-0">
         <div className="rounded-[2rem] border border-primary/10 bg-gradient-to-br from-primary/10 via-white to-tertiary/10 p-6 sm:p-8">
            <h2 className="text-2xl font-black text-textPrimary tracking-tight">Intervention Plan Summary</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl bg-white/90 p-4 border border-primary/10">
                <p className="text-[10px] font-black uppercase tracking-[0.25em] text-primary">Heading</p>
                <p className="mt-2 text-sm font-bold text-textPrimary">Cognify Care Intervention Plan</p>
              </div>
              <div className="rounded-2xl bg-white/90 p-4 border border-secondary/10">
                <p className="text-[10px] font-black uppercase tracking-[0.25em] text-secondary">Therapist / Teacher</p>
                <p className="mt-2 text-sm font-bold text-textPrimary">{[user?.first_name, user?.last_name].filter(Boolean).join(' ') || 'Not provided'}</p>
              </div>
              <div className="rounded-2xl bg-white/90 p-4 border border-tertiary/10">
                <p className="text-[10px] font-black uppercase tracking-[0.25em] text-tertiary">Student</p>
                <p className="mt-2 text-sm font-bold text-textPrimary">{student.name}</p>
              </div>
            </div>
         </div>
         {goals.map((goal, index) => (
           <SmartGoalCard key={index} index={index + 1} goal={goal} />
         ))}
      </div>
    </div>
  );
};

export default InterventionPage;
