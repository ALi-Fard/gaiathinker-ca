// Green AI Readiness Assessment — shared by the browser (on-screen results)
// and by the Pages Function (/api/assessment), which re-scores answers server-side.
// Pure data + pure functions. No network, no side effects.

export const ASSESSMENT_VERSION = '2026-11-05';
export const CONSENT_TEXT_VERSION = '2026-11-05';

export const ORG_TYPES = [
  { id: 'school', label: 'School or school district' },
  { id: 'postsec', label: 'College or university' },
  { id: 'library', label: 'Library' },
  { id: 'public', label: 'Government or public agency' },
  { id: 'nonprofit', label: 'Nonprofit or community organization' },
  { id: 'business', label: 'Business' },
  { id: 'other', label: 'Other' }
];

export const ROLES = [
  { id: 'exec', label: 'Executive or senior leader' },
  { id: 'manager', label: 'Manager or department head' },
  { id: 'it', label: 'IT, data or privacy' },
  { id: 'educator', label: 'Teacher, instructor or librarian' },
  { id: 'staff', label: 'Staff member' },
  { id: 'other', label: 'Other' }
];

export const DIMENSIONS = [
  { id: 'S', name: 'Strategy & leadership' },
  { id: 'P', name: 'Policy, privacy & risk' },
  { id: 'K', name: 'People & skills' },
  { id: 'T', name: 'Tools & workflows' },
  { id: 'G', name: 'Green & responsible AI' }
];

// Each option scores 1–4 by position.
export const QUESTIONS = [
  { id: 'q1', dim: 'S', text: 'Does your organization have a goal or plan for using AI?', options: ['No', 'Only informal conversations', 'A draft plan or a few pilot goals', 'An approved plan with owners and measures'] },
  { id: 'q2', dim: 'S', text: 'Who leads decisions about AI?', options: ['No one', 'Individual enthusiasts', 'A working group', 'A named leader with a mandate and budget'] },
  { id: 'q3', dim: 'P', text: 'Do you have an AI acceptable-use policy?', options: ['None', 'Informal guidance', 'A written policy that few people know', 'A written policy that is trained and reviewed regularly'] },
  { id: 'q4', dim: 'P', text: 'How is personal or sensitive information handled with AI tools?', options: ['No rules', 'People use their own judgment', 'An approved-tools list and rules for sensitive data', 'Privacy impact assessments and data-residency requirements for every AI tool'] },
  { id: 'q5', dim: 'K', text: 'How many staff have had AI training?', options: ['None', 'A few, self-taught', 'Some, through formal training', 'Most staff, with role-based training'] },
  { id: 'q6', dim: 'K', text: 'Can staff write effective prompts and check AI output?', options: ['Rarely', 'Some can', 'Most can, with guidance', 'Yes, with a shared prompt library and review habits'] },
  { id: 'q7', dim: 'T', text: 'How is AI used day to day?', options: ['Not used', 'Ad hoc, on personal accounts', 'Approved tools in a few workflows', 'Built into core workflows, with measured results'] },
  { id: 'q8', dim: 'T', text: 'Do you measure AI’s impact (time saved, quality)?', options: ['No', 'Anecdotes only', 'Some metrics on pilots', 'Regular reporting tied to goals'] },
  { id: 'q9', dim: 'G', text: 'Do you consider environmental footprint when choosing AI tools?', options: ['Never', 'It comes up occasionally', 'We prefer efficient tools and settings', 'It is a procurement criterion (disclosures, region, model size)'] },
  { id: 'q10', dim: 'G', text: 'Do you guide staff on efficient AI use (model size, prompting, image and video generation)?', options: ['No', 'Informally', 'Some guidance is shared', 'Built into training and policy'] }
];

export const LEVELS = [
  { id: 'exploring', max: 1.75, name: 'Exploring', summary: 'AI use is early or informal. The biggest wins now are a named owner, a simple policy and one measured pilot.' },
  { id: 'experimenting', max: 2.5, name: 'Experimenting', summary: 'Pockets of AI use exist, but without shared rules or measurement. Turn experiments into a few standard, governed workflows.' },
  { id: 'scaling', max: 3.25, name: 'Scaling', summary: 'Foundations are in place. Focus on measurement, deeper integration and efficient, responsible use across teams.' },
  { id: 'leading', max: 4.01, name: 'Leading', summary: 'AI is governed, measured and part of how you work. Keep improving through procurement standards, transparency and footprint reporting.' }
];

// Practical actions by dimension and tier (1 = score ≤ 2, 2 = ≤ 3, 3 = > 3).
export const RECS = {
  S: {
    1: ['Name one accountable AI lead and give them two hours a week for the next 90 days.', 'Pick two problems where AI could save measurable time, such as drafting newsletters or summarizing meeting notes. Avoid vague goals like "use AI more".', 'Write a one-page AI intent statement covering why you use AI, where you use it and where you won’t.'],
    2: ['Turn your pilots into a 12-month roadmap with an owner, a budget line and a success measure for each use case.', 'Set up a small working group of leadership, IT/privacy and frontline staff that meets monthly.'],
    3: ['Review your AI portfolio every quarter and retire tools that don’t show measurable value.', 'Publish your AI approach to staff and your community. Transparency builds trust.']
  },
  P: {
    1: ['Adopt a short acceptable-use policy: which tools are approved, what data never goes into AI (personal, student, health or financial) and who to ask.', 'Find out which AI tools staff already use with a 10-minute anonymous survey.', 'BC public bodies: check your obligations under BC’s privacy law (FIPPA) before adopting any AI tool that processes personal information.'],
    2: ['Run a privacy impact assessment for each AI tool that touches personal information, and prefer tools that keep data in Canada.', 'Make the policy visible: add a one-page summary to onboarding and your intranet.'],
    3: ['Add AI clauses to procurement: data residency, no training on your data, incident notification, and disclosure of the model and its energy use.', 'Audit AI use every year, and keep a record of any AI-assisted decision that affects a person.']
  },
  K: {
    1: ['Run a 60-minute hands-on session: writing good prompts, checking output, and what never to paste into AI.', 'Find two or three staff who already use AI well and ask them to coach their peers.'],
    2: ['Build a shared prompt library for your 10 most common tasks.', 'Offer role-based training: strategy and risk for leaders, workflows for staff, governance for IT.'],
    3: ['Add AI skills to job descriptions and performance conversations.', 'Hold a quarterly show-and-tell so good practice spreads across teams.']
  },
  T: {
    1: ['Move staff from personal accounts to one approved tool with an organizational agreement.', 'Pick one workflow, time it, pilot AI on it for four weeks, then time it again.'],
    2: ['Document the three workflows where AI works best and standardize them with templates and a review step.', 'Track two measures per use case: time saved, and quality or error rate.'],
    3: ['Connect AI to your core systems (documents, CRM, learning platforms) instead of relying on copy and paste.', 'Report AI’s impact against your organizational goals every quarter.']
  },
  G: {
    1: ['Share five Green AI habits with staff: write a clear first prompt, set the answer length, use the small model first, edit instead of regenerating, and limit image and video generation.', 'Set staff tools to the smaller or faster model by default wherever that option exists.'],
    2: ['Add footprint questions to tool selection. Does the provider publish energy, water and emissions data? Which regions run your workloads?', 'Set guidance for AI image and video generation, the heaviest everyday uses.'],
    3: ['Score providers’ sustainability disclosures and region choices as part of procurement.', 'Report AI use alongside your climate commitments, for example in your annual sustainability report.']
  }
};

export const ORG_NOTES = {
  school: 'For BC schools and districts: student information falls under FIPPA. Keep student personal data out of general AI tools, and prefer tools that need no student accounts.',
  postsec: 'For post-secondary: align AI guidance with academic integrity policy, and give instructors course-level options, not one blanket rule.',
  library: 'For libraries: patron privacy comes first. Offer AI literacy programs, and keep patron data out of AI tools.',
  public: 'For public agencies: FIPPA and records-management rules apply. Log AI-assisted outputs that inform decisions.',
  nonprofit: 'For nonprofits: start with low-risk, high-volume tasks like grant drafts, reports and newsletters, and protect donor and client data.',
  business: 'For businesses: Canada’s private-sector privacy law (PIPEDA) applies to customer data. Start where AI saves measurable time for customer-facing staff.',
  other: 'Start small, measure the results, and write down your rules before you scale.'
};

function tierFor(avg) { return avg <= 2 ? 1 : (avg <= 3 ? 2 : 3); }

// answers: { q1: 1..4, ... }. Returns null if invalid.
export function scoreAssessment(answers) {
  if (!answers || typeof answers !== 'object') return null;
  const byDim = {};
  for (const q of QUESTIONS) {
    const v = Number(answers[q.id]);
    if (!Number.isInteger(v) || v < 1 || v > 4) return null;
    (byDim[q.dim] = byDim[q.dim] || []).push(v);
  }
  const dims = DIMENSIONS.map(d => {
    const vals = byDim[d.id];
    const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
    return { id: d.id, name: d.name, avg, pct: Math.round((avg - 1) / 3 * 100), tier: tierFor(avg), recs: RECS[d.id][tierFor(avg)] };
  });
  const overall = dims.reduce((a, d) => a + d.avg, 0) / dims.length;
  const level = LEVELS.find(l => overall < l.max) || LEVELS[LEVELS.length - 1];
  // Priorities: the three lowest dimensions, first action of each.
  const priorities = dims.slice().sort((a, b) => a.avg - b.avg).slice(0, 3)
    .map(d => ({ dim: d.name, action: d.recs[0] }));
  const plan = [
    { when: 'First 30 days', what: priorities[0].action },
    { when: 'Days 31–60', what: priorities[1].action },
    { when: 'Days 61–90', what: priorities[2].action }
  ];
  return { overall: Math.round(overall * 100) / 100, overallPct: Math.round((overall - 1) / 3 * 100), level, dims, priorities, plan };
}
