"use client";

import type { AudienceMode } from "@/lib/mode";

const COPY = {
  federal: {
    headline: "CMMC & NIST 800-171 Compliance Check",
    subhead:
      "Answer 50 questions to see where your organization stands on CMMC Level 2 and NIST 800-171 requirements. Free. No account required.",
    cta: "Start Assessment",
  },
  practice: {
    headline: "HIPAA Risk Readiness Check",
    subhead:
      "Answer 14 questions to see where your practice stands on HIPAA Security Rule and HITECH requirements. Free. No account required.",
    cta: "Start Assessment",
  },
};

export default function Hero({
  mode,
  onStart,
}: {
  mode: AudienceMode;
  onStart: () => void;
}) {
  const copy = COPY[mode];
  return (
    <section className="text-center py-12 md:py-20 px-4 max-w-3xl mx-auto">
      <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-gray-900">
        {copy.headline}
      </h1>
      <p className="mt-4 text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
        {copy.subhead}
      </p>
      <button
        onClick={onStart}
        className="mt-8 inline-flex items-center px-8 py-3 rounded-lg bg-amber-500 text-white font-semibold text-lg hover:bg-amber-600 transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
      >
        {copy.cta}
      </button>
      <p className="mt-4 text-sm text-gray-400">
        Built by GreyLee Services Group
      </p>
    </section>
  );
}
