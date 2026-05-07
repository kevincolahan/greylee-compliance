"use client";

import { useState, useEffect } from "react";
import type { AudienceMode } from "@/lib/mode";
import type { Question, Answer } from "@/lib/scoring";
import Hero from "./Hero";
import GapReport from "./GapReport";

export default function QuestionFlow({ mode }: { mode: AudienceMode }) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(-1); // -1 = hero
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const file =
      mode === "practice"
        ? "/data/questions.practice.json"
        : "/data/questions.federal.json";
    fetch(file)
      .then((r) => r.json())
      .then((data: Question[]) => setQuestions(data));
  }, [mode]);

  if (done && questions.length > 0) {
    return <GapReport mode={mode} questions={questions} answers={answers} />;
  }

  if (currentIndex === -1) {
    return <Hero mode={mode} onStart={() => setCurrentIndex(0)} />;
  }

  const q = questions[currentIndex];
  if (!q) return null;

  const progress = Math.round(((currentIndex + 1) / questions.length) * 100);
  const existingAnswer = answers.find((a) => a.questionId === q.id);

  function selectOption(idx: number) {
    setAnswers((prev) => {
      const filtered = prev.filter((a) => a.questionId !== q.id);
      return [...filtered, { questionId: q.id, selectedIndex: idx }];
    });
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((i) => i + 1);
    } else {
      setDone(true);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-8">
      <div className="max-w-2xl mx-auto px-4 pt-8">
        {/* Progress */}
        <div className="mb-6">
          <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
            <span>
              Question {currentIndex + 1} of {questions.length}
            </span>
            <span>{progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-amber-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Domain tag */}
        <div className="flex flex-wrap gap-2 mb-4">
          <span className="inline-block px-3 py-1 text-xs font-medium rounded-full bg-gray-200 text-gray-700">
            {q.domain}
          </span>
          {mode === "federal" &&
            q.frameworks.map((fw) => (
              <span
                key={fw}
                className="inline-block px-3 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-700"
              >
                {fw}
              </span>
            ))}
        </div>

        {/* Question */}
        <h2 className="text-xl md:text-2xl font-semibold text-gray-900 mb-6">
          {q.text}
        </h2>

        {/* Options */}
        <div className="space-y-3">
          {q.opts.map((opt, idx) => (
            <button
              key={idx}
              onClick={() => selectOption(idx)}
              className={`w-full text-left p-4 rounded-lg border-2 transition-colors ${
                existingAnswer?.selectedIndex === idx
                  ? "border-amber-500 bg-amber-50"
                  : "border-gray-200 bg-white hover:border-amber-300 hover:bg-amber-50/50"
              }`}
            >
              <span className="text-sm md:text-base text-gray-800">{opt}</span>
            </button>
          ))}
        </div>

        {/* Navigation */}
        <div className="flex justify-between mt-8">
          <button
            onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
            disabled={currentIndex === 0}
            className="px-4 py-2 text-sm text-gray-500 hover:text-gray-800 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Back
          </button>
          {existingAnswer && currentIndex < questions.length - 1 && (
            <button
              onClick={() => setCurrentIndex((i) => i + 1)}
              className="px-4 py-2 text-sm text-amber-600 hover:text-amber-800 font-medium"
            >
              Next
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
