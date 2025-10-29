import React, { useState } from "react";
import { motion } from "framer-motion";
import { format, differenceInDays, differenceInMonths, addDays, addMonths } from "date-fns";

export default function InterestCalculator() {
  const [principal, setPrincipal] = useState("");
  const [rate, setRate] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [mode, setMode] = useState("daily");
  const [interestType, setInterestType] = useState("simple");
  const [results, setResults] = useState([]);

  const calculateInterest = () => {
    if (!principal || !rate || !startDate || !endDate) return;

    const start = new Date(startDate);
    const end = new Date(endDate);
    const totalDays = differenceInDays(addDays(end, 1), start);
    let totalMonths = differenceInMonths(addMonths(end, 1), start);

    let totalInterest = 0;
    let finalPrincipal = parseFloat(principal);
    const monthlyRate = parseFloat(rate);
    const dailyRate = monthlyRate / 30;

    if (interestType === "simple") {
      if (mode === "daily") {
        totalInterest = (finalPrincipal * dailyRate * totalDays) / 100;
      } else {
        totalInterest = (finalPrincipal * monthlyRate * totalMonths) / 100;
      }
    } else {
      if (mode === "daily") {
        let remainingDays = totalDays;
        while (remainingDays > 365) {
          const interest = (finalPrincipal * dailyRate * 365) / 100;
          finalPrincipal += interest;
          remainingDays -= 365;
        }
        totalInterest = (finalPrincipal * dailyRate * remainingDays) / 100;
      } else {
        let remainingMonths = totalMonths;
        while (remainingMonths > 12) {
          const interest = (finalPrincipal * monthlyRate * 12) / 100;
          finalPrincipal += interest;
          remainingMonths -= 12;
        }
        totalInterest = (finalPrincipal * monthlyRate * remainingMonths) / 100;
      }
    }

    const totalAmount = finalPrincipal + totalInterest;
    const formattedStart = format(start, "dd-MM-yyyy");
    const formattedEnd = format(end, "dd-MM-yyyy");

    const result = {
      id: Date.now(),
      principal,
      rate,
      mode,
      interestType,
      start: formattedStart,
      end: formattedEnd,
      totalDays,
      totalMonths,
      totalInterest: totalInterest.toFixed(2),
      totalAmount: totalAmount.toFixed(2),
    };

    setResults([result, ...results]);
  };

  const deleteResult = (id) => {
    setResults(results.filter((r) => r.id !== id));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-[#1a1a1a] text-gold-200 flex flex-col items-center p-4">
      <motion.h1
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-3xl font-bold text-yellow-400 mb-6"
      >
        Gold Loan Interest Calculator
      </motion.h1>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-[#222] rounded-2xl shadow-lg p-6 w-full max-w-md space-y-4"
      >
        <div>
          <label className="block text-sm mb-1 text-gray-300">Principal (₹)</label>
          <input
            type="number"
            value={principal}
            onChange={(e) => setPrincipal(e.target.value)}
            className="w-full p-2 rounded bg-[#111] text-white border border-gray-700 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-sm mb-1 text-gray-300">Interest Rate (%)</label>
          <input
            type="number"
            value={rate}
            onChange={(e) => setRate(e.target.value)}
            className="w-full p-2 rounded bg-[#111] text-white border border-gray-700 focus:outline-none"
          />
        </div>

        <div className="flex justify-between space-x-4">
          <div className="flex-1">
            <label className="block text-sm mb-1 text-gray-300">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full p-2 rounded bg-[#111] text-white border border-gray-700"
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm mb-1 text-gray-300">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full p-2 rounded bg-[#111] text-white border border-gray-700"
            />
          </div>
        </div>

        {/* Interest Type Toggle */}
        <div className="flex items-center justify-between text-gray-300 pt-2">
          <span>Simple</span>
          <label className="switch">
            <input
              type="checkbox"
              checked={interestType === "compound"}
              onChange={() =>
                setInterestType(interestType === "simple" ? "compound" : "simple")
              }
            />
            <span className="slider"></span>
          </label>
          <span>Compound</span>
        </div>

        {/* Mode Toggle */}
        <div className="flex items-center justify-between text-gray-300">
          <span>Daily</span>
          <label className="switch">
            <input
              type="checkbox"
              checked={mode === "monthly"}
              onChange={() => setMode(mode === "daily" ? "monthly" : "daily")}
            />
            <span className="slider"></span>
          </label>
          <span>Monthly</span>
        </div>

        <button
          onClick={calculateInterest}
          className="w-full bg-yellow-500 hover:bg-yellow-600 text-black py-2 rounded-xl mt-2 font-semibold transition"
        >
          Calculate
        </button>
      </motion.div>

      <div className="mt-6 w-full max-w-md space-y-4">
        {results.map((r) => (
          <motion.div
            key={r.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="bg-[#222] rounded-xl p-4 text-white shadow-md border border-gray-800"
          >
            <div className="flex justify-between mb-2">
              <span className="text-yellow-400 font-semibold">₹{r.principal}</span>
              <button
                onClick={() => deleteResult(r.id)}
                className="text-red-400 hover:text-red-500 text-sm"
              >
                ✖ Delete
              </button>
            </div>
            <p>Interest: {r.rate}% ({r.interestType})</p>
            <p>Mode: {r.mode}</p>
            <p>Start Date: {r.start}</p>
            <p>End Date: {r.end}</p>
            {r.mode === "daily" ? (
              <p>Total Days: {r.totalDays}</p>
            ) : (
              <p>Total Months: {r.totalMonths}</p>
            )}
            <p>Interest: ₹{r.totalInterest}</p>
            <p className="text-yellow-400 font-semibold">
              Total Amount: ₹{r.totalAmount}
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}