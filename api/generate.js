export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { student, selectedGoals } = req.body;
    
    const systemPrompt = `You are an expert special education intervention planner with deep knowledge of ABA therapy, speech-language therapy, and occupational therapy.

You will receive:
1. A child's profile (name, age, diagnoses, weak domains)
2. 5 pre-selected intervention goal templates from a curated library

Your task:
- Convert each goal template into a fully-formed SMART goal
- SMART = Specific, Measurable, Achievable, Relevant, Time-bound
- Personalise each goal using the child's name, age, diagnoses, and weak domains
- For each goal, provide:
    * smartGoal: The full SMART goal statement (2–3 sentences)
    * strategy: ABA / Speech-Language Therapy / Occupational Therapy (choose most appropriate)
    * activity: One concrete activity to achieve this goal
    * serviceType: Individual / Group / Classroom-based
    * benefitStatement: Fill in the benefit template using child details

Return ONLY a valid JSON array of 5 objects. No preamble. No markdown.
Each object: { "smartGoal": "", "strategy": "", "activity": "", "serviceType": "", "benefitStatement": "" }`;

    const userPrompt = `Child: ${student.name}, Age: ${student.ageYears} years ${student.ageMonths} months, Diagnoses: ${(student.diagnoses||[]).join(', ')}
Weak ABLLS-R Domains: ${JSON.stringify(student.weakDomains)}

Goal Templates:
${selectedGoals.map((g,i) => `${i+1}. ${g.title}\nBenefit Template: ${g.benefitTemplate}`).join('\n\n')}

Generate 5 personalised SMART goals.`;

    if (!process.env.GEMINI_API_KEY) {
       console.warn("No Gemini API Key found. Returning mock data.");
       const mockData = selectedGoals.map((g, i) => ({
           smartGoal: `By the end of the term, ${student.name} will achieve their ${g.title} goal with 80% accuracy across 3 sessions, as measured by teacher observation.`,
           strategy: "ABA Therapy",
           activity: `Structured practice for ${g.title}`,
           serviceType: "Individual",
           benefitStatement: g.benefitTemplate.replace('[child\'s name]', student.name).replace('[skill area]', g.domain).replace('[target ability]', 'this skill').replace('[ABLLS-R domain]', g.domain).replace('[diagnosis]', student.diagnoses?.[0] || 'delay')
       }));
       return res.status(200).json(mockData);
    }

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{
          role: "user",
          parts: [{ text: userPrompt }]
        }],
        systemInstruction: {
          parts: [{ text: systemPrompt }]
        },
        generationConfig: {
          responseMimeType: "application/json"
        }
      })
    });

    const data = await response.json();
    if (!response.ok) {
        console.error("API Error Response:", data);
        return res.status(500).json({ error: data.error?.message || "Gemini API HTTP Error" });
    }
    
    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
        return res.status(500).json({ error: "Gemini returned no content. Safety block or invalid response." });
    }

    const textContent = data.candidates[0].content.parts[0].text.trim();
    let jsonArray = [];
    try {
        jsonArray = JSON.parse(textContent);
    } catch(e) {
        const match = textContent.match(/\[([\s\S]*?)\]/);
        if (match) jsonArray = JSON.parse(match[0]);
        else throw new Error("Could not parse JSON array from Gemini: " + textContent.substring(0, 100));
    }
    
    return res.status(200).json(jsonArray);
  } catch (error) {
    console.error("AI generation error:", error);
    return res.status(500).json({ error: error.message || 'AI generation threw an exception' });
  }
}
