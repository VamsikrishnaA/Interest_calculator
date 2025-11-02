import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, Globe } from "lucide-react";

/**
 * InterestCalculator (loads translations from /translations.json)
 * Paste as: src/components/InterestCalculator.jsx
 *
 * - Uses translations JSON in public/translations.json
 * - Falls back to built-in translations if fetch fails
 * - Persists chosen language in localStorage ('goldcalc_lang')
* working with telugu toggle
 * - Keeps your dark-gold UI & calculation logic
 */

export default function InterestCalculator() {
  const [principal, setPrincipal] = useState("");
  const [monthlyRate, setMonthlyRate] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [mode, setMode] = useState("monthly");
  const [interestType, setInterestType] = useState("simple");
  const [paidStatus, setPaidStatus] = useState("not_paid");
  const [results, setResults] = useState([]);

  // translations loaded from /translations.json (public)
  const [translations, setTranslations] = useState(null);
  // language code: 'en' | 'te'
  const [lang, setLang] = useState(() => localStorage.getItem("goldcalc_lang") || "en");

  // fallback translations (if fetch fails)
  const FALLBACK = {
    en: {
      title: "Gold Loan Interest Calculator",
      principal: "Principal (₹)",
      rate: "Monthly Rate (%)",
      start: "Start Date",
      end: "End Date",
      mode: "Mode",
      paidStatus: "Paid Status",
      not_paid: "Not Paid",
      paid: "Paid",
      interestType: "Interest",
      simple: "Simple",
      compound: "Compound",
      calc: "Calculate",
      days_incl: "Days (incl.)",
      months_incl: "Months (incl.)",
      interest_label: "Interest",
      total_label: "Total (P+I)",
      monthly: "Monthly",
      daily: "Daily",
    },
    te: {
      title: "బంగారు లోన్ వడ్డీ లెక్కింపు",
      principal: "మూలధనం (₹)",
      rate: "మాస వడ్డీ (%)",
      start: "ప్రారంభ తేది",
      end: "ముగింపు తేది",
      mode: "మోడ్",
      paidStatus: "చెల్లింపు స్థితి",
      not_paid: "చెల్లించలేదు",
      paid: "చెల్లించబడింది",
      interestType: "వడ్డీ రకం",
      simple: "సాధారణ",
      compound: "సంక్లిష్ట",
      calc: "లెక్కించు",
      days_incl: "రోజులు (సహా)",
      months_incl: "మాసాలు (సహా)",
      interest_label: "వడ్డీ",
      total_label: "మొత్తం (మూలధనం + వడ్డీ)",
      monthly: "మాసవారీ",
      daily: "దినవారీ",
    },
  };

  // t(key) -> translation for current language (safe fallback)
  function t(key) {
    const src = translations || FALLBACK;
    return (src[lang] && src[lang][key]) || (FALLBACK[lang] && FALLBACK[lang][key]) || key;
  }

  // load translations.json from public folder
  useEffect(() => {
    let mounted = true;
    fetch("/translations.json")
      .then((res) => {
        if (!res.ok) throw new Error("no translations file");
        return res.json();
      })
      .then((data) => {
        if (mounted) setTranslations(data);
      })
      .catch(() => {
        // fallback kept
        setTranslations(null);
      });
    return () => {
      mounted = false;
    };
  }, []);

  // persist language preference
  useEffect(() => {
    localStorage.setItem("goldcalc_lang", lang);
  }, [lang]);

  // load history
  useEffect(() => {
    try {
      const raw = localStorage.getItem("goldcalc_history");
      if (raw) setResults(JSON.parse(raw));
    } catch {}
  }, []);

  // save history
  useEffect(() => {
    try {
      localStorage.setItem("goldcalc_history", JSON.stringify(results));
    } catch {}
  }, [results]);

  // helpers
  function inclusiveDaysBetween(startISO, endISO) {
    const s = new Date(startISO + "T00:00:00");
    const e = new Date(endISO + "T00:00:00");
    return Math.floor((e - s) / (1000 * 60 * 60 * 24)) + 1;
  }

  function getMonthsCount(startISO, endISO) {
    const start = new Date(startISO + "T00:00:00");
    const end = new Date(endISO + "T00:00:00");
    if (end < start) return { error: "invalid-range" };

    function addOneMonth(d) {
      const y = d.getFullYear();
      const m = d.getMonth();
      const day = d.getDate();
      const next = new Date(y, m + 1, day);
      if (next.getDate() !== day) next.setDate(0); // clamp
      return next;
    }

    let cursor = new Date(start.getTime());
    let fullMonths = 0;
    while (true) {
      const nx = addOneMonth(cursor);
      if (nx <= end) {
        fullMonths += 1;
        cursor = nx;
      } else break;
    }

    const daysCovered = Math.floor((cursor - start) / (1000 * 60 * 60 * 24));
    const totalInclusive = inclusiveDaysBetween(startISO, endISO);
    const remainingDays = totalInclusive - daysCovered;

    let monthsCount = fullMonths;
    let partialRule = "days";
    if (remainingDays < 6) partialRule = "days";
    else if (remainingDays >= 6 && remainingDays <= 16) {
      monthsCount += 0.5;
      partialRule = "half";
    } else {
      monthsCount += 1;
      partialRule = "full";
    }

    return { fullMonths, remainingDays, totalInclusive, monthsCount, partialRule };
  }

  function round(n, digits = 2) {
    const m = Math.pow(10, digits);
    return Math.round(n * m) / m;
  }

  function formatDDMMYYYY(iso) {
    if (!iso) return "";
    const d = new Date(iso + "T00:00:00");
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yyyy = d.getFullYear();
    return `${dd}-${mm}-${yyyy}`;
  }

  function calculate() {
    if (!principal || !monthlyRate || !startDate || !endDate) {
      alert(t("Please fill all fields") || "Please fill all fields");
      return;
    }

    const P = Number(principal);
    const rMonthly = Number(monthlyRate);
    if (isNaN(P) || P <= 0 || isNaN(rMonthly) || rMonthly <= 0) {
      alert(t("Enter valid inputs") || "Enter valid inputs");
      return;
    }

    const totalDays = inclusiveDaysBetween(startDate, endDate);
    const monthsInfo = getMonthsCount(startDate, endDate);

    let interest = 0;
    let total = 0;
    let extra = {};

    // SIMPLE
    if (interestType === "simple") {
      if (mode === "daily") {
        const dailyRate = rMonthly / 30 / 100;
        interest = P * dailyRate * totalDays;
        total = P + interest;
        extra = { totalDays };
      } else {
        if (monthsInfo.partialRule === "days") {
          const dailyRate = rMonthly / 30 / 100;
          const dayInterest = P * dailyRate * monthsInfo.remainingDays;
          const monthsInterest = P * (rMonthly / 100) * monthsInfo.fullMonths;
          interest = monthsInterest + dayInterest;
        } else {
          interest = P * (rMonthly / 100) * monthsInfo.monthsCount;
        }

        // subtract first month interest if paid
        if (paidStatus === "paid" && monthsInfo.monthsCount >= 1) {
          const firstMonthInterest = P * (rMonthly / 100);
          interest -= firstMonthInterest;
        }

        total = P + interest;
        extra = monthsInfo;
      }
    } else {
      // COMPOUND
      if (mode === "daily") {
        const dailyRate = rMonthly / 30 / 100;
        let remaining = totalDays;
        let currentPrincipal = P;
        let totalInterestAccum = 0;
        while (remaining >= 365) {
          const blockInterest = currentPrincipal * dailyRate * 365;
          totalInterestAccum += blockInterest;
          currentPrincipal += blockInterest;
          remaining -= 365;
        }
        if (remaining > 0) {
          const remInterest = currentPrincipal * dailyRate * remaining;
          totalInterestAccum += remInterest;
        }
        interest = totalInterestAccum;
        total = P + interest;
        extra = { totalDays };
      } else {
        let monthsRemaining = monthsInfo.monthsCount;
        let currentPrincipal = P;
        let totalInterestAccum = 0;
        while (monthsRemaining >= 12) {
          const blockInterest = currentPrincipal * (rMonthly / 100) * 12;
          totalInterestAccum += blockInterest;
          currentPrincipal += blockInterest;
          monthsRemaining -= 12;
        }
        if (monthsRemaining > 0) {
          const remInterest = currentPrincipal * (rMonthly / 100) * monthsRemaining;
          totalInterestAccum += remInterest;
        }
        interest = totalInterestAccum;

        // subtract first month interest if paid
        if (paidStatus === "paid" && monthsInfo.monthsCount >= 1) {
          const firstMonthInterest = P * (rMonthly / 100);
          interest -= firstMonthInterest;
        }

        total = P + interest;
        extra = monthsInfo;
      }
    }

    const entry = {
      id: Date.now(),
      principal: round(P),
      monthlyRate: rMonthly,
      startDate,
      endDate,
      mode,
      interestType,
      paidStatus,
      interest: round(interest),
      total: round(total),
      ...extra,
    };

    setResults((prev) => [entry, ...prev]);
  }

  function deleteEntry(id) {
    setResults((prev) => prev.filter((r) => r.id !== id));
  }

  // small animation variants
  const formVariant = {
    hidden: { opacity: 0, y: -18 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.45 } },
  };
  const cardVariant = (i) => ({
    hidden: { opacity: 0, y: 18, scale: 0.98 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { delay: i * 0.07, type: "spring", stiffness: 120, damping: 14 },
    },
    exit: { opacity: 0, y: -12, transition: { duration: 0.25 } },
  });

  return (
    <div style={{ minHeight: "100vh" }} className="flex items-start justify-center p-4">
      <style>{`
        .gold-shimmer { background: linear-gradient(180deg, #070707 0%, #0d0d0d 40%); position: relative; overflow: hidden; }
        .gold-shimmer::before {
          content: "";
          position: absolute;
          left: -40%; top: -30%;
          width: 180%; height: 160%;
          background: radial-gradient(50% 50% at 50% 50%, rgba(255,208,96,0.06), rgba(255,209,96,0.02) 20%, transparent 40%),
          linear-gradient(90deg, rgba(255,215,64,0.02), rgba(255,215,64,0.04), rgba(255,215,64,0.02));
          transform: rotate(-25deg);
          animation: shimmerMove 9s linear infinite;
          pointer-events: none;
        }
        @keyframes shimmerMove { 0% { transform: translateX(-100%) rotate(-25deg); opacity: 0.7; } 50% { transform: translateX(0%) rotate(-25deg); opacity: 1; } 100% { transform: translateX(100%) rotate(-25deg); opacity: 0.7; } }
        .btn-gold { background: #ffd400; color: #000; font-weight: 700; }
        .btn-gold:hover { filter: brightness(0.95); box-shadow: 0 6px 18px rgba(255,212,68,0.14); }
        .card-glow { transition: box-shadow 0.25s ease, transform 0.18s ease; }
        .card-glow:hover { box-shadow: 0 10px 30px rgba(255,208,96,0.06), 0 2px 8px rgba(0,0,0,0.6); transform: translateY(-4px); }
        .gold-text { color: #FFD700; }
        .panel { background: #121212; border: 1px solid rgba(255,215,64,0.06); }
        .input-dark { background: #141414; color: #fff; border: 1px solid rgba(255,255,255,0.04); }
      `}</style>

      <div className="w-full max-w-3xl gold-shimmer rounded-2xl p-6">
        <motion.div variants={formVariant} initial="hidden" animate="visible">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold gold-text">{t("title")}</h1>

            {/* Language toggle top-right */}
            <div className="text-right text-xs text-gray-400 flex items-center gap-3">
              <div className="text-right">
                <div>{t("mode")}: <span className="font-medium">{t(mode)}</span></div>
                <div>{t("interestType")}: <span className="font-medium">{t(interestType)}</span></div>
              </div>

              <button
                onClick={() => setLang((s) => (s === "en" ? "te" : "en"))}
                className="ml-3 p-2 rounded-full bg-[#1a1a1a] hover:bg-[#222] transition"
                title={lang === "en" ? "Switch to Telugu" : "Switch to English"}
              >
                <Globe size={18} color="#FFD700" />
              </button>
            </div>
          </div>

          {/* Form */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 panel rounded-2xl p-4">
            <div className="flex flex-col">
              <label className="text-sm text-gray-300 mb-1">{t("principal")}</label>
              <input className="p-3 rounded input-dark" type="number" value={principal} onChange={(e) => setPrincipal(e.target.value)} placeholder="e.g., 70000" />
            </div>

            <div className="flex flex-col">
              <label className="text-sm text-gray-300 mb-1">{t("rate")}</label>
              <input className="p-3 rounded input-dark" type="number" step="0.01" value={monthlyRate} onChange={(e) => setMonthlyRate(e.target.value)} placeholder="e.g., 2.1" />
            </div>

            <div className="flex flex-col">
              <label className="text-sm text-gray-300 mb-1">{t("start")}</label>
              <input className="p-3 rounded input-dark" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>

            <div className="flex flex-col">
              <label className="text-sm text-gray-300 mb-1">{t("end")}</label>
              <input className="p-3 rounded input-dark" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </div>

            {/* Mode */}
            <div className="flex items-center gap-3 mt-2">
              <label className="text-sm text-gray-300">{t("mode")}</label>
              <select className="p-2 rounded input-dark" value={mode} onChange={(e) => setMode(e.target.value)}>
                <option value="monthly">{t("monthly")}</option>
                <option value="daily">{t("daily")}</option>
              </select>
            </div>

            {/* Paid Status visible only for monthly */}
            {mode === "monthly" && (
              <div className="flex items-center gap-3 mt-2">
                <label className="text-sm text-gray-300">{t("paidStatus")}</label>
                <select className="p-2 rounded input-dark" value={paidStatus} onChange={(e) => setPaidStatus(e.target.value)}>
                  <option value="not_paid">{t("not_paid")}</option>
                  <option value="paid">{t("paid")}</option>
                </select>
              </div>
            )}

            <div className="flex items-center gap-3 mt-2">
              <label className="text-sm text-gray-300">{t("interestType")}</label>
              <select className="p-2 rounded input-dark" value={interestType} onChange={(e) => setInterestType(e.target.value)}>
                <option value="simple">{t("simple")}</option>
                <option value="compound">{t("compound")}</option>
              </select>
            </div>

            <div className="md:col-span-2 flex justify-end mt-2">
              <motion.button whileTap={{ scale: 0.98 }} whileHover={{ scale: 1.02 }} className="btn-gold px-5 py-2 rounded-lg font-semibold" onClick={calculate}>
                {t("calc")}
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Results history */}
        <div className="mt-6">
          <AnimatePresence>
            {results.map((r, idx) => (
              <motion.div key={r.id} initial="hidden" animate="visible" exit="exit" variants={cardVariant(idx)} className="card-glow panel rounded-xl p-4 mt-4" layout>
                <div className="flex justify-between items-start">
                  <div>
                    <div className="text-lg font-semibold gold-text">₹{r.principal} @ {r.monthlyRate}%</div>
                    <div className="text-sm text-gray-400">{t(r.interestType)} • {t(r.mode)}{r.mode === "monthly" ? ` • ${t(r.paidStatus)}` : ""}</div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <button onClick={() => deleteEntry(r.id)} className="text-red-400 hover:text-red-500">
                      <Trash2 size={18} />
                    </button>
                    <div className="text-xs text-gray-400">{new Date(r.id).toLocaleString()}</div>
                  </div>
                </div>

                <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                  <div className="p-2 rounded bg-[#0f0f0f]">
                    <div className="text-gray-300 text-xs">{t("start")}</div>
                    <div className="text-white">{formatDDMMYYYY(r.startDate)}</div>
                  </div>
                  <div className="p-2 rounded bg-[#0f0f0f]">
                    <div className="text-gray-300 text-xs">{t("end")}</div>
                    <div className="text-white">{formatDDMMYYYY(r.endDate)}</div>
                  </div>
                  <div className="p-2 rounded bg-[#0f0f0f]">
                    <div className="text-gray-300 text-xs">{r.mode === "daily" ? t("days_incl") : t("months_incl")}</div>
                    <div className="text-white">{r.mode === "daily" ? (r.totalInclusive ?? r.totalDays) : (r.monthsCount ?? r.totalMonths)}</div>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between">
                  <div>
                    <div className="text-sm text-gray-300">{t("interest_label")}</div>
                    <div className="text-lg font-semibold text-green-300">₹{r.interest}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-300">{t("total_label")}</div>
                    <div className="text-lg font-semibold gold-text">₹{r.total}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}