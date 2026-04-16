import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ABLLS_DOMAINS } from '../data/ablls';
import DomainProgressBar from '../components/DomainProgressBar';
import ScoreButton from '../components/ScoreButton';

const AssessmentPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [domainIndex, setDomainIndex] = useState(0);
  const [showGatewayModal, setShowGatewayModal] = useState(false);
  
  useEffect(() => {
    const rawData = sessionStorage.getItem('ablls_students');
    if (rawData) {
      const students = JSON.parse(rawData);
      const target = students.find(s => s.id === id);
      if (target) {
        if (!target.domains) target.domains = {};
        setStudent(target);
      }
    }
  }, [id]);

  if (!student) return <div className="p-8 text-center">Loading student data...</div>;

  const currentDomain = ABLLS_DOMAINS[domainIndex];
  const currentSkills = currentDomain.skills;
  const currentDomainData = student.domains[currentDomain.id] || { skills: {} };

  const saveToSession = (updatedStudent) => {
    const rawData = sessionStorage.getItem('ablls_students');
    let students = rawData ? JSON.parse(rawData) : [];
    const index = students.findIndex(s => s.id === id);
    if (index !== -1) {
      students[index] = updatedStudent;
      sessionStorage.setItem('ablls_students', JSON.stringify(students));
    }
    setStudent(updatedStudent);
  };

  const handleScore = (skillCode, value, isGateway) => {
    const newDomains = { ...student.domains };
    if (!newDomains[currentDomain.id]) {
       newDomains[currentDomain.id] = { skills: {} };
    }
    const newSkills = { ...newDomains[currentDomain.id].skills };
    
    if (isGateway && value === 'no') {
      setShowGatewayModal(true);
      // Temporarily write the "no" so the user sees their click, 
      // the actual skip happens if they click Continue
      newSkills[skillCode] = value;
      newDomains[currentDomain.id].skills = newSkills;
      saveToSession({ ...student, domains: newDomains, lastAssessed: new Date().toISOString().split('T')[0] });
      return;
    }

    newSkills[skillCode] = value;
    newDomains[currentDomain.id].skills = newSkills;
    saveToSession({ ...student, domains: newDomains, lastAssessed: new Date().toISOString().split('T')[0] });
  };

  const handleGatewaySkip = () => {
    setShowGatewayModal(false);
    const newDomains = { ...student.domains };
    const newSkills = { ...newDomains[currentDomain.id].skills };
    // Skip all remaining
    currentSkills.forEach((skill, idx) => {
       if (idx > 0) newSkills[skill.code] = 'not_assessed';
    });
    newDomains[currentDomain.id].skills = newSkills;
    saveToSession({ ...student, domains: newDomains });
    handleNextDomain();
  };

  const handleGatewayCancel = () => {
    setShowGatewayModal(false);
    // User cancelled skipping, we clear the 'no' selection so they can choose again
    const newDomains = { ...student.domains };
    const newSkills = { ...newDomains[currentDomain.id].skills };
    delete newSkills[currentSkills[0].code];
    newDomains[currentDomain.id].skills = newSkills;
    saveToSession({ ...student, domains: newDomains });
  };

  const handleNextDomain = () => {
    if (domainIndex < ABLLS_DOMAINS.length - 1) {
      setDomainIndex(domainIndex + 1);
      window.scrollTo(0, 0);
    } else {
      navigate(`/progress/${id}`);
    }
  };

  const handlePrevDomain = () => {
    if (domainIndex > 0) {
      setDomainIndex(domainIndex - 1);
      window.scrollTo(0, 0);
    }
  };

  return (
    <div className="max-w-4xl mx-auto relative pb-24">
      <div className="mb-6 sticky top-0 bg-background pt-4 pb-2 z-10 border-b border-gray-200">
        <DomainProgressBar currentDomainId={currentDomain.id} studentDomains={student.domains} />
      </div>
      
      <div className="mb-8 p-6 bg-info/10 border-l-4 border-info rounded-r-xl">
        <h2 className="text-2xl font-bold text-textPrimary tracking-tight">Domain {currentDomain.id} — {currentDomain.name}</h2>
        <p className="text-textSecondary uppercase text-sm font-semibold tracking-wide mt-1">{currentDomain.category}</p>
      </div>

      <div className="space-y-6">
        {currentSkills.map(skill => (
          <div key={skill.code} className="bg-card border border-border rounded-xl p-6 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5 border-b border-gray-100 pb-4">
              <div className="flex items-start gap-4">
                 <div className="bg-gray-100 text-gray-800 font-bold px-3 py-1.5 rounded-lg border border-gray-200 shrink-0 mt-0.5">
                   {skill.code}
                 </div>
                 <div>
                   <p className="text-xl font-medium text-textPrimary leading-snug">{skill.description}</p>
                   {skill.isGateway && (
                     <span className="inline-block mt-2 text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded">Gateway Skill</span>
                   )}
                 </div>
              </div>
              <span className="capitalize text-xs font-bold bg-blue-50 text-blue-700 px-3 py-1 rounded-full border border-blue-100 self-start shrink-0">
                {skill.level}
              </span>
            </div>
            
            {(currentDomainData.skills[currentSkills[0].code] === 'no' && skill.isGateway === false) ? (
              <div className="text-center py-4 bg-gray-50 rounded-lg text-gray-500 font-medium">
                Not Assessed (Gateway Not Met)
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-3 md:gap-4 lg:gap-6">
                <ScoreButton 
                  type="yes" text="YES" 
                  active={currentDomainData.skills[skill.code] === 'yes'} 
                  onClick={() => handleScore(skill.code, 'yes', skill.isGateway)}
                />
                <ScoreButton 
                  type="sometimes" text="SOMETIMES" 
                  active={currentDomainData.skills[skill.code] === 'sometimes'} 
                  onClick={() => handleScore(skill.code, 'sometimes', skill.isGateway)}
                />
                <ScoreButton 
                  type="no" text="NO" 
                  active={currentDomainData.skills[skill.code] === 'no'} 
                  onClick={() => handleScore(skill.code, 'no', skill.isGateway)}
                />
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] p-4 z-20">
        <div className="max-w-4xl mx-auto flex justify-between">
          <button 
            onClick={handlePrevDomain}
            disabled={domainIndex === 0}
            className={`px-6 py-3 font-semibold rounded-lg ${domainIndex === 0 ? 'opacity-50 cursor-not-allowed bg-gray-100 text-gray-400' : 'bg-gray-100 hover:bg-gray-200 text-textPrimary'}`}
          >
            &larr; Previous Domain
          </button>
          <button 
            onClick={handleNextDomain}
            className="px-6 py-3 font-semibold text-white bg-primary rounded-lg hover:bg-primary/90 shadow-md hover:shadow-lg transition-all flex items-center gap-2"
          >
            {domainIndex < ABLLS_DOMAINS.length - 1 ? 'Next Domain \u2192' : 'View Progress \u2192'}
          </button>
        </div>
      </div>

      {showGatewayModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full p-6 align-middle">
            <h3 className="text-xl font-bold text-danger mb-2">Gateway Not Met</h3>
            <p className="text-textSecondary mb-6">Remaining skills in this domain will be marked as Not Assessed. Continue to next domain?</p>
            <div className="flex justify-end gap-3 flex-col sm:flex-row">
              <button 
                onClick={handleGatewayCancel}
                className="px-4 py-2 text-textSecondary bg-gray-100 hover:bg-gray-200 rounded-lg font-medium w-full sm:w-auto mt-2 sm:mt-0 order-2 sm:order-1"
              >
                Cancel
              </button>
              <button 
                onClick={handleGatewaySkip}
                className="px-4 py-2 text-white bg-primary hover:bg-primary/90 rounded-lg font-medium w-full sm:w-auto order-1 sm:order-2 shadow-md"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssessmentPage;
