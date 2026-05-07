import type { AudienceMode } from "./mode";

export type Question = {
  id: string;
  domain: string;
  frameworks: string[];
  text: string;
  controls: string[];
  opts: string[];
};

export type Answer = {
  questionId: string;
  selectedIndex: number; // 0 = best, 3 = worst
};

export type Finding = {
  questionId: string;
  domain: string;
  frameworks: string[];
  controls: string[];
  question: string;
  answer: string;
  severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  hitech: boolean;
};

export type ScoreResult = {
  totalQuestions: number;
  answered: number;
  findings: Finding[];
  score: number; // 0-100
  kpis: Record<string, number | string>;
};

const SEVERITY_MAP: Record<number, Finding["severity"]> = {
  0: "LOW",
  1: "MEDIUM",
  2: "HIGH",
  3: "CRITICAL",
};

// Controls that are historically enforced by OCR
const OCR_ENFORCED_CONTROLS = [
  "HIPAA-AS-01",
  "HIPAA-TS-01",
  "HIPAA-TS-04",
  "HIPAA-AS-12",
  "HIPAA-AS-05",
];

// Controls that map to insurance questionnaire categories
const INSURANCE_CONTROLS = [
  "HIPAA-TS-01",
  "HIPAA-TS-04",
  "HIPAA-AS-08",
  "HIPAA-TS-02",
  "HIPAA-AS-12",
  "HIPAA-AS-05",
  "HIPAA-AS-16",
  "HIPAA-AS-17",
];

// Controls relevant to ransomware readiness
const RANSOMWARE_CONTROLS = [
  "HIPAA-AS-08",
  "HIPAA-TS-01",
  "HIPAA-TS-02",
  "HIPAA-AS-12",
];

export function computeScore(
  questions: Question[],
  answers: Answer[],
  mode: AudienceMode
): ScoreResult {
  const answerMap = new Map(answers.map((a) => [a.questionId, a]));

  const findings: Finding[] = [];

  for (const q of questions) {
    const answer = answerMap.get(q.id);
    if (!answer) continue;
    if (answer.selectedIndex > 0) {
      findings.push({
        questionId: q.id,
        domain: q.domain,
        frameworks: q.frameworks,
        controls: q.controls,
        question: q.text,
        answer: q.opts[answer.selectedIndex],
        severity: SEVERITY_MAP[answer.selectedIndex],
        hitech: q.frameworks.includes("HITECH"),
      });
    }
  }

  // Score: percentage of questions answered with the best option
  const answered = answers.length;
  const perfect = answers.filter((a) => a.selectedIndex === 0).length;
  const score = answered > 0 ? Math.round((perfect / questions.length) * 100) : 0;

  const kpis: Record<string, number | string> = {};

  if (mode === "practice") {
    // OCR Enforcement Exposure
    kpis.ocrExposure = findings.filter((f) =>
      f.controls.some((c) => OCR_ENFORCED_CONTROLS.includes(c)) &&
      (f.severity === "CRITICAL" || f.severity === "HIGH")
    ).length;

    // Ransomware Readiness
    const ransomwareFindings = findings.filter((f) =>
      f.controls.some((c) => RANSOMWARE_CONTROLS.includes(c))
    );
    const ransomwareMax = questions.filter((q) =>
      q.controls.some((c) => RANSOMWARE_CONTROLS.includes(c))
    ).length;
    const ransomwareScore =
      ransomwareMax > 0
        ? Math.round(
            ((ransomwareMax - ransomwareFindings.length) / ransomwareMax) * 100
          )
        : 100;
    kpis.ransomwareReadiness = `${ransomwareScore}%`;

    // Cyber Insurance Posture
    kpis.cyberInsurancePosture = findings.filter((f) =>
      f.controls.some((c) => INSURANCE_CONTROLS.includes(c))
    ).length;
  } else {
    // Federal KPIs
    const criticalAndHigh = findings.filter(
      (f) => f.severity === "CRITICAL" || f.severity === "HIGH"
    ).length;
    // Estimated SPRS: start at 110, deduct per gap
    kpis.sprsEstimate = Math.max(
      -203,
      110 - criticalAndHigh * 5 - (findings.length - criticalAndHigh) * 1
    );
    kpis.cmmcGaps = findings.length;
    const totalControls = questions.length;
    const satisfiedControls = totalControls - findings.length;
    kpis.dualFrameworkEfficiency =
      totalControls > 0
        ? `${Math.round((satisfiedControls / totalControls) * 100)}%`
        : "0%";
  }

  return { totalQuestions: questions.length, answered, findings, score, kpis };
}
