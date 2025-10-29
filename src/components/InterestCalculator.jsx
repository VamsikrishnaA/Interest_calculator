import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2 } from "lucide-react";

export default function InterestCalculator() {
  const [principal, setPrincipal] = useState("");
  const [monthlyRate, setMonthlyRate] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [mode, setMode] = useState("monthly");
  const [interestType, setInterestType] = useState("simple");
  const [results, setResults] = useState([]);

  useEffect(() => {
    const raw = localStorage.getItem("goldcalc_history");
    if (raw) setResults(JSON.parse(raw));
  }, []);

  useEffect(() => {
    localStorage.setItem("goldcalc_history", JSON.stringify(results));
  }, [results]);

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
      const next = new Date(d.getFullYear(), d.getMonth() + 1, d.getDate());
      if (next.getDate() !== d.getDate()) next.setDate(0);
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
    else if (remainingDays <= 16) {
      monthsCount += 0.5;
      partialRule = "half";
    } else {
      monthsCount += 1;
      partialRule = "full";
    }

    return { fullMonths, remainingDays, totalInclusive, monthsCount, partialRule };
  }

  function round(n, d = 2) {
    const m = Math.pow(10, d);
    return Math.round(n * m) / m;
  }

  function calculate() {
    if (!principal || !monthlyRate || !startDate || !endDate) {
      alert("Please fill all fields");
      return;
    }

    const P = Number(principal);
    const rMonthly = Number(monthlyRate);
    const totalDays = inclusiveDaysBetween(startDate, endDate);
    const monthsInfo = getMonthsCount(startDate, endDate);

    let interest = 0,
      total = 0,
      extra = {};

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
        total = P + interest;
        extra = monthsInfo;
      }
    } else {
      if (mode === "daily") {
        const dailyRate = rMonthly / 30 / 100;
        let remaining = totalDays,
          current = P,
          totalInterest = 0;
        while (remaining >= 365) {
          const block = current * dailyRate * 365;
          totalInterest += block;
          current += block;
          remaining -= 365;
        }
        if (remaining > 0) totalInterest += current * dailyRate * remaining;
        interest = totalInterest;
        total = P + interest;
        extra = { totalDays };
      } else {
        let remaining = monthsInfo.monthsCount,
          current = P,
          totalInterest = 0;
        while (remaining >= 12) {
          const block = current * (rMonthly / 100) * 12;
          totalInterest += block;
          current += block;
          remaining -= 12;
        }
        if (remaining > 0) totalInterest += current * (rMonthly / 100) * remaining;
        interest = totalInterest;
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

  const formatDate = (iso) => {
    const d = new Date(iso);
    return `${String(d.getDate()).padStart(2, "0")}-${String(d.getMonth() + 1).padStart(2, "0")}-${d.getFullYear()}`;
  };

  const formVariant = {
    hidden: { opacity: 0, y: -18 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" } },
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
    <div className="flex items-start justify-center p-4" style={{ minHeight: "100vh" }}>
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
          background: radial-gradient(50% 50% at 50% 50%, rgba(255,208,96,0.06), rgba(255,209,96,0.02) 20%, transparent 40%),
                      linear-gradient(90deg, rgba(255,215,64,0.02), rgba(255,215,64,0.04), rgba(255,215,64,0.02));
          transform: rotate(-25deg);
          animation: shimmerMove 9s linear infinite;
        }
        @keyframes shimmerMove {
          0% { transform: translateX(-100%) rotate(-25deg); opacity: 0.7; }
          50% { transform: translateX(0%) rotate(-25deg); opacity: 1; }
          100% { transform: translateX(100%) rotate(-25deg); opacity: 0.7; }
        }
        .toggle {
          background: #141414;
          border: 1px solid rgba(255,215,64,0.15);
          border-radius: 9999px;
          width: 90px;
          height: 36px;
          position: relative;
          cursor: pointer;
          overflow: hidden;
        }
        .toggle-ball {
          background: #ffd400;
          width: 44px;
          height: 32px;
          border-radius: 9999px;
          position: absolute;
          top: 1px;
          transition: all 0.3s ease;
        }
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
              <input className="p-3 rounded input-dark" type="number" value={principal} onChange={(e) => setPrincipal(e.target.value)} />
            </div>

            <div className="flex flex-col">
              <label className="text-sm text-gray-300 mb-1">Monthly Rate (%)</label>
              <input className="p-3 rounded input-dark" type="number" value={monthlyRate} onChange={(e) => setMonthlyRate(e.target.value)} />
            </div>

            <div className="flex flex-col">
              <label className="text-sm text-gray-300 mb-1">Start Date</label>
              <input className="p-3 rounded input-dark" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>

            <div className="flex flex-col">
              <label className="text-sm text-gray-300 mb-1">End Date</label>
              <input className="p-3 rounded input-dark" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </div>

            {/* Animated Toggles */}
            <div className="flex items-center gap-3 mt-2">
              <label className="text-sm text-gray-300">Mode</label>
              <div className="toggle" onClick={() => setMode(mode === "monthly" ? "daily" : "monthly")}>
                <motion.div
                  className="toggle-ball flex items-center justify-center text-xs font-bold"
                  animate={{ x: mode === "monthly" ? 0 : 46 }}
                  transition={{ type: "spring", stiffness: 200, damping: 18 }}
                >
                  {mode === "monthly" ? "M" : "D"}
                </motion.div>
              </div>
            </div>

            <div className="flex items-center gap-3 mt-2">
              <label className="text-sm text-gray-300">Interest</label>
              <div className="toggle" onClick={() => setInterestType(interestType === "simple" ? "compound" : "simple")}>
                <motion.div
                  className="toggle-ball flex items-center justify-center text-xs font-bold"
                  animate={{ x: interestType === "simple" ? 0 : 46 }}
                  transition={{ type: "spring", stiffness: 200, damping: 18 }}
                >
                  {interestType === "simple" ? "S" : "C"}
                </motion.div>
              </div>
            </div>

            <div className="md:col-span-2 flex justify-end mt-2">
              <motion.button whileTap={{ scale: 0.98 }} whileHover={{ scale: 1.02 }} className="btn-gold px-5 py-2 rounded-lg font-semibold" onClick={calculate}>
                Calculate
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Results */}
        <div className="mt-6">
          <AnimatePresence>
            {results.map((r, idx) => (
              <motion.div key={r.id} initial="hidden" animate="visible" exit="exit" variants={cardVariant(idx)} className="card-glow panel rounded-xl p-4 mt-4">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="text-lg font-semibold gold-text">₹{r.principal} @ {r.monthlyRate}%</div>
                    <div className="text-sm text-gray-400">{r.interestType} • {r.mode}</div>
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
                    <div className="text-gray-300 text-xs">Start</div>
                    <div className="text-white">{formatDate(r.startDate)}</div>
                  </div>
                  <div className="p-2 rounded bg-[#0f0f0f]">
                    <div className="text-gray-300 text-xs">End</div>
                    <div className="text-white">{formatDate(r.endDate)}</div>
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