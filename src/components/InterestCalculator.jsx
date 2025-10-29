import React, { useState } from "react";
import { motion } from "framer-motion";

export default function InterestCalculator() {
  const [principal, setPrincipal] = useState("");
  const [rate, setRate] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [mode, setMode] = useState("daily");
  const [interestType, setInterestType] = useState("simple");
  const [results, setResults] = useState([]);

  // Utility: date difference
  const getDateDiff = (start, end) => {
    const s = new Date(start);
    const e = new Date(end);
    return Math.floor((e - s) / (1000 * 60 * 60 * 24)) + 1;
  };

  // Utility: month difference for monthly mode
  const getMonthDiff = (start, end) => {
    const s = new Date(start);
    const e = new Date(end);
    let months =
      (e.getFullYear() - s.getFullYear()) * 12 + (e.getMonth() - s.getMonth());
    const extraDays = e.getDate() - s.getDate();
    if (extraDays >= 16) months += 1;
    else if (extraDays >= 6) months += 0.5;
    return months;
  };

  // Format date → dd-mm-yyyy
  const formatDate = (d) => {
    const date = new Date(d);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  // Calculate Interest
  const calculateInterest = () => {
    if (!principal || !rate || !startDate || !endDate) return;

    let totalInterest = 0;
    let totalAmount = 0;
    let durationText = "";
    let durationValue = 0;

    if (mode === "daily") {
      const days = getDateDiff(startDate, endDate);
      durationText = "Total Days";
      durationValue = days;

      if (interestType === "simple") {
        totalInterest = (principal * (rate / 100 / 30) * days).toFixed(2);
      } else {
        let remainingDays = days;
        let currentPrincipal = Number(principal);

        while (remainingDays > 0) {
          const block = Math.min(365, remainingDays);
          const interest = currentPrincipal * (rate / 100 / 30) * block;
          currentPrincipal += interest;
          remainingDays -= block;
        }
        totalInterest = (currentPrincipal - principal).toFixed(2);
      }
    } else {
      const months = getMonthDiff(startDate, endDate);
      durationText = "Total Months";
      durationValue = months;

      if (interestType === "simple") {
        totalInterest = (principal * (rate / 100) * months).toFixed(2);
      } else {
        let remainingMonths = months;
        let currentPrincipal = Number(principal);

        while (remainingMonths > 0) {
          const block = Math.min(12, remainingMonths);
          const interest = currentPrincipal * (rate / 100) * block;
          currentPrincipal += interest;
          remainingMonths -= block;
        }
        totalInterest = (currentPrincipal - principal).toFixed(2);
      }
    }

    totalAmount = (Number(principal) + Number(totalInterest)).toFixed(2);

    const newResult = {
      id: Date.now(),
      principal,
      rate,
      mode,
      interestType,
      startDate: formatDate(startDate),
      endDate: formatDate(endDate),
      totalInterest,
      totalAmount,
      durationText,
      durationValue,
    };

    setResults([newResult, ...results]);
  };

  const deleteResult = (id) => {
    setResults(results.filter((r) => r.id !== id));
  };

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white flex flex-col items-center p-4">
      <h1 className="text-2xl font-bold text-yellow-400 mb-6 text-center">
        Gold Loan Interest Calculator
      </h1>

      <div className="bg-[#1a1a1a] p-4 rounded-2xl shadow-lg w-full max-w-md">
        <div className="space-y-3">
          <input
            type="number"
            placeholder="Principal Amount"
            className="w-full p-2 rounded-lg bg-[#2a2a2a] text-yellow-300 outline-none"
            value={principal}
            onChange={(e) => setPrincipal(e.target.value)}
          />
          <input
            type="number"
            placeholder="Interest Rate (%)"
            className="w-full p-2 rounded-lg bg-[#2a2a2a] text-yellow-300 outline-none"
            value={rate}
            onChange={(e) => setRate(e.target.value)}
          />
          <input
            type="date"
            className="w-full p-2 rounded-lg bg-[#2a2a2a] text-yellow-300 outline-none"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
          <input
            type="date"
            className="w-full p-2 rounded-lg bg-[#2a2a2a] text-yellow-300 outline-none"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />

          {/* Toggles */}
          <div className="flex justify-between items-center mt-3">
            <label className="flex items-center gap-2 text-yellow-400">
              <span>Mode:</span>
              <div
                className="relative inline-flex items-center cursor-pointer"
                onClick={() =>
                  setMode(mode === "daily" ? "monthly" : "daily")
                }
              >
                <div className="w-14 h-7 bg-gray-600 rounded-full"></div>
                <div
                  className={`absolute w-6 h-6 bg-yellow-400 rounded-full top-[2px] transition-all duration-200 ${
                    mode === "monthly" ? "translate-x-7" : "translate-x-1"
                  }`}
                ></div>
                <span className="absolute text-xs w-full text-center text-black font-bold">
                  {mode === "daily" ? "Daily" : "Monthly"}
                </span>
              </div>
            </label>

            <label className="flex items-center gap-2 text-yellow-400">
              <span>Interest:</span>
              <div
                className="relative inline-flex items-center cursor-pointer"
                onClick={() =>
                  setInterestType(
                    interestType === "simple" ? "compound" : "simple"
                  )
                }
              >
                <div className="w-14 h-7 bg-gray-600 rounded-full"></div>
                <div
                  className={`absolute w-6 h-6 bg-yellow-400 rounded-full top-[2px] transition-all duration-200 ${
                    interestType === "compound"
                      ? "translate-x-7"
                      : "translate-x-1"
                  }`}
                ></div>
                <span className="absolute text-xs w-full text-center text-black font-bold">
                  {interestType === "simple" ? "Simple" : "Comp"}
                </span>
              </div>
            </label>
          </div>

          <button
            onClick={calculateInterest}
            className="w-full bg-yellow-500 text-black font-semibold p-2 mt-3 rounded-lg hover:bg-yellow-400 transition-all"
          >
            Calculate
          </button>
        </div>
      </div>

      {/* Results */}
      <div className="mt-6 w-full max-w-md space-y-3">
        {results.map((r) => (
          <motion.div
            key={r.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#1c1c1c] rounded-2xl p-4 shadow-md border border-yellow-700"
          >
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-lg font-bold text-yellow-400">
                ₹{r.principal} @ {r.rate}%
              </h2>
              <button
                onClick={() => deleteResult(r.id)}
                className="text-red-400 text-sm font-bold"
              >
                ✖ Delete
              </button>
            </div>
            <p className="text-sm text-gray-300">
              Mode: <span className="text-yellow-400">{r.mode}</span> | Interest:{" "}
              <span className="text-yellow-400">{r.interestType}</span>
            </p>
            <p className="text-sm text-gray-300">
              Start: <span className="text-yellow-400">{r.startDate}</span> | End:{" "}
              <span className="text-yellow-400">{r.endDate}</span>
            </p>
            <p className="text-sm text-gray-300">
              {r.durationText}:{" "}
              <span className="text-yellow-400">{r.durationValue}</span>
            </p>
            <p className="text-sm text-gray-300">
              Interest: ₹<span className="text-yellow-400">{r.totalInterest}</span>
            </p>
            <p className="text-sm text-gray-300">
              Total: ₹<span className="text-yellow-400">{r.totalAmount}</span>
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}