import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2 } from "lucide-react";

/**
 * InterestCalculator.jsx
 * - Animated dark-gold UI (shimmer background)
 * - Inclusive day counting
 * - Monthly partial-month rules ( <6 days = days, 6-16 = 0.5, >16 = 1 )
 * - Simple & Compound
 * - Monthly compounding per 12 months
 * - Daily compounding per 365 days
 * - History cards with animation and delete
 * - Persists history in localStorage
 *
 * Paste this file into src/components/InterestCalculator.jsx
 */

export default function InterestCalculator() {
  const [principal, setPrincipal] = useState("");
  const [monthlyRate, setMonthlyRate] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [mode, setMode] = useState("monthly"); // 'monthly' | 'daily'
  const [interestType, setInterestType] = useState("simple"); // 'simple' | 'compound'
  const [results, setResults] = useState([]);

  // Load history from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem("goldcalc_history");
      if (raw) setResults(JSON.parse(raw));
    } catch {}
  }, []);

  // Save history on change
  useEffect(() => {
    try {
      localStorage.setItem("goldcalc_history", JSON.stringify(results));
    } catch {}
  }, [results]);

  // Helpers: inclusive days between two ISO dates (YYYY-MM-DD)
  function inclusiveDaysBetween(startISO, endISO) {
    const s = new Date(startISO + "T00:00:00");
    const e = new Date(endISO + "T00:00:00");
    return Math.floor((e - s) / (1000 * 60 * 60 * 24)) + 1;
  }

  // Count months + remaining days using user's rules (safe addOneMonth)
  function getMonthsCount(startISO, endISO) {
    const start = new Date(startISO + "T00:00:00");
    const end = new Date(endISO + "T00:00:00");
    if (end < start) return { error: "invalid-range" };

    function addOneMonth(d) {
      const y = d.getFullYear();
      const m = d.getMonth();
      const day = d.getDate();
      // go to same day next month; if overflow, clamp to last day
      const next = new Date(y, m + 1, day);
      if (next.getDate() !== day) {
        // overflowed — clamp to last day of previous month
        next.setDate(0);
      }
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
    if (remainingDays < 6) {
      partialRule = "days";
    } else if (remainingDays >= 6 && remainingDays <= 16) {
      monthsCount += 0.5;
      partialRule = "half";
    } else {
      monthsCount += 1;
      partialRule = "full";
    }

    return {
      fullMonths,
      remainingDays,
      daysCovered,
      totalInclusive,
      monthsCount,
      partialRule,
    };
  }

  // rounding helper
  function round(n, digits = 2) {
    const m = Math.pow(10, digits);
    return Math.round(n * m) / m;
  }

  // Core calculate
  function calculate() {
    if (!principal || !monthlyRate || !startDate || !endDate) {
      alert("Please fill all fields");
      return;
    }

    const P = Number(principal);
    const rMonthly = Number(monthlyRate);
    if (isNaN(P) || P <= 0) {
      alert("Enter valid principal");
      return;
    }
    if (isNaN(rMonthly) || rMonthly <= 0) {
      alert("Enter valid monthly rate");
      return;
    }

    // compute
    const totalDays = inclusiveDaysBetween(startDate, endDate);
    const monthsInfo = getMonthsCount(startDate, endDate);

    let interest = 0;
    let total = 0;
    let extra = {};

    if (interestType === "simple") {
      if (mode === "daily") {
        const dailyRate = rMonthly / 30 / 100; // fraction
        interest = P * dailyRate * totalDays;
        total = P + interest;
        extra = { totalDays };
      } else {
        // monthly simple
        if (monthsInfo.partialRule === "days") {
          const dailyRate = rMonthly / 30 / 100;
          const dayInterest = P * dailyRate * monthsInfo.remainingDays;
          const monthsInterest = P * (rMonthly / 100) * monthsInfo.fullMonths;
          interest = monthsInterest + dayInterest;
        } else {
          interest = P * (rMonthly / 100) * monthsInfo.monthsCount;
        }
        total = P + interest;
        extra = monthsInfo;
      }
    } else {
      // compound
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
        // monthly compounding per 12 months
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
      interest: round(interest),
      total: round(total),
      ...extra,
    };

    setResults((prev) => [entry, ...prev]);
  }

  function deleteEntry(id) {
    setResults((prev) => prev.filter((r) => r.id !== id));
  }

  // Small animation variants
  const formVariant = {
    hidden: { opacity: 0, y: -18 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" } },
  };
  const cardVariant = (i) => ({
    hidden: { opacity: 0, y: 18, scale: 0.98 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { delay: i * 0.07, type: "spring", stiffness: 120, damping: 14 } },
    exit: { opacity: 0, y: -12, transition: { duration: 0.25 } },
  });

  return (
    <div style={{ minHeight: "100vh" }} className="flex items-start justify-center p-4">
      {/* Inline style-containing block for keyframes — ensures shimmer works without extra CSS files */}
      <style>{`
        .gold-shimmer {
          background: linear-gradient(180deg, #070707 0%, #0d0d0d 40%);
          position: relative;
          overflow: hidden;
        }
        .gold-shimmer::before {
          content: "";
          position: absolute;
          left: -40%;
          top: -30%;
          width: 180%;
          height: 160%;
          background: radial-gradient(50% 50% at 50% 50%, rgba(255,208,96,0.06), rgba(255,209,96,0.02) 20%, transparent 40%), linear-gradient(90deg, rgba(255,215,64,0.02), rgba(255,215,64,0.04), rgba(255,215,64,0.02));
          transform: rotate(-25deg);
          animation: shimmerMove 9s linear infinite;
          pointer-events: none;
        }
        @keyframes shimmerMove {
          0% { transform: translateX(-100%) rotate(-25deg); opacity: 0.7; }
          50% { transform: translateX(0%) rotate(-25deg); opacity: 1; }
          100% { transform: translateX(100%) rotate(-25deg); opacity: 0.7; }
        }

        .btn-gold {
          background: #ffd400;
          color: #000;
          font-weight: 700;
        }
        .btn-gold:hover {
          filter: brightness(0.95);
          box-shadow: 0 6px 18px rgba(255,212,68,0.14);
        }
        .btn-gold:active {
          transform: translateY(1px);
        }

        .card-glow {
          transition: box-shadow 0.25s ease, transform 0.18s ease;
        }
        .card-glow:hover {
          box-shadow: 0 10px 30px rgba(255, 208, 96, 0.06), 0 2px 8px rgba(0,0,0,0.6);
          transform: translateY(-4px);
        }

        .gold-text { color: #FFD700; }
        .panel { background: #121212; border: 1px solid rgba(255,215,64,0.06); }
        .input-dark { background: #141414; color: #fff; border: 1px solid rgba(255,255,255,0.04); }
      `}</style>

      <div className="w-full max-w-3xl gold-shimmer rounded-2xl p-6">
        <motion.div variants={formVariant} initial="hidden" animate="visible">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold gold-text">Gold Loan Interest Calculator</h1>
            <div className="text-right text-xs text-gray-400">
              <div>Mode: <span className="ml-1 font-medium">{mode}</span></div>
              <div>Type: <span className="ml-1 font-medium">{interestType}</span></div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 panel rounded-2xl p-4">
            <div className="flex flex-col">
              <label className="text-sm text-gray-300 mb-1">Principal (₹)</label>
              <input className="p-3 rounded input-dark" type="number" value={principal} onChange={(e) => setPrincipal(e.target.value)} placeholder="e.g., 70000" />
            </div>

            <div className="flex flex-col">
              <label className="text-sm text-gray-300 mb-1">Monthly Rate (%)</label>
              <input className="p-3 rounded input-dark" type="number" step="0.01" value={monthlyRate} onChange={(e) => setMonthlyRate(e.target.value)} placeholder="e.g., 2.1" />
            </div>

            <div className="flex flex-col">
              <label className="text-sm text-gray-300 mb-1">Start Date</label>
              <input className="p-3 rounded input-dark" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>

            <div className="flex flex-col">
              <label className="text-sm text-gray-300 mb-1">End Date</label>
              <input className="p-3 rounded input-dark" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </div>

            <div className="flex items-center gap-3 mt-2">
              <label className="text-sm text-gray-300">Mode</label>
              <select className="p-2 rounded input-dark" value={mode} onChange={(e) => setMode(e.target.value)}>
                <option value="monthly">Monthly</option>
                <option value="daily">Daily</option>
              </select>
            </div>

            <div className="flex items-center gap-3 mt-2">
              <label className="text-sm text-gray-300">Interest</label>
              <select className="p-2 rounded input-dark" value={interestType} onChange={(e) => setInterestType(e.target.value)}>
                <option value="simple">Simple</option>
                <option value="compound">Compound</option>
              </select>
            </div>

            <div className="md:col-span-2 flex justify-end mt-2">
              <motion.button
                whileTap={{ scale: 0.98 }}
                whileHover={{ scale: 1.02 }}
                className="btn-gold px-5 py-2 rounded-lg font-semibold"
                onClick={calculate}
              >
                Calculate
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Results history */}
        <div className="mt-6">
          <AnimatePresence>
            {results.map((r, idx) => (
              <motion.div
                key={r.id}
                initial="hidden"
                animate="visible"
                exit="exit"
                variants={cardVariant(idx)}
                className="card-glow panel rounded-xl p-4 mt-4"
                layout
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="text-lg font-semibold gold-text">₹{r.principal} @ {r.monthlyRate}%</div>
                    <div className="text-sm text-gray-400"> {r.interestType} • {r.mode}</div>
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
                    <div className="text-gray-300 text-xs">Start Date</div>
                    <div className="text-white">
  {new Date(r.startDate).toLocaleDateString('en-GB').replace(/\//g, '-')}
</div>
                  </div>
                  <div className="p-2 rounded bg-[#0f0f0f]">
                    <div className="text-gray-300 text-xs">End Date</div>
                    <div className="text-white">
  {new Date(r.endDate).toLocaleDateString('en-GB').replace(/\//g, '-')}
</div>
                  </div>
                  <div className="p-2 rounded bg-[#0f0f0f]">
                    <div className="text-gray-300 text-xs">{r.mode === "daily" ? "Days (incl.)" : "Months (incl.)"}</div>
                    <div className="text-white">
                      {r.mode === "daily" ? r.totalInclusive ?? r.totalDays : r.monthsCount ?? r.totalMonths}
                    </div>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between">
                  <div>
                    <div className="text-sm text-gray-300">Interest</div>
                    <div className="text-lg font-semibold text-green-300">₹{r.interest}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-300">Total (P+I)</div>
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