import { getTopWeaknesses } from './scoring';
import { ABLLS_DOMAINS } from '../data/ablls';

export const getMatchingGoals = (student) => {
  // Read goals from session storage or use default library
  const goalsJson = sessionStorage.getItem("ablls_goals");
  let goalLibrary = [];
  if (goalsJson) {
       try {
           goalLibrary = JSON.parse(goalsJson);
       } catch (e) {
           console.error("Failed to parse goals", e);
       }
  }
  
  if(goalLibrary.length === 0) {
      // In case session storage isn't populated early enough
      // Not ideal for pure synchronous function if we really need it,
      // but in the app it's better to manage state
       console.warn("Goals not found in session storage.");
  }
  
  const weakDomains = getTopWeaknesses(student, ABLLS_DOMAINS, 5);
  const weakDomainIds = weakDomains.map(d => d.id);
  const studentDiagnoses = student.diagnoses || [];

  const scoredGoals = goalLibrary.map(goal => {
    let score = 0;
    const domainMatch = goal.ablls_domains.some(d => weakDomainIds.includes(d));
    const diagnosisMatch = goal.diagnoses.includes("All") || goal.diagnoses.some(d => studentDiagnoses.includes(d));
    
    if (domainMatch) score += 10;
    if (diagnosisMatch) score += 5;
    
    return { goal, score, domainMatch, diagnosisMatch };
  });

  let matchedGoals = scoredGoals
    .filter(g => g.domainMatch && g.diagnosisMatch)
    .sort((a, b) => b.score - a.score)
    .map(g => g.goal);

  if (matchedGoals.length < 5) {
    const remaining = scoredGoals
      .filter(g => g.domainMatch || g.diagnosisMatch)
      .sort((a, b) => b.score - a.score)
      .map(g => g.goal)
      .filter(g => !matchedGoals.find(mg => mg.id === g.id));
      
    matchedGoals = [...matchedGoals, ...remaining];
  }
  
  if (matchedGoals.length < 5) {
    const allRemaining = goalLibrary.filter(g => !matchedGoals.find(mg => mg.id === g.id));
    matchedGoals = [...matchedGoals, ...allRemaining];
  }

  return matchedGoals.slice(0, 5);
};
