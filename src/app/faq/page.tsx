import type { Metadata } from "next";
import React from "react";
import { getStaticPageTitle } from "@/lib/seo";

export const metadata: Metadata = {
  title: getStaticPageTitle("faq"),
};

const faqs = [
  {
    question: 'How do I vote?',
    answer:
      'Create an account, verify your age, then visit the rankings page to cast your vote. You get one Heart every Sunday at midnight MST, and you can reassign it anytime during the week.',
  },
  {
    question: 'Is TerpTier free?',
    answer: 'Yes! Using TerpTier is completely free—no hidden fees or subscriptions.',
  },
  {
    question: 'Who can use TerpTier?',
    answer:
      'Any Colorado resident aged 21 or older can sign up, verify their age, and start voting on their favorite producers.',
  },
  {
    question: 'How often are rankings updated?',
    answer:
      'Leaderboards update in real time as ratings are cast. New favorite hearts are granted every Sunday at midnight MST, and you can change your favorite any time during the week.',
  },
  {
    question: 'How do I reset my password if I forget it?',
    answer:
      'Click "Forgot Password" on the login page, enter your email, and follow the instructions sent to you to set a new password.',
  },
  {
    question: 'How can I suggest a new feature?',
    answer:
      'We love your ideas! Email us at hello@terptier.com or drop a note on our social channels to share feedback or feature requests.',
  },
];

export default function FAQPage() {
  return (
    <div className="bg-white min-h-[100vh]">
      <div className="max-w-4xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-green-800 text-center">
          Frequently Asked Questions
        </h1>

        <div className="mt-8 space-y-4">
          {faqs.map((faq, idx) => (
            <details key={idx} className="border border-gray-200 rounded-lg">
              <summary className="px-4 py-3 cursor-pointer select-none font-medium text-green-800">
                {faq.question}
              </summary>
              <div className="px-4 pb-4 text-gray-700 prose prose-green">
                {faq.answer}
              </div>
            </details>
          ))}
        </div>
      </div>
    </div>
  );
}
