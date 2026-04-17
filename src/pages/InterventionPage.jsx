import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getMatchingGoals } from '../utils/goalMatcher';
import { ABLLS_DOMAINS } from '../data/ablls';
import { getTopWeaknesses } from '../utils/scoring';
import SmartGoalCard from '../components/SmartGoalCard';
import { Layers, Download } from 'lucide-react';
import html2pdf from 'html2pdf.js';

const InterventionPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const reportRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const rawData = sessionStorage.getItem('ablls_students');
        let foundStudent = rawData ? JSON.parse(rawData).find(s => s.id === id) : null;
        if (!foundStudent) foundStudent = { id, name: "Current Student" };
        
        const token = sessionStorage.getItem('ablls_token');
        if (token) {
           const res = await fetch(`/api/assessments/load?studentId=${id}`, {
              headers: { 'Authorization': `Bearer ${token}` }
           });
           const result = await res.json();
           
           if (result.assessment) {
              foundStudent.domains = result.assessment.domain_data || {};
              if (result.assessment.smart_goals) {
                 const parsed = result.assessment.smart_goals;
                 setGoals(typeof parsed === 'string' ? JSON.parse(parsed) : parsed);
                 setStudent(foundStudent);
                 setLoading(false);
                 return;
              }
           } else {
              foundStudent.domains = {};
           }
        }
        setStudent(foundStudent);
        generateGoals(foundStudent);
      } catch(e) {
         console.error(e);
      }
    };
    fetchData();
  }, [id]);

  const generateGoals = async (targetStudent) => {
    setLoading(true);
    setError(null);
    try {
      const selectedGoals = getMatchingGoals(targetStudent);
      const weakDomains = getTopWeaknesses(targetStudent, ABLLS_DOMAINS, 5);

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
        throw new Error(errData.error || 'Goal generation failed.');
      }

      const generatedSmartGoals = await response.json();
      setGoals(generatedSmartGoals);

      const token = sessionStorage.getItem('ablls_token');
      if (token) {
         fetch(`/api/assessments/save-goals`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ studentId: id, smartGoals: generatedSmartGoals })
         });
      }

    } catch (err) {
      console.error(err);
      setError(err.message || "Goal generation failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerate = () => {
    if (student) generateGoals(student);
  };

  const handleExportPDF = () => {
     const element = reportRef.current;
     const opt = {
       margin: 1,
       filename: `${student?.name}_intervention_plan.pdf`,
       image: { type: 'jpeg', quality: 0.98 },
       html2canvas: { scale: 2 },
       jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
     };
     html2pdf().set(opt).from(element).save();
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

      <div ref={reportRef} className="grid grid-cols-1 gap-6 bg-white p-4 sm:p-0">
         <div className="print-header hidden mb-6 border-b pb-4">
            <h1 className="text-2xl font-bold">ABLLS-R Intervention Plan</h1>
            <p className="text-gray-500">Student: {student.name}</p>
            <p className="text-gray-500">Generated: {new Date().toLocaleDateString()}</p>
         </div>
         {goals.map((goal, index) => (
           <SmartGoalCard key={index} index={index + 1} goal={goal} />
         ))}
      </div>
    </div>
  );
};

export default InterventionPage;
