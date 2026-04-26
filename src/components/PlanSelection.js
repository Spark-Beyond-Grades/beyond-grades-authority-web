"use client";

import { useState } from "react";

/* ─── Icons ─── */
const CheckIcon = () => (
  <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
  </svg>
);
const MinusIcon = () => (
  <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M18 12H6" />
  </svg>
);
const XIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);
const ChevronDown = ({ open }) => (
  <svg
    className={`w-3.5 h-3.5 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
    fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
  </svg>
);
const AIBadge = () => (
  <span className="inline-flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-violet-100 text-violet-600 border border-violet-200 shrink-0 ml-1">
    ✦ AI
  </span>
);

/* ─── Expandable internal section ─── */
function InternalSection({ title, items, accent }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`rounded-xl border mt-1 overflow-hidden ${accent.border}`}>
      <button
        onClick={() => setOpen((v) => !v)}
        className={`w-full flex items-center justify-between px-3 py-2 text-xs font-semibold ${accent.text} ${accent.bg} hover:opacity-90 transition-opacity`}
      >
        <span>{title}</span>
        <ChevronDown open={open} />
      </button>
      {open && (
        <ul className="px-3 py-2 space-y-1.5 bg-white/60">
          {items.map((item, i) => (
            <li key={i} className="flex items-center gap-2 text-[12px] text-slate-700">
              <span className="text-green-500 shrink-0">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              </span>
              <span className="flex-1">{item.label}</span>
              {item.ai && <AIBadge />}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/* ─── Plan Data (Feature tiers — no pricing) ─── */
const PLANS = [
  {
    id: "BASIC",
    name: "Basic",
    tagline: "Simple event setup",
    accent: {
      pill: "bg-slate-100 text-slate-600",
      btn: "bg-slate-900 border-transparent text-white hover:bg-slate-700",
      iconBg: "bg-slate-100",
      icon: "🎯",
    },
    popular: false,
    comingSoon: false,
    cta: "Start with Basic",
    features: [
      { label: "Event Logo Upload" },
      { label: "Event Name & Type" },
      { label: "Event Poster Upload" },
      { label: "Event Description" },
      { label: "Event Schedule (Open / Close dates)" },
      { label: "Participant Management" },
    ],
    missing: ["Team Structure", "Analytics", "Internal Chat", "AI Analysis"],
    sections: [],
  },
  {
    id: "PLUS",
    name: "Plus",
    tagline: "Grow your event reach",
    accent: {
      pill: "bg-indigo-100 text-indigo-700",
      btn: "bg-indigo-600 border-transparent text-white hover:bg-indigo-700",
      iconBg: "bg-indigo-100",
      icon: "⚡",
    },
    popular: false,
    comingSoon: true,
    cta: "Start with Plus",
    features: [
      { label: "Everything in Basic" },
      { label: "Team Structure Editor" },
      { label: "Skills & Competency Picker" },
      { label: "Advanced Participant Reports" },
    ],
    missing: ["Deep AI Analysis", "Predictive Modeling"],
    sections: [
      {
        title: "⚡ Internal Options",
        accent: { bg: "bg-indigo-50", text: "text-indigo-700", border: "border-indigo-100" },
        items: [
          { label: "Internal Event Chat" },
          { label: "Role-based Access" },
          { label: "Organizer Notes" },
        ],
      },
      {
        title: "✦ AI Analysis",
        accent: { bg: "bg-violet-50", text: "text-violet-700", border: "border-violet-100" },
        items: [
          { label: "AI Event Summary", ai: true },
          { label: "Participation Insights", ai: true },
        ],
      },
    ],
  },
  {
    id: "PRO",
    name: "Pro",
    tagline: "For power organizers",
    accent: {
      pill: "bg-teal-100 text-teal-700",
      btn: "bg-[#0EA5A4] border-transparent text-white hover:bg-[#0C8B8A]",
      iconBg: "bg-teal-100",
      icon: "🚀",
    },
    popular: true,
    comingSoon: true,
    cta: "Start with Pro",
    features: [
      { label: "Everything in Plus" },
      { label: "Custom Event Branding" },
      { label: "Advanced Analytics & Charts" },
      { label: "Export Reports (PDF / CSV)" },
    ],
    missing: ["Predictive Modeling"],
    sections: [
      {
        title: "⚡ Internal Options",
        accent: { bg: "bg-teal-50", text: "text-teal-700", border: "border-teal-100" },
        items: [
          { label: "Multi-level Internal Chat" },
          { label: "Committee Workspace" },
          { label: "Announcements Board" },
          { label: "Event Task Tracker" },
        ],
      },
      {
        title: "✦ AI Analysis",
        accent: { bg: "bg-violet-50", text: "text-violet-700", border: "border-violet-100" },
        items: [
          { label: "AI Sentiment Analysis", ai: true },
          { label: "Performance Prediction", ai: true },
          { label: "Engagement Score", ai: true },
          { label: "Smart Recommendations", ai: true },
        ],
      },
    ],
  },
  {
    id: "PREMIUM",
    name: "Premium",
    tagline: "Full enterprise power",
    accent: {
      pill: "bg-amber-100 text-amber-700",
      btn: "bg-gradient-to-r from-amber-400 to-orange-500 border-transparent text-white hover:opacity-90",
      iconBg: "bg-amber-100",
      icon: "👑",
    },
    popular: false,
    comingSoon: true,
    cta: "Start with Premium",
    features: [
      { label: "Everything in Pro" },
      { label: "Unlimited Participants" },
      { label: "White-label Branding" },
      { label: "Dedicated Event Manager" },
    ],
    missing: [],
    sections: [
      {
        title: "⚡ Internal Options",
        accent: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-100" },
        items: [
          { label: "All Pro Internal Features" },
          { label: "Live Q&A Module" },
          { label: "Private Committee Rooms" },
          { label: "Real-time Voting / Polls" },
        ],
      },
      {
        title: "✦ AI Analysis (Deep)",
        accent: { bg: "bg-violet-50", text: "text-violet-700", border: "border-violet-100" },
        items: [
          { label: "Deep AI Performance Analysis", ai: true },
          { label: "Predictive Outcome Modeling", ai: true },
          { label: "Real-time AI Dashboard", ai: true },
          { label: "AI-driven Recommendations", ai: true },
          { label: "Natural Language Summaries", ai: true },
        ],
      },
    ],
  },
];

/* ─── Individual Plan Card ─── */
function PlanCard({ plan, onSelect, creating, selectedPlan, index }) {
  const isSelected = selectedPlan === plan.id;
  const isLoading = creating && isSelected;
  const locked = plan.comingSoon;

  return (
    <div
      className={`
        plan-card animate-fade-in-up
        ${plan.popular ? "plan-card-popular" : ""}
        ${locked ? "plan-card-locked" : ""}
      `}
      style={{ animationDelay: `${index * 70}ms` }}
    >
      {/* Coming Soon overlay for locked plans */}
      {locked && (
        <div className="plan-coming-soon-overlay">
          <div className="flex flex-col items-center gap-2">
            <span className="text-3xl">🔒</span>
            <span className="text-sm font-bold text-slate-600">Coming Soon</span>
            <span className="text-xs text-slate-400 text-center leading-relaxed">
              Available in a future update
            </span>
          </div>
        </div>
      )}

      {/* Popular ribbon */}
      {plan.popular && (
        <div className="plan-popular-ribbon">
          ✦ Most Popular
        </div>
      )}

      {/* Plan header */}

      <div className="mb-5">
        <div className="flex items-center gap-3">
          <span className={`text-2xl w-10 h-10 flex items-center justify-center rounded-xl ${plan.accent.iconBg}`}>
            {plan.accent.icon}
          </span>
          <div>
            <span className={`text-[11px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${plan.accent.pill}`}>
              {plan.name}
            </span>
            <p className="text-xs text-slate-400 mt-0.5">{plan.tagline}</p>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-slate-100 mb-4" />

      {/* Included features */}
      <ul className="space-y-2.5 mb-3">
        {plan.features.map((f, i) => (
          <li key={i} className="flex items-start gap-2 text-[13px] text-slate-700">
            <span className="text-green-500 mt-0.5"><CheckIcon /></span>
            {f.label}
          </li>
        ))}
      </ul>

      {/* Missing features (greyed) */}
      {plan.missing.length > 0 && (
        <ul className="space-y-2 mb-3">
          {plan.missing.map((m, i) => (
            <li key={i} className="flex items-start gap-2 text-[13px] text-slate-300">
              <span className="mt-0.5"><MinusIcon /></span>
              <span className="line-through">{m}</span>
            </li>
          ))}
        </ul>
      )}

      {/* Expandable internal sections */}
      {plan.sections.length > 0 && (
        <div className="space-y-2 mt-3">
          {plan.sections.map((sec, i) => (
            <InternalSection
              key={i}
              title={sec.title}
              items={sec.items}
              accent={sec.accent}
            />
          ))}
        </div>
      )}

      {/* Spacer */}
      <div className="flex-1" />

      {/* CTA */}
      <button
        onClick={() => !locked && onSelect(plan.id)}
        disabled={creating || locked}
        className={`
          mt-5 w-full py-2.5 rounded-xl text-sm font-semibold
          border transition-all duration-200
          ${locked
            ? "bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed"
            : `cursor-pointer ${plan.accent.btn} ${plan.popular ? "shadow-lg" : ""}`
          }
        `}
      >
        {locked ? (
          <span className="flex items-center justify-center gap-1.5">
            🔒 Coming Soon
          </span>
        ) : isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Creating…
          </span>
        ) : plan.cta}
      </button>
    </div>
  );
}

/* ─── Main Export ─── */
export default function PlanSelection({ onClose, onConfirm, creating }) {
  const [selectedPlan, setSelectedPlan] = useState(null);

  const handleSelect = (planId) => {
    setSelectedPlan(planId);
    onConfirm(planId);
  };

  return (
    <div
      className="plan-overlay"
      onClick={(e) => e.target === e.currentTarget && !creating && onClose()}
    >
      <div className="plan-modal">
        {/* Close */}
        <button
          onClick={onClose}
          disabled={creating}
          className="plan-close-btn"
          aria-label="Close"
        >
          <XIcon />
        </button>

        {/* Header */}
        <div className="text-center mb-8 animate-fade-in-up">
          <p className="text-xs font-semibold uppercase tracking-widest text-brand-primary mb-3">
            ✦ Beyond Grades
          </p>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight">
            Choose Your Event Template
          </h2>
          <p className="text-slate-500 text-sm mt-2 max-w-lg mx-auto">
            Pick a tier to decide which features are available for this event — from a simple setup to a full AI-powered experience.
          </p>
        </div>

        {/* Cards Grid */}
        <div className="plan-grid">
          {PLANS.map((plan, idx) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              index={idx}
              onSelect={handleSelect}
              creating={creating}
              selectedPlan={selectedPlan}
            />
          ))}
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-slate-400 mt-6 animate-fade-in-up animation-delay-400">
          You can change the event tier anytime before publishing.
        </p>
      </div>
    </div>
  );
}
