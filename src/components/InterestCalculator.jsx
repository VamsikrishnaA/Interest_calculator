import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Calculator, Calendar, Trash2, FileDown, Globe } from "lucide-react";

export default function GoldLoanCalculator() {
  const [principal, setPrincipal] = useState("");
  const [interestRate, setInterestRate] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [interestType, setInterestType] = useState("simple");
  const [isTelugu, setIsTelugu] = useState(false);
  const [results, setResults] = useState([]);

  // Language text mapping
  const t = (en, te) => (isTelugu ? te : en);

  const calculateInterest = () => {
    if (!principal || !interestRate || !startDate || !endDate) return;

    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = end.getTime() - start.getTime();
    const totalDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1; // inclusive days

    let totalAmount = 0;
    let totalInterest = 0;
    let remainingDays = totalDays;
    let p = parseFloat(principal);
    const rate = parseFloat(interestRate);

    if (interestType === "simple") {
      totalInterest = (p * rate * totalDays) / (30 * 100);
      totalAmount = p + totalInterest;
    } else {
      let years = Math.floor(remainingDays / 365);
      let extraDays = remainingDays % 365;

      for (let i = 0; i < years; i++) {
        const interest = (p * rate * 365) / (30 * 100);
        p += interest;
      }

      const lastInterest = (p * rate * extraDays) / (30 * 100);
      totalInterest = p - principal + lastInterest;
      totalAmount = p + lastInterest;
    }

    const result = {
      principal,
      rate: interestRate,
      startDate,
      endDate,
      totalDays,
      totalInterest: totalInterest.toFixed(2),
      totalAmount: totalAmount.toFixed(2),
      type: interestType,
      id: Date.now(),
    };

    setResults([result, ...results]);
  };

  const deleteResult = (id) => {
    setResults(results.filter((r) => r.id !== id));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex flex-col items-center text-white p-4">
      <div className="flex justify-between items-center w-full max-w-md mb-4">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Calculator className="text-yellow-400" />
          {t("Gold Loan Interest Calculator", "బంగారు లోన్ వడ్డీ లెక్కించు")}
        </h1>
        <button
          onClick={() => setIsTelugu(!isTelugu)}
          className="p-2 bg-gray-800 rounded-full hover:bg-yellow-500 transition"
          title={t("Toggle Language", "భాష మార్చు")}
        >
          <Globe size={18} />
        </button>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-800 bg-opacity-50 p-6 rounded-2xl shadow-xl w-full max-w-md"
      >
        <div className="grid gap-3">
          <div>
            <label className="block mb-1">
              {t("Principal Amount", "మూలధనం (Principal)")}
            </label>
            <input
              type="number"
              value={principal}
              onChange={(e) => setPrincipal(e.target.value)}
              className="w-full p-2 rounded bg-gray-900 border border-gray-700"
              placeholder={t("Enter amount", "మొత్తం నమోదు చేయండి")}
            />
          </div>

          <div>
            <label className="block mb-1">
              {t("Interest Rate (%) per month", "వడ్డీ రేటు (%) నెలకు")}
            </label>
            <input
              type="number"
              value={interestRate}
              onChange={(e) => setInterestRate(e.target.value)}
              className="w-full p-2 rounded bg-gray-900 border border-gray-700"
              placeholder={t("Enter interest rate", "వడ్డీ రేటు నమోదు చేయండి")}
            />
          </div>

          <div className="flex gap-2">
            <div className="flex-1">
              <label className="block mb-1 flex items-center gap-1">
                <Calendar size={14} />
                {t("Start Date", "ప్రారంభ తేదీ")}
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full p-2 rounded bg-gray-900 border border-gray-700"
              />
            </div>
            <div className="flex-1">
              <label className="block mb-1 flex items-center gap-1">
                <Calendar size={14} />
                {t("End Date", "ముగింపు తేదీ")}
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full p-2 rounded bg-gray-900 border border-gray-700"
              />
            </div>
          </div>

          <div className="flex justify-between items-center mt-2">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="type"
                value="simple"
                checked={interestType === "simple"}
                onChange={() => setInterestType("simple")}
              />
              {t("Simple Interest", "సాధా వడ్డి")}
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="type"
                value="compound"
                checked={interestType === "compound"}
                onChange={() => setInterestType("compound")}
              />
              {t("Compound Interest", "మిశ్ర వడ్డి")}
            </label>
          </div>

          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={calculateInterest}
            className="w-full bg-yellow-500 text-black font-bold py-2 rounded-lg mt-4 hover:bg-yellow-400 transition"
          >
            {t("Calculate", "లెక్కించు")}
          </motion.button>
        </div>
      </motion.div>

      {/* Results Section */}
      <div className="w-full max-w-md mt-6 space-y-3">
        {results.map((r) => (
          <motion.div
            key={r.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-800 bg-opacity-60 p-4 rounded-2xl shadow-md border border-gray-700"
          >
            <div className="flex justify-between items-center mb-1">
              <span className="text-yellow-400 font-semibold">
                {t("Total Days", "మొత్తం రోజులు")}: {r.totalDays}
              </span>
              <button onClick={() => deleteResult(r.id)}>
                <Trash2 size={16} className="text-red-400 hover:text-red-600" />
              </button>
            </div>
            <p>
              {t("Interest Type", "వడ్డి రకం")}:{" "}
              {r.type === "simple"
                ? t("Simple", "సాధా")
                : t("Compound", "మిశ్ర")}
            </p>
            <p>
              {t("Interest Earned", "వడ్డీ మొత్తం")}: ₹{r.totalInterest}
            </p>
            <p>
              {t("Total Amount", "మొత్తం చెల్లించవలసిన మొత్తం")}: ₹
              {r.totalAmount}
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}