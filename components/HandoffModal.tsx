"use client";

import { useState } from "react";

interface HandoffModalProps {
  email: string;
  answers: { questionId: string; answerIndex: number }[];
  onClose: () => void;
}

export default function HandoffModal({
  email,
  answers,
  onClose,
}: HandoffModalProps) {
  const [practiceName, setPracticeName] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState(email);
  const [contactPhone, setContactPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [redirectUrl, setRedirectUrl] = useState("");
  const [fallbackMessage, setFallbackMessage] = useState("");

  const needsEmail = !email;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const submissionId = crypto.randomUUID();

      const res = await fetch("/api/handoff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          practiceName,
          contactName,
          contactEmail,
          contactPhone: contactPhone || undefined,
          responses: answers,
          submissionId,
        }),
      });

      const data = await res.json();

      if (res.ok && data.redirectUrl) {
        setSuccess(true);
        setRedirectUrl(data.redirectUrl);
      } else {
        setFallbackMessage(
          data.message ||
            "We couldn't create your account automatically. Our team will reach out within 1 business day to get you set up."
        );
        setSuccess(true);
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-xl"
          aria-label="Close"
        >
          &times;
        </button>

        {success ? (
          <div className="text-center py-8">
            {redirectUrl ? (
              <>
                <div className="text-4xl mb-4">&#x2705;</div>
                <h3 className="text-xl font-semibold text-gray-900">
                  Your trial is ready!
                </h3>
                <p className="mt-2 text-gray-600">
                  We&apos;re creating your account with all findings pre-loaded.
                  Complete your signup to get started.
                </p>
                <a
                  href={redirectUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-6 inline-block px-6 py-3 rounded-lg bg-amber-500 text-white font-semibold hover:bg-amber-600 transition-colors"
                >
                  Complete Signup
                </a>
              </>
            ) : (
              <>
                <div className="text-4xl mb-4">&#x1F4E8;</div>
                <h3 className="text-xl font-semibold text-gray-900">
                  We&apos;ve got your info!
                </h3>
                <p className="mt-2 text-gray-600">{fallbackMessage}</p>
              </>
            )}
            <button
              onClick={onClose}
              className="mt-4 px-6 py-2 rounded-lg border border-gray-300 text-gray-600 font-medium hover:bg-gray-50"
            >
              Close
            </button>
          </div>
        ) : (
          <>
            <h3 className="text-xl font-semibold text-gray-900 mb-1">
              Start Your Free Trial
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              We&apos;ll create your Healthcare Practice tracker with all
              findings pre-loaded. 14 days free, no credit card required.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Practice Name *
                </label>
                <input
                  type="text"
                  required
                  value={practiceName}
                  onChange={(e) => setPracticeName(e.target.value)}
                  placeholder="e.g. Acme Dental"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Primary Contact Name *
                </label>
                <input
                  type="text"
                  required
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-sm"
                />
              </div>
              {needsEmail && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Work Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-sm"
                  />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone (optional)
                </label>
                <input
                  type="tel"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-sm"
                />
              </div>

              {error && <p className="text-sm text-red-600">{error}</p>}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-lg bg-amber-500 text-white font-semibold hover:bg-amber-600 transition-colors disabled:opacity-50"
              >
                {loading ? "Setting up..." : "Start Free Trial"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
