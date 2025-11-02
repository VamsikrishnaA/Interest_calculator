import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, Globe } from "lucide-react";

export default function InterestCalculator() {
  const [principal, setPrincipal] = useState("");
  const [monthlyRate, setMonthlyRate] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [mode, setMode] = useState("monthly");
  const [interestType, setInterestType] = useState("simple");
  const [paidStatus, setPaidStatus] = useState("not_paid");
  const [results, setResults] = useState([]);
  const [lang, setLang] = useState("en");

  // language dictionary
  const t = (key) => {
    const dict = {
      en: {
        title: "Gold Loan Interest Calculator",
        principal: "Principal (₹)",
        rate: "Monthly Rate (%)",
        start: "Start Date",
        end: "End Date",
        mode: "Mode",
        paid: "Paid Status",
        interest: "Interest Type",
        calc: "Calculate",
        not_paid: "Not Paid",
        paid_status: "Paid",
        monthly: "Monthly",
        daily: "Daily",
        simple: "Simple",
        compound: "Compound",
        interest_label: "Interest",
        total_label: "Total (P+I)",
        months: "Months (incl.)",
        days: "Days (incl.)",
      },
      te: {
        title: "బంగారు లోన్ వడ్డీ లెక్కింపు",
        principal: "మూలధనం (₹)",
        rate: "మాస వడ్డీ (%)",
        start: "ప్రారంభ తేది",
        end: "ముగింపు తేది",
        mode: "మోడ్",
        paid: "చెల్లింపు స్థితి",
        interest: "వడ్డీ రకం",
        calc: "లెక్కించు",
        not_paid: "చెల్లించలేదు",
        paid_status: "చెల్లించబడింది",
        monthly: "మాసవారీ",
        daily: "దినవారీ",
        simple: "సాధారణ",
        compound: "సంక్లిష్ట",
        interest_label: "వడ్డీ",
        total_label: "మొత్తం (మూలధనం + వడ్డీ)",
        months: "మాసాలు (సహా)",
        days: "రోజులు (సహా)",
      },
    };
    return dict[lang][key] || key;
  };

  useEffect(() => {
    try {
      const raw = localStorage.getItem("goldcalc_history");
      if (raw) setResults(JSON.parse(raw));
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("goldcalc_history", JSON.stringify(results));
    } catch {}
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
      const y = d.getFullYear();
      const m = d.getMonth();
      const day = d.getDate();
      const next = new Date(y, m + 1, day);
      if (next.getDate() !== day) next.setDate(0);
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

  function calculate() {
    if (!principal || !monthlyRate || !startDate || !endDate) {
      alert("Please fill all fields");
      return;
    }

    const P = Number(principal);
    const rMonthly = Number(monthlyRate);
    if (isNaN(P) || P <= 0 || isNaN(rMonthly) || rMonthly <= 0) {
      alert("Enter valid inputs");
      return;
    }

    const totalDays = inclusiveDaysBetween(startDate, endDate);
    const monthsInfo = getMonthsCount(startDate, endDate);

    let interest = 0;
    let total = 0;
    let extra = {};

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

        if (paidStatus === "paid" && monthsInfo.monthsCount >= 1) {
          const firstMonthInterest = P * (rMonthly / 100);
          interest -= firstMonthInterest;
        }

        total = P + interest;
        extra = monthsInfo;
      }
    } else {
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

  return (
    <div className="flex items-start justify-center p-4 min-h-screen">
      <style>{`
        .gold-shimmer { background: linear-gradient(180deg, #070707 0%, #0d0d0d 40%); position: relative; overflow: hidden; }
        .gold-shimmer::before {
          content: ""; position: absolute; left: -40%; top: -30%; width: 180%; height: 160%;
          background: radial-gradient(50% 50% at 50% 50%, rgba(255,208,96,0.06), rgba(255,209,96,0.02) 20%, transparent 40%),
          linear-gradient(90deg, rgba(255,215,64,0.02), rgba(255,215,64,0.04), rgba(255,215,64,0.02));
          transform: rotate(-25deg); animation: shimmerMove 9s linear infinite; pointer-events: none;
        }
        @keyframes shimmerMove {
          0% { transform: translateX(-100%) rotate(-25deg); opacity: 0.7; }
          50% { transform: translateX(0%) rotate(-25deg); opacity: 1; }
          100% { transform: translateX(100%) rotate(-25deg); opacity: 0.7; }
        }
        .btn-gold { background: #ffd400; color: #000; font-weight: 700; }
        .input-dark { background: #141414; color: #fff; border: 1px solid rgba(255,255,255,0.04); }
        .gold-text { color: #FFD700; }
      `}</style>

      <div className="w-full max-w-3xl gold-shimmer rounded-2xl p-6 relative">
        {/* Language Toggle */}
        <button
          onClick={() => setLang(lang === "en" ? "te" : "en")}
          className="absolute top-4 right-4 text-gray-300 hover:text-yellow-400 transition"
        >
          <Globe size={20} />
        </button>

        <h1 className="text-2xl font-bold gold-text mb-4">{t("title")}</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-gray-300">{t("principal")}</label>
            <input className="input-dark w-full p-2 rounded" type="number" value={principal} onChange={(e) => setPrincipal(e.target.value)} />
          </div>
          <div>
            <label className="text-sm text-gray-300">{t("rate")}</label>
            <input className="input-dark w-full p-2 rounded" type="number" value={monthlyRate} onChange={(e) => setMonthlyRate(e.target.value)} />
          </div>
          <div>
            <label className="text-sm text-gray-300">{t("start")}</label>
            <input className="input-dark w-full p-2 rounded" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          </div>
          <div>
            <label className="text-sm text-gray-300">{t("end")}</label>
            <input className="input-dark w-full p-2 rounded" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          </div>

          <div>
            <label className="text-sm text-gray-300">{t("mode")}</label>
            <select className="input-dark w-full p-2 rounded" value={mode} onChange={(e) => setMode(e.target.value)}>
              <option value="monthly">{t("monthly")}</option>
              <option value="daily">{t("daily")}</option>
            </select>
          </div>

          {mode === "monthly" && (
            <div>
              <label className="text-sm text-gray-300">{t("paid")}</label>
              <select className="input-dark w-full p-2 rounded" value={paidStatus} onChange={(e) => setPaidStatus(e.target.value)}>
                <option value="not_paid">{t("not_paid")}</option>
                <option value="paid">{t("paid_status")}</option>
              </select>
            </div>
          )}

          <div>
            <label className="text-sm text-gray-300">{t("interest")}</label>
            <select className="input-dark w-full p-2 rounded" value={interestType} onChange={(e) => setInterestType(e.target.value)}>
              <option value="simple">{t("simple")}</option>
              <option value="compound">{t("compound")}</option>
            </select>
          </div>

          <div className="md:col-span-2 text-right">
            <button className="btn-gold px-4 py-2 rounded mt-2" onClick={calculate}>
              {t("calc")}
            </button>
          </div>
        </div>

        {/* Results */}
        <div className="mt-6">
          <AnimatePresence>
            {results.map((r) => (
              <motion.div
                key={r.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-[#111] border border-[#222] rounded-xl p-4 mt-4"
              >
                <div className="flex justify-between">
                  <div className="gold-text font-semibold">
                    ₹{r.principal} @ {r.monthlyRate}%
                  </div>
                  <button onClick={() => deleteEntry(r.id)} className="text-red-400 hover:text-red-500">
                    <Trash2 size={16} />
                  </button>
                </div>

                <div className="text-sm text-gray-400 mt-1">
                  {t(r.interestType)} • {t(r.mode)} • {r.mode === "monthly" ? t(r.paidStatus) : ""}
                </div>

                <div className="grid grid-cols-3 text-sm mt-2">
                  <div>
                    <div className="text-gray-400 text-xs">{t("start")}</div>
                    <div>{r.startDate}</div>
                  </div>
                  <div>
                    <div className="text-gray-400 text-xs">{t("end")}</div>
                    <div>{r.endDate}</div>
                  </div>
                  <div>
                    <div className="text-gray-400 text-xs">
                      {r.mode === "daily" ? t("days") : t("months")}
                    </div>
                    <div>{r.mode === "daily" ? r.totalInclusive : r.monthsCount}</div>
                  </div>
                </div>

                <div className="flex justify-between items-center mt-3">
                  <div>
                    <div className="text-gray-400 text-xs">{t("interest_label")}</div>
                    <div className="text-green-300 font-semibold">₹{r.interest}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-gray-400 text-xs">{t("total_label")}</div>
                    <div className="gold-text font-semibold">₹{r.total}</div>
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