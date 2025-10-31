import React, { useState } from "react";
import { motion } from "framer-motion";

const translations = {
  en: {
    title: "Gold Loan Interest Calculator",
    principal: "Principal Amount",
    rate: "Interest Rate (%)",
    startDate: "Start Date",
    endDate: "End Date",
    mode: "Interest Mode",
    simple: "Simple",
    compound: "Compound",
    calculate: "Calculate",
    clear: "Clear",
    result: "Result",
    total: "Total Amount",
  },
  te: {
    title: "బంగారు లోన్ వడ్డీ లెక్కింపు",
    principal: "మూలధనం",
    rate: "వడ్డీ రేటు (%)",
    startDate: "ప్రారంభ తేదీ",
    endDate: "ముగింపు తేదీ",
    mode: "వడ్డీ విధానం",
    simple: "సాధారణ",
    compound: "చక్ర",
    calculate: "లెక్కించు",
    clear: "తొలగించు",
    result: "ఫలితం",
    total: "మొత్తం మొత్తం",
  },
};

export default function App() {
  const [language, setLanguage] = useState("en");
  const [principal, setPrincipal] = useState("");
  const [rate, setRate] = useState("");
  const [mode, setMode] = useState("simple");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [result, setResult] = useState(null);

  const t = translations[language];

  const toggleLanguage = () => {
    setLanguage(language === "en" ? "te" : "en");
  };

  const calculateInterest = () => {
    if (!principal || !rate || !startDate || !endDate) return;
    const sDate = new Date(startDate);
    const eDate = new Date(endDate);
    const diffDays = Math.floor(
      (eDate.getTime() - sDate.getTime()) / (1000 * 60 * 60 * 24)
    ) + 1;

    const timeYears = diffDays / 365;
    let interest = 0;

    if (mode === "simple") {
      interest = (principal * rate * timeYears) / 100;
    } else {
      const n = 12;
      const r = rate / 100;
      interest = principal * Math.pow(1 + r / n, n * timeYears) - principal;
    }

    setResult({
      interest: interest.toFixed(2),
      total: (parseFloat(principal) + interest).toFixed(2),
    });
  };

  const clearAll = () => {
    setPrincipal("");
    setRate("");
    setStartDate("");
    setEndDate("");
    setResult(null);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 to-black text-white p-6">
      {/* 🌐 Language Toggle */}
      <button
        onClick={toggleLanguage}
        className="absolute top-5 right-5 text-xl bg-gray-800 px-3 py-2 rounded-full shadow-md hover:scale-105 transition"
      >
        🌐 {language === "en" ? "EN" : "TE"}
      </button>

      <motion.h1
        className="text-2xl md:text-3xl font-bold mb-6 text-yellow-400 text-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {t.title}
      </motion.h1>

      <div className="bg-gray-800 p-6 rounded-2xl shadow-lg w-full max-w-md space-y-4">
        <div>
          <label>{t.principal}</label>
          <input
            type="number"
            value={principal}
            onChange={(e) => setPrincipal(e.target.value)}
            className="w-full mt-1 p-2 rounded bg-gray-700 focus:outline-none"
          />
        </div>
        <div>
          <label>{t.rate}</label>
          <input
            type="number"
            value={rate}
            onChange={(e) => setRate(e.target.value)}
            className="w-full mt-1 p-2 rounded bg-gray-700 focus:outline-none"
          />
        </div>
        <div>
          <label>{t.startDate}</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full mt-1 p-2 rounded bg-gray-700 focus:outline-none"
          />
        </div>
        <div>
          <label>{t.endDate}</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full mt-1 p-2 rounded bg-gray-700 focus:outline-none"
          />
        </div>

        {/* Mode Toggle */}
        <div className="flex items-center justify-between mt-3">
          <span>{t.mode}</span>
          <div className="flex gap-2">
            <button
              onClick={() => setMode("simple")}
              className={`px-3 py-1 rounded-full ${
                mode === "simple" ? "bg-yellow-500" : "bg-gray-700"
              }`}
            >
              {t.simple}
            </button>
            <button
              onClick={() => setMode("compound")}
              className={`px-3 py-1 rounded-full ${
                mode === "compound" ? "bg-yellow-500" : "bg-gray-700"
              }`}
            >
              {t.compound}
            </button>
          </div>
        </div>

        <div className="flex justify-between mt-4">
          <button
            onClick={calculateInterest}
            className="bg-yellow-500 text-black px-4 py-2 rounded-lg font-semibold"
          >
            {t.calculate}
          </button>
          <button
            onClick={clearAll}
            className="bg-gray-600 px-4 py-2 rounded-lg font-semibold"
          >
            {t.clear}
          </button>
        </div>

        {result && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-4 bg-gray-900 p-4 rounded-lg text-sm space-y-2"
          >
            <div>
              <strong>{t.result}:</strong> ₹{result.interest}
            </div>
            <div>
              <strong>{t.total}:</strong> ₹{result.total}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}