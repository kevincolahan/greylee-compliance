"use client";

import { useState } from "react";
import type { AudienceMode } from "@/lib/mode";
import type { Question, Answer } from "@/lib/scoring";
import { computeScore } from "@/lib/scoring";
import LeadCapture from "./LeadCapture";

import federalCopy from "@/data/report-copy.federal.json";
import practiceCopy from "@/data/report-copy.practice.json";

export default function GapReport({
  mode,
  questions,
  answers,
}: {
  mode: AudienceMode;
  questions: Question[];
  answers: Answer[];
}) {
  const result = computeScore(questions, answers, mode);
  const copy = mode === "practice" ? practiceCopy : federalCopy;
  const [showLead, setShowLead] = useState(false);

  const severityColor: Record<string, string> = {
    CRITICAL: "bg-red-100 text-red-800",
    HIGH: "bg-orange-100 text-orange-800",
    MEDIUM: "bg-yellow-100 text-yellow-800",
    LOW: "bg-green-100 text-green-800",
  };

  const consultUrl =
    mode === "practice"
      ? process.env.NEXT_PUBLIC_PRACTICE_CONSULT_URL || "#"
      : process.env.NEXT_PUBLIC_FEDERAL_CONSULT_URL || "#";

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-8">
      <div className="max-w-3xl mx-auto px-4 pt-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl md:text-4xl font-bold text-gray-900">
            {copy.headline}
          </h1>
          <p className="mt-2 text-gray-600">{copy.subhead}</p>
        </div>

        {/* Score */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-center mb-4">
            <div className="relative w-32 h-32">
              <svg className="w-full h-full" viewBox="0 0 36 36">
                <path
                  className="text-gray-200"
                  d="M18 2.0845
                    a 15.9155 15.9155 0 0 1 0 31.831
                    a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                />
                <path
                  className="text-amber-500"
                  d="M18 2.0845
                    a 15.9155 15.9155 0 0 1 0 31.831
                    a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeDasharray={`${result.score}, 100`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-bold text-gray-900">
                  {result.score}%
                </span>
              </div>
            </div>
          </div>
          <p className="text-center text-sm text-gray-500">
            {result.answered} of {result.totalQuestions} questions answered
          </p>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {copy.kpis.map((kpi) => (
            <div
              key={kpi.key}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-4"
            >
              <p className="text-sm text-gray-500">{kpi.label}</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {String(result.kpis[kpi.key] ?? "—")}
              </p>
              <p className="text-xs text-gray-400 mt-1">{kpi.description}</p>
            </div>
          ))}
        </div>

        {/* Safe harbor note (practice only) */}
        {mode === "practice" && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-sm text-blue-800">
            {practiceCopy.safeHarborNote}
          </div>
        )}

        {/* Findings */}
        {result.findings.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              {mode === "practice" ? "Findings" : "Identified Gaps"} (
              {result.findings.length})
            </h2>
            <div className="space-y-3">
              {result.findings.map((f) => (
                <div
                  key={f.questionId}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 p-4"
                >
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span
                      className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                        severityColor[f.severity]
                      }`}
                    >
                      {f.severity}
                    </span>
                    <span className="text-xs text-gray-400">{f.domain}</span>
                    {mode === "federal" &&
                      f.frameworks.map((fw) => (
                        <span
                          key={fw}
                          className="px-2 py-0.5 text-xs font-medium rounded-full bg-blue-100 text-blue-700"
                        >
                          {fw}
                        </span>
                      ))}
                    {f.hitech && mode === "practice" && (
                      <span
                        className="text-blue-500"
                        title="HITECH safe harbor — closing this finding removes breach notification obligations"
                      >
                        &#x1f6e1;
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-800 font-medium">
                    {f.question}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    Your answer: {f.answer}
                  </p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {f.controls.map((c) => (
                      <span
                        key={c}
                        className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded"
                      >
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CTAs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6 text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Ready to close these gaps?
          </h3>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href={consultUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-amber-500 text-white font-semibold hover:bg-amber-600 transition-colors"
            >
              {copy.ctas.primary.label}
            </a>
            <button
              onClick={() => setShowLead(true)}
              className="inline-flex items-center justify-center px-6 py-3 rounded-lg border-2 border-amber-500 text-amber-600 font-semibold hover:bg-amber-50 transition-colors"
            >
              Get Your Full Report
            </button>
          </div>
          <a
            href={copy.ctas.secondary.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block mt-3 text-sm text-gray-500 hover:text-gray-700 underline"
          >
            {copy.ctas.secondary.label}
          </a>
        </div>

        {/* Glossary */}
        <details className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-8">
          <summary className="cursor-pointer font-medium text-gray-700">
            Glossary
          </summary>
          <dl className="mt-3 space-y-2">
            {Object.entries(copy.glossary).map(([term, def]) => (
              <div key={term}>
                <dt className="text-sm font-semibold text-gray-800">{term}</dt>
                <dd className="text-sm text-gray-600 ml-4">{def}</dd>
              </div>
            ))}
          </dl>
        </details>
      </div>

      {/* Lead Capture Modal */}
      {showLead && (
        <LeadCapture mode={mode} onClose={() => setShowLead(false)} />
      )}
    </div>
  );
}
