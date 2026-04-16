export const computeDomainScore = (domainData) => {
  if (!domainData || !domainData.skills) return 0;
  let score = 0;
  let totalScoreable = 0;

  for (const skillCode in domainData.skills) {
    const value = domainData.skills[skillCode];
    if (value === "not_assessed") continue;

    totalScoreable++;
    if (value === "yes") score += 1;
    else if (value === "sometimes") score += 0.5;
  }

  if (totalScoreable === 0) return 0;
  return Math.round((score / totalScoreable) * 100);
};

export const computeOverallMastery = (student) => {
  if (!student.domains) return 0;
  let totalScore = 0;
  let totalDomains = 0;

  for (const domainKey in student.domains) {
    const dScore = computeDomainScore(student.domains[domainKey]);
    totalScore += dScore;
    totalDomains++;
  }

  if (totalDomains === 0) return 0;
  return Math.round(totalScore / totalDomains);
};

export const getTopStrengths = (student, domainsMeta, n = 3) => {
  if (!student.domains) return [];
  const scores = [];
  for (const domainKey in student.domains) {
    // Exclude domains that are fully skipped
    const domainData = student.domains[domainKey];
    let hasAssessed = false;
    for(const k in domainData.skills) {
      if(domainData.skills[k] !== "not_assessed") hasAssessed = true;
    }
    if (hasAssessed) {
      const dScore = computeDomainScore(student.domains[domainKey]);
      const meta = domainsMeta.find(d => d.id === domainKey);
      scores.push({ id: domainKey, name: meta?.name, score: dScore });
    }
  }
  scores.sort((a, b) => b.score - a.score);
  return scores.slice(0, n);
};

export const getTopWeaknesses = (student, domainsMeta, n = 3) => {
  if (!student.domains) return [];
  const scores = [];
  for (const domainKey in student.domains) {
    const domainData = student.domains[domainKey];
    let hasAssessed = false;
    for(const k in domainData.skills) {
      if(domainData.skills[k] !== "not_assessed") hasAssessed = true;
    }
    if (hasAssessed) {
      const dScore = computeDomainScore(domainData);
      const meta = domainsMeta.find(d => d.id === domainKey);
      scores.push({ id: domainKey, name: meta?.name, score: dScore });
    }
  }
  scores.sort((a, b) => a.score - b.score);
  return scores.slice(0, n);
};

export const getPriorityDomains = (student, domainsMeta) => {
  if (!student.domains) return [];
  const scores = [];
  for (const domainKey in student.domains) {
    const domainData = student.domains[domainKey];
    let hasAssessed = false;
    for(const k in domainData.skills) {
      if(domainData.skills[k] !== "not_assessed") hasAssessed = true;
    }
    if(hasAssessed) {
      const score = computeDomainScore(domainData);
      if (score < 40) {
        const meta = domainsMeta.find(d => d.id === domainKey);
        scores.push({ id: domainKey, name: meta?.name, score });
      }
    }
  }
  scores.sort((a, b) => a.score - b.score);
  return scores.slice(0, 3);
};

export const getDiagnosisInsights = (diagnoses, weakDomains) => {
  let insights = [];
  const weakDomainNames = weakDomains.map(d => d.name);
  
  if (diagnoses.includes("ASD") && weakDomainNames.some(name => name.includes("Social"))) {
    insights.push("Social communication is a core challenge area for children with ASD. Prioritise functional communication and joint attention activities.");
  }
  if (diagnoses.includes("ADHD") && (weakDomainNames.some(name => name.includes("Performance") || name.includes("Classroom")))) {
    insights.push("Attention deficits combined with weak classroom routines can impact academic access. Consider environmental supports and task-chunking.");
  }
  if (diagnoses.includes("DD") && weakDomainNames.some(name => name.includes("Motor"))) {
    insights.push("Developmental delays affecting motor skills can hinder daily living independence. Recommend occupational therapy review for adaptive equipment.");
  }
  if(insights.length === 0) {
    insights.push("Review priority domains to determine immediate targets for skill acquisition.");
  }
  
  return insights.join(" ");
};
