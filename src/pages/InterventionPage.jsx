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

const GOAL_ENDPOINTS = ['/api/generate', '/.netlify/functions/generate'];
const GEMINI_MODELS = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash'];

const buildFallbackGoals = (student, selectedGoals) =>
  selectedGoals.map((goal) => ({
    smartGoal: `Within 12 weeks, ${student.name} will improve ${goal.title.toLowerCase()} to at least 80% success across 3 consecutive sessions, measured by therapist data collection.`,
    strategy: 'ABA Therapy',
    activity: `Structured practice routine for ${goal.title}.`,
    serviceType: 'Individual',
    benefitStatement: (goal.benefitTemplate || 'This goal supports [child\'s name] in [skill area].')
      .replace("[child's name]", student.name || 'the student')
      .replace('[skill area]', goal.domain || 'core skills')
      .replace('[target ability]', goal.title || 'target ability')
      .replace('[ABLLS-R domain]', goal.domain || 'ABLLS-R domain')
      .replace('[diagnosis]', (student.diagnoses && student.diagnoses[0]) || 'developmental needs'),
  }));

const getStudentFromSessionStorage = (studentId) => {
  try {
    const raw = sessionStorage.getItem('ablls_students');
    if (!raw) return null;
    const list = JSON.parse(raw);
    if (!Array.isArray(list)) return null;
    return list.find((entry) => entry.id === studentId) || null;
  } catch {
    return null;
  }
};

const generateGoalsWithGeminiClient = async ({ student, selectedGoals, weakDomains }) => {
  const geminiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!geminiKey) return null;

  const systemPrompt = `You are an expert special education intervention planner.
Return ONLY a valid JSON array of 5 objects.
Each object: { "smartGoal": "", "strategy": "", "activity": "", "serviceType": "", "benefitStatement": "" }`;

  const userPrompt = `Child: ${student.name}, Age: ${student.ageYears || 0} years ${student.ageMonths || 0} months, Diagnoses: ${(student.diagnoses || []).join(', ')}
Weak ABLLS-R Domains: ${JSON.stringify(weakDomains)}
Goal Templates:
${selectedGoals.map((g, i) => `${i + 1}. ${g.title}\nBenefit Template: ${g.benefitTemplate}`).join('\n\n')}`;

  let lastError = null;
  for (const model of GEMINI_MODELS) {
    for (let attempt = 1; attempt <= 3; attempt++) {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
          systemInstruction: { parts: [{ text: systemPrompt }] },
          generationConfig: { responseMimeType: 'application/json' },
        }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        lastError = new Error(err?.error?.message || `Gemini client call failed: HTTP ${response.status}`);
        if (response.status === 503 && attempt < 3) {
          continue;
        }
        break;
      }

      const data = await response.json();
      const textContent = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
      if (!textContent) {
        lastError = new Error(`Gemini response empty for model ${model}.`);
        continue;
      }

      try {
        return JSON.parse(textContent);
      } catch {
        const match = textContent.match(/\[[\s\S]*\]/);
        if (match) return JSON.parse(match[0]);
        lastError = new Error(`Gemini returned non-JSON response for model ${model}.`);
      }
    }
  }

  throw lastError || new Error('Gemini generation unavailable.');
};

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


      let generatedSmartGoals = null;
      let lastError = null;

      for (const endpoint of GOAL_ENDPOINTS) {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            student: { ...targetStudent, weakDomains },
            selectedGoals,
          }),
        });

        if (response.ok) {
          generatedSmartGoals = await response.json();
          break;
        }

        const errData = await response.json().catch(() => ({}));
        lastError = errData.error || `HTTP ${response.status}`;
      }

      if (!Array.isArray(generatedSmartGoals) || generatedSmartGoals.length === 0) {
        try {
          const geminiGoals = await generateGoalsWithGeminiClient({
            student: targetStudent,
            selectedGoals,
            weakDomains,
          });
          if (Array.isArray(geminiGoals) && geminiGoals.length > 0) {
            generatedSmartGoals = geminiGoals;
          }
        } catch (geminiClientError) {
        }
      }

      if (!Array.isArray(generatedSmartGoals) || generatedSmartGoals.length === 0) {
        generatedSmartGoals = buildFallbackGoals(targetStudent, selectedGoals);
      }

      setGoals(generatedSmartGoals);

      // Save to Supabase
      const smartGoalsPayload = JSON.stringify(generatedSmartGoals);
      const { data: existingAssessment, error: fetchAssessmentError } = await supabase
        .from('assessments')
        .select('id')
        .eq('student_id', id)
        .maybeSingle();

      if (fetchAssessmentError) throw fetchAssessmentError;

      let saveError = null;
      if (existingAssessment?.id) {
        const { error } = await supabase
          .from('assessments')
          .update({ smart_goals: smartGoalsPayload })
          .eq('id', existingAssessment.id);
        saveError = error;
      } else {
        const { error } = await supabase
          .from('assessments')
          .insert({
            id: `asm_${crypto.randomUUID().split('-')[0]}`,
            student_id: id,
            assessor_id: user?.role === 'admin' ? 'usr_admin' : 'usr_specialist',
            date: new Date().toISOString().split('T')[0],
            domain_data: {},
            smart_goals: smartGoalsPayload,
          });
        saveError = error;
      }
      
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
          supabase.from('students').select('*').eq('id', id).maybeSingle(),
          supabase.from('assessments').select('*').eq('student_id', id).maybeSingle()
        ]);

        let foundStudent = studentRes.data || getStudentFromSessionStorage(id);
        if (!foundStudent) {
          setError('Unable to load student profile for intervention generation.');
          setLoading(false);
          return;
        }
        
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
            Generate goals
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
