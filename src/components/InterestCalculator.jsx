import React, { useState, useEffect } from "react";
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

  // Translation dictionary
  const dict = {
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
      total_label: "Total (P + I)",
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
  const t = (k) => dict[lang][k] ?? k;

  // History save/load
  useEffect(() => {
    const raw = localStorage.getItem("goldcalc_history");
    if (raw) setResults(JSON.parse(raw));
  }, []);
  useEffect(() => {
    localStorage.setItem("goldcalc_history", JSON.stringify(results));
  }, [results]);

  // Helpers
  const inclusiveDays = (s, e) => {
    const start = new Date(s);
    const end = new Date(e);
    return Math.floor((end - start) / (1000 * 60 * 60 * 24)) + 1;
  };
  const round = (n, d = 2) => Math.round(n * 10 ** d) / 10 ** d;
  const formatDate = (iso) => {
    const d = new Date(iso);
    return `${String(d.getDate()).padStart(2, "0")}-${String(
      d.getMonth() + 1
    ).padStart(2, "0")}-${d.getFullYear()}`;
  };

  // Month counting logic (your custom rule)
  const getMonthsCount = (start, end) => {
    const s = new Date(start);
    const e = new Date(end);
    let months = 0;
    let temp = new Date(s);
    while (true) {
      const next = new Date(temp);
      next.setMonth(next.getMonth() + 1);
      if (next <= e) {
        months++;
        temp = next;
      } else break;
    }
    const totalDays = inclusiveDays(start, end);
    const covered = inclusiveDays(start, temp.toISOString().split("T")[0]);
    const remaining = totalDays - covered;
    let monthsCount = months;
    if (remaining < 6) monthsCount += 0;
    else if (remaining <= 16) monthsCount += 0.5;
    else monthsCount += 1;
    return { monthsCount, totalDays };
  };

  // Main calculation
  const calculate = () => {
    if (!principal || !monthlyRate || !startDate || !endDate) return;
    const P = Number(principal);
    const r = Number(monthlyRate);
    const { monthsCount, totalDays } = getMonthsCount(startDate, endDate);
    let interest = 0,
      total = 0;

    if (interestType === "simple") {
      if (mode === "daily") {
        const dRate = r / 30 / 100;
        interest = P * dRate * totalDays;
      } else {
        interest = P * (r / 100) * monthsCount;
      }
      if (paidStatus === "paid" && mode === "monthly" && monthsCount >= 1)
        interest -= P * (r / 100);
      total = P + interest;
    } else {
      if (mode === "daily") {
        const dRate = r / 30 / 100;
        let rem = totalDays,
          curP = P,
          totInt = 0;
        while (rem >= 365) {
          const block = curP * dRate * 365;
          totInt += block;
          curP += block;
          rem -= 365;
        }
        if (rem > 0) totInt += curP * dRate * rem;
        interest = totInt;
      } else {
        let rem = monthsCount,
          curP = P,
          totInt = 0;
        while (rem >= 12) {
          const block = curP * (r / 100) * 12;
          totInt += block;
          curP += block;
          rem -= 12;
        }
        if (rem > 0) totInt += curP * (r / 100) * rem;
        interest = totInt;
      }
      if (paidStatus === "paid" && mode === "monthly" && monthsCount >= 1)
        interest -= P * (r / 100);
      total = P + interest;
    }

    setResults((prev) => [
      {
        id: Date.now(),
        principal: round(P),
        monthlyRate: r,
        startDate,
        endDate,
        mode,
        interestType,
        paidStatus,
        interest: round(interest),
        total: round(total),
        monthsCount,
        totalDays,
      },
      ...prev,
    ]);
  };

  const del = (id) => setResults((p) => p.filter((x) => x.id !== id));

  const formAnim = {
    hidden: { opacity: 0, y: -15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };
  const cardAnim = (i) => ({
    hidden: { opacity: 0, y: 15 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.05, type: "spring", stiffness: 120 },
    },
    exit: { opacity: 0, y: -10, transition: { duration: 0.25 } },
  });

  return (
    <div className="min-h-screen flex justify-center items-start p-4 bg-[#0a0a0a] text-white">
      <style>{`
        .panel { background:#121212; border:1px solid rgba(255,215,64,0.05);}
        .input-dark {background:#141414;border:1px solid rgba(255,255,255,0.1);color:#fff;}
        .btn-gold {background:#ffd400;color:#000;font-weight:700;}
        .btn-gold:hover {filter:brightness(0.95);}
        .gold-text{color:#ffd700;}
      `}</style>

      <div className="w-full max-w-3xl panel rounded-2xl p-6">
        <motion.div variants={formAnim} initial="hidden" animate="visible">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold gold-text">{t("title")}</h1>
            <button
              className="p-2 rounded-full bg-[#1c1c1c]"
              onClick={() => setLang((l) => (l === "en" ? "te" : "en"))}
              title={lang === "en" ? "Switch to Telugu" : "Switch to English"}
            >
              <Globe size={18} color="#ffd700" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label>{t("principal")}</label>
              <input
                type="number"
                className="w-full p-2 rounded input-dark"
                value={principal}
                onChange={(e) => setPrincipal(e.target.value)}
              />
            </div>
            <div>
              <label>{t("rate")}</label>
              <input
                type="number"
                className="w-full p-2 rounded input-dark"
                value={monthlyRate}
                onChange={(e) => setMonthlyRate(e.target.value)}
              />
            </div>
            <div>
              <label>{t("start")}</label>
              <input
                type="date"
                className="w-full p-2 rounded input-dark"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div>
              <label>{t("end")}</label>
              <input
                type="date"
                className="w-full p-2 rounded input-dark"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>

            <div>
              <label>{t("mode")}</label>
              <select
                value={mode}
                className="w-full p-2 rounded input-dark"
                onChange={(e) => setMode(e.target.value)}
              >
                <option value="monthly">{t("monthly")}</option>
                <option value="daily">{t("daily")}</option>
              </select>
            </div>

            {mode === "monthly" && (
              <div>
                <label>{t("paidStatus")}</label>
                <select
                  value={paidStatus}
                  className="w-full p-2 rounded input-dark"
                  onChange={(e) => setPaidStatus(e.target.value)}
                >
                  <option value="not_paid">{t("not_paid")}</option>
                  <option value="paid">{t("paid")}</option>
                </select>
              </div>
            )}

            <div>
              <label>{t("interestType")}</label>
              <select
                value={interestType}
                className="w-full p-2 rounded input-dark"
                onChange={(e) => setInterestType(e.target.value)}
              >
                <option value="simple">{t("simple")}</option>
                <option value="compound">{t("compound")}</option>
              </select>
            </div>

            <div className="md:col-span-2 flex justify-end">
              <motion.button
                whileTap={{ scale: 0.96 }}
                className="btn-gold px-6 py-2 rounded mt-2"
                onClick={calculate}
              >
                {t("calc")}
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Result history */}
        <div className="mt-6">
          <AnimatePresence>
            {results.map((r, i) => (
              <motion.div
                key={r.id}
                variants={cardAnim(i)}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="panel rounded-xl p-4 mb-3"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="text-lg gold-text">
                      ₹{r.principal} @ {r.monthlyRate}%
                    </div>
                    <div className="text-xs text-gray-400">
                      {t(r.interestType)} • {t(r.mode)}{" "}
                      {r.mode === "monthly" ? `• ${t(r.paidStatus)}` : ""}
                    </div>
                  </div>
                  <button onClick={() => del(r.id)}>
                    <Trash2 size={18} color="#ff6666" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3 text-sm">
                  <div>
                    <div className="text-gray-400">{t("start")}</div>
                    <div>{formatDate(r.startDate)}</div>
                  </div>
                  <div>
                    <div className="text-gray-400">{t("end")}</div>
                    <div>{formatDate(r.endDate)}</div>
                  </div>
                  <div>
                    <div className="text-gray-400">
                      {r.mode === "daily" ? t("days_incl") : t("months_incl")}
                    </div>
                    <div>
                      {r.mode === "daily"
                        ? r.totalDays
                        : r.monthsCount.toFixed(2)}
                    </div>
                  </div>
                </div>

                <div className="flex justify-between mt-3">
                  <div>
                    <div className="text-gray-400">{t("interest_label")}</div>
                    <div className="text-green-400">₹{r.interest}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-gray-400">{t("total_label")}</div>
                    <div className="text-yellow-400 font-semibold">
                      ₹{r.total}
                    </div>
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