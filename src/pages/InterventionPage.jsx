import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getMatchingGoals } from '../utils/goalMatcher';
import { ABLLS_DOMAINS } from '../data/ablls';
import { getTopWeaknesses } from '../utils/scoring';
import SmartGoalCard from '../components/SmartGoalCard';
import { Layers } from 'lucide-react';

const InterventionPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const rawData = sessionStorage.getItem('ablls_students');
    if (rawData) {
      const students = JSON.parse(rawData);
      const target = students.find(s => s.id === id);
      if (target) {
        setStudent(target);
        if (target.smartGoals && target.smartGoals.length > 0) {
          setGoals(target.smartGoals);
          setLoading(false);
        } else {
          generateGoals(target, students);
        }
      }
    }
  }, [id]);

  const generateGoals = async (targetStudent, allStudents) => {
    setLoading(true);
    setError(null);
    try {
      // Get base templates
      const selectedGoals = getMatchingGoals(targetStudent);
      const weakDomains = getTopWeaknesses(targetStudent, ABLLS_DOMAINS, 5);

      // Call API
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

      // Save back to student
      targetStudent.smartGoals = generatedSmartGoals;
      const index = allStudents.findIndex(s => s.id === id);
      if (index !== -1) {
        allStudents[index] = targetStudent;
        sessionStorage.setItem('ablls_students', JSON.stringify(allStudents));
      }

    } catch (err) {
      console.error(err);
      setError(err.message || "Goal generation failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerate = () => {
    const rawData = sessionStorage.getItem('ablls_students');
    if (rawData) {
      generateGoals(student, JSON.parse(rawData));
    }
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
            onClick={() => navigate(`/report/${id}`)}
            className="bg-primary hover:bg-primary/90 text-white font-bold py-2.5 px-6 rounded-lg shadow-md hover:shadow-lg transition-all"
          >
            View full report &rarr;
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {goals.map((goal, index) => (
          <SmartGoalCard key={index} index={index + 1} goal={goal} />
        ))}
      </div>
    </div>
  );
};

export default InterventionPage;
