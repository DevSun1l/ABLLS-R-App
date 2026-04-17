import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ABLLS_DOMAINS } from '../data/ablls';
import DomainProgressBar from '../components/DomainProgressBar';
import ScoreButton from '../components/ScoreButton';
import { useAuth } from '../context/AuthContext';

const AssessmentPage = () => {
  const { id } = useParams(); // student id
  const navigate = useNavigate();
  const { user } = useAuth();
  const [student, setStudent] = useState(null);
  const [assessmentData, setAssessmentData] = useState({});
  const [domainIndex, setDomainIndex] = useState(0);
  const [showGatewayModal, setShowGatewayModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Load local fallback or actual DB assessment data
    const fetchData = async () => {
      try {
        const token = sessionStorage.getItem('ablls_token');
        let foundStudent = { id, name: "Current Student" };
        
        if (token) {
           const stuRes = await fetch(`/api/students/get?id=${id}`, {
              headers: { 'Authorization': `Bearer ${token}` }
           });
           if (stuRes.ok) {
              const stuData = await stuRes.json();
              foundStudent = { ...foundStudent, ...stuData.student, name: stuData.student.name };
           }
           
           const res = await fetch(`/api/assessments/load?studentId=${id}`, {
              headers: { 'Authorization': `Bearer ${token}` }
           });
           const result = await res.json();
           if (result.assessment) {
              setAssessmentData(result.assessment.domain_data || {});
           }
        }
        setStudent(foundStudent);
      } catch(e) {
         console.error("Failed to load assessment:", e);
      } finally {
         setIsLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (isLoading) return <div className="p-8 text-center mt-20 font-bold text-gray-500 animate-pulse">Synchronizing Assessment Protocol...</div>;
  if (!student) return <div className="p-8 text-center text-danger">Error: Student Context Lost</div>;

  const currentDomain = ABLLS_DOMAINS[domainIndex];
  const currentSkills = currentDomain.skills;
  const currentDomainData = assessmentData[currentDomain.id] || { skills: {} };

  const autoSaveToDB = async (updatedDomainData) => {
    setAssessmentData(updatedDomainData);
    const token = sessionStorage.getItem('ablls_token');
    if (!token) return;
    fetch(`/api/assessments/save`, {
       method: 'POST',
       headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
       body: JSON.stringify({
          studentId: id,
          domainsData: updatedDomainData
       })
    }).catch(e => console.error("Auto-save failed", e));
  };

  const handleScore = (skillCode, value, isGateway) => {
    const newDomains = { ...assessmentData };
    if (!newDomains[currentDomain.id]) {
       newDomains[currentDomain.id] = { skills: {} };
    }
    const newSkills = { ...newDomains[currentDomain.id].skills };
    
    if (isGateway && value === 'no') {
      setShowGatewayModal(true);
      newSkills[skillCode] = value;
      newDomains[currentDomain.id].skills = newSkills;
      autoSaveToDB(newDomains);
      return;
    }

    newSkills[skillCode] = value;
    newDomains[currentDomain.id].skills = newSkills;
    autoSaveToDB(newDomains);
  };

  const handleGatewaySkip = () => {
    setShowGatewayModal(false);
    const newDomains = { ...assessmentData };
    const newSkills = { ...newDomains[currentDomain.id].skills };
    currentSkills.forEach((skill, idx) => {
       if (idx > 0) newSkills[skill.code] = 'not_assessed';
    });
    newDomains[currentDomain.id].skills = newSkills;
    autoSaveToDB(newDomains);
    handleNextDomain();
  };

  const handleGatewayCancel = () => {
    setShowGatewayModal(false);
    const newDomains = { ...assessmentData };
    const newSkills = { ...newDomains[currentDomain.id].skills };
    delete newSkills[currentSkills[0].code];
    newDomains[currentDomain.id].skills = newSkills;
    autoSaveToDB(newDomains);
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

  const handleJumpDomain = (idx) => {
     setDomainIndex(idx);
     window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="max-w-4xl mx-auto relative pb-24">
      <div className="mb-6 sticky top-0 bg-background pt-4 pb-2 z-10 border-b border-gray-200">
        <DomainProgressBar 
           currentDomainId={currentDomain.id} 
           studentDomains={assessmentData} 
           onSelectDomain={handleJumpDomain}
        />
      </div>
      
      <div className="mb-8 p-8 bg-primary-container/30 border-l-4 border-primary rounded-r-2xl shadow-sm">
        <h2 className="text-2xl font-black text-on-surface font-headline tracking-tight">Domain {currentDomain.id} — {currentDomain.name}</h2>
        <p className="text-primary uppercase text-sm font-extrabold tracking-widest mt-1">{currentDomain.category}</p>
      </div>

      <div className="space-y-6">
        {currentSkills.map(skill => (
          <div key={skill.code} className="bg-white border-2 border-outline-variant/20 rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-primary/40 transition-all group">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 border-b border-outline-variant/10 pb-5">
              <div className="flex items-start gap-4">
                 <div className="bg-surface-container-high text-on-surface-variant font-black px-4 py-2 rounded-xl border border-outline-variant/10 shrink-0 shadow-sm mt-0.5">
                   {skill.code}
                 </div>
                 <div>
                   <p className="text-xl font-semibold text-on-surface leading-snug">{skill.description}</p>
                   {skill.isGateway && (
                     <span className="inline-block mt-3 text-[10px] font-black tracking-widest text-on-tertiary-container bg-tertiary-container px-3 py-1.5 rounded-full uppercase">Gateway Skill</span>
                   )}
                 </div>
              </div>
              <span className="capitalize text-xs font-black tracking-widest bg-secondary-container text-on-secondary-container px-4 py-1.5 rounded-full border border-secondary-container/50 self-start shrink-0 whitespace-nowrap">
                Level {skill.level}
              </span>
            </div>
            
            {(currentDomainData.skills[currentSkills[0].code] === 'no' && skill.isGateway === false) ? (
              <div className="text-center py-6 bg-surface-container rounded-2xl border-2 border-dashed border-outline-variant/30 text-on-surface-variant font-bold uppercase tracking-wider text-sm shadow-inner group-hover:bg-surface-variant/50 transition-colors">
                Autoskipped (Gateway Requisite Not Met)
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

      <div className="fixed bottom-0 left-0 md:left-72 right-0 bg-[#fdf7fe]/80 backdrop-blur-xl border-t border-primary/10 shadow-[0_-4px_25px_-5px_rgba(0,0,0,0.05)] p-4 sm:px-6 z-20">
        <div className="max-w-4xl mx-auto flex justify-between">
          <button 
            onClick={handlePrevDomain}
            disabled={domainIndex === 0}
            className={`px-8 py-4 font-bold rounded-full transition-all flex items-center justify-center min-w-[140px] text-sm tracking-wide ${domainIndex === 0 ? 'opacity-40 cursor-not-allowed bg-surface-container-low text-on-surface-variant' : 'bg-surface-container hover:bg-surface-variant text-on-surface hover:shadow-sm'}`}
          >
            <span className="material-symbols-outlined text-[18px] mr-2">arrow_back</span> Previous
          </button>
          <button 
            onClick={handleNextDomain}
            className="px-8 py-4 font-bold text-on-primary bg-primary rounded-full hover:bg-primary-dim shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all flex items-center justify-center min-w-[160px] text-sm tracking-wide"
          >
            {domainIndex < ABLLS_DOMAINS.length - 1 ? 'Next Domain' : 'View Progress'} <span className="material-symbols-outlined text-[18px] ml-2">arrow_forward</span>
          </button>
        </div>
      </div>

      {showGatewayModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 align-middle transform transition-all scale-100 opacity-100 border border-gray-100">
            <h3 className="text-xl font-black text-danger mb-2">Gateway Skill Not Met</h3>
            <p className="text-textSecondary mb-6 font-medium leading-relaxed">Because the developmental requisite wasn't observed, remaining skills in this domain will automatically be marked as <span className="font-bold text-gray-700">Not Assessed</span>. Are you sure?</p>
            <div className="flex justify-end gap-3 flex-col sm:flex-row">
              <button 
                onClick={handleGatewayCancel}
                className="px-5 py-2.5 text-textSecondary bg-gray-100 hover:bg-gray-200 rounded-xl font-bold w-full sm:w-auto mt-2 sm:mt-0 order-2 sm:order-1 transition-colors"
              >
                Go Back
              </button>
              <button 
                onClick={handleGatewaySkip}
                className="px-5 py-2.5 text-white bg-danger hover:bg-danger/90 rounded-xl font-bold w-full sm:w-auto order-1 sm:order-2 shadow-sm transition-all hover:shadow-md"
              >
                Skip Remaining
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssessmentPage;
