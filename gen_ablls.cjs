const fs = require('fs');

const generateSkills = (domainChar, count, domainName) => {
  const levels = ["foundation", "intermediate", "advanced"];
  const skills = [];
  for (let i = 1; i <= count; i++) {
    let level = levels[0];
    if (i > count / 3) level = levels[1];
    if (i > 2 * count / 3) level = levels[2];
    
    // Custom descriptions for some gateways to look realistic
    let desc = `Demonstrates skill ${domainChar}${i} related to ${domainName}`;
    if (domainChar === 'A' && i === 1) desc = "Matches identical objects";
    if (domainChar === 'B' && i === 1) desc = "Follows a simple 1-step instruction";
    if (domainChar === 'E' && i === 1) desc = "Points or reaches to request item";
    if (domainChar === 'F' && i === 1) desc = "Labels common objects";
    
    skills.push({
      code: `${domainChar}${i}`,
      description: desc,
      level: level,
      isGateway: i === 1
    });
  }
  return skills;
};

const domainsData = [
  { id: "A", name: "Visual Performance", cat: "Basic Learner Skills", count: 8 },
  { id: "B", name: "Receptive Language", cat: "Basic Learner Skills", count: 10 },
  { id: "C", name: "Motor Imitation", cat: "Basic Learner Skills", count: 6 },
  { id: "D", name: "Vocal Imitation", cat: "Basic Learner Skills", count: 6 },
  { id: "E", name: "Requests (Manding)", cat: "Basic Learner Skills", count: 8 },
  { id: "F", name: "Labelling (Tacting)", cat: "Basic Learner Skills", count: 8 },
  { id: "G", name: "Intraverbals", cat: "Basic Learner Skills", count: 6 },
  { id: "H", name: "Spontaneous Vocalisation", cat: "Basic Learner Skills", count: 4 },
  { id: "I", name: "Syntax & Grammar", cat: "Basic Learner Skills", count: 6 },
  { id: "J", name: "Play & Leisure", cat: "Basic Learner Skills", count: 6 },
  { id: "K", name: "Social Interaction", cat: "Basic Learner Skills", count: 8 },
  { id: "L", name: "Group Instruction", cat: "Basic Learner Skills", count: 4 },
  { id: "M", name: "Reading", cat: "Academic Skills", count: 6 },
  { id: "N", name: "Math", cat: "Academic Skills", count: 6 },
  { id: "O", name: "Writing", cat: "Academic Skills", count: 6 },
  { id: "P", name: "Spelling", cat: "Academic Skills", count: 4 },
  { id: "Q", name: "Dressing", cat: "Academic Skills", count: 6 },
  { id: "R", name: "Eating", cat: "Academic Skills", count: 4 },
  { id: "S", name: "Grooming", cat: "Academic Skills", count: 4 },
  { id: "T", name: "Toileting", cat: "Self-Help Skills", count: 4 },
  { id: "U", name: "Undressing", cat: "Self-Help Skills", count: 4 },
  { id: "V", name: "Domestic Behaviour", cat: "Self-Help Skills", count: 4 },
  { id: "W", name: "Classroom Routines", cat: "Self-Help Skills", count: 4 },
  { id: "X", name: "Gross Motor", cat: "Motor Skills", count: 6 },
  { id: "Y", name: "Fine Motor", cat: "Motor Skills", count: 6 },
  { id: "Z", name: "Motor Imitation (Advanced)", cat: "Motor Skills", count: 4 }
];

const ABLLS_DOMAINS = domainsData.map(d => ({
  id: d.id,
  name: d.name,
  category: d.cat,
  skills: generateSkills(d.id, d.count, d.name)
}));

const fileContent = `export const ABLLS_DOMAINS = ${JSON.stringify(ABLLS_DOMAINS, null, 2)};`;
fs.writeFileSync('src/data/ablls.js', fileContent);
console.log('src/data/ablls.js generated');
