import React, { useState } from "react";
import { motion } from "framer-motion";

export default function InterestCalculator() {
  const [principal, setPrincipal] = useState("");
  const [rate, setRate] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [mode, setMode] = useState("daily");
  const [calcType, setCalcType] = useState("simple");
  const [results, setResults] = useState([]);

  const calculateInterest = () => {
    if (!principal || !rate || !startDate || !endDate) return;

    const start = new Date(startDate);
    const end = new Date(endDate);
    const totalDays =
      Math.floor((end - start) / (1000 * 60 * 60 * 24)) + 1;

    let totalInterest = 0;
    let totalAmount = 0;
    let displayUnit = "";

    if (mode === "daily") {
      const monthlyRate = parseFloat(rate);
      const dailyRate = monthlyRate / 30;
      let principalAmount = parseFloat(principal);
      let remainingDays = totalDays;

      while (remainingDays > 0) {
        const blockDays = Math.min(365, remainingDays);
        const blockInterest =
          (principalAmount * dailyRate * blockDays) / 100;
        totalInterest += blockInterest;
        remainingDays -= blockDays;
        if (calcType === "compound" && remainingDays > 0)
          principalAmount += blockInterest;
      }
      totalAmount = parseFloat(principal) + totalInterest;
      displayUnit = `${totalDays} days`;
    } else {
      // Monthly mode
      const startY = start.getFullYear();
      const startM = start.getMonth();
      const endY = end.getFullYear();
      const endM = end.getMonth();
      const endD = end.getDate();
      const startD = start.getDate();

      let totalMonths =
        (endY - startY) * 12 + (endM - startM);

      const diffDays = endD - startD;
      if (diffDays >= 16) totalMonths += 1;
      else if (diffDays >= 6) totalMonths += 0.5;

      let principalAmount = parseFloat(principal);
      let remainingMonths = totalMonths;

      while (remainingMonths > 0) {
        const blockMonths = Math.min(12, remainingMonths);
        const blockInterest =
          (principalAmount * parseFloat(rate) * blockMonths) / 100;
        totalInterest += blockInterest;
        remainingMonths -= blockMonths;
        if (calcType === "compound" && remainingMonths > 0)
          principalAmount += blockInterest;
      }
      totalAmount = parseFloat(principal) + totalInterest;
      displayUnit = `${totalMonths} months`;
    }

    const result = {
      principal,
      rate,
      startDate,
      endDate,
      totalInterest: totalInterest.toFixed(2),
      totalAmount: totalAmount.toFixed(2),
      mode,
      calcType,
      displayUnit,
    };

    setResults([...results, result]);
  };

  const deleteResult = (index) => {
    setResults(results.filter((_, i) => i !== index));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-gray-900 text-white p-4 flex flex-col items-center">
      <motion.h1
        className="text-2xl font-bold mb-4 text-yellow-400"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
      >
        💰 Gold Loan Interest Calculator
      </motion.h1>

      <motion.div
        className="bg-gray-800 p-4 rounded-2xl shadow-lg w-full max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex flex-col gap-3">
          <input
            type="number"
            placeholder="Principal (₹)"
            className="p-2 rounded bg-gray-700 text-white"
            value={principal}
            onChange={(e) => setPrincipal(e.target.value)}
          />
          <input
            type="number"
            placeholder="Interest Rate (%)"
            className="p-2 rounded bg-gray-700 text-white"
            value={rate}
            onChange={(e) => setRate(e.target.value)}
          />
          <div className="flex justify-between gap-2">
            <input
              type="date"
              className="p-2 rounded bg-gray-700 text-white w-1/2"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
            <input
              type="date"
              className="p-2 rounded bg-gray-700 text-white w-1/2"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>

          {/* Mode Toggle */}
          <div className="flex justify-between">
            <button
              onClick={() => setMode("daily")}
              className={`px-3 py-1 rounded-lg ${
                mode === "daily" ? "bg-yellow-500" : "bg-gray-700"
              }`}
            >
              Daily
            </button>
            <button
              onClick={() => setMode("monthly")}
              className={`px-3 py-1 rounded-lg ${
                mode === "monthly" ? "bg-yellow-500" : "bg-gray-700"
              }`}
            >
              Monthly
            </button>
          </div>

          {/* Simple/Compound Toggle */}
          <div className="flex justify-between">
            <button
              onClick={() => setCalcType("simple")}
              className={`px-3 py-1 rounded-lg ${
                calcType === "simple" ? "bg-yellow-500" : "bg-gray-700"
              }`}
            >
              Simple
            </button>
            <button
              onClick={() => setCalcType("compound")}
              className={`px-3 py-1 rounded-lg ${
                calcType === "compound" ? "bg-yellow-500" : "bg-gray-700"
              }`}
            >
              Compound
            </button>
          </div>

          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={calculateInterest}
            className="mt-3 w-full bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-2 rounded-lg"
          >
            Calculate
          </motion.button>
        </div>
      </motion.div>

      {/* Results */}
      <div className="w-full max-w-md mt-6 space-y-4">
        {results.map((r, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-800 p-4 rounded-2xl shadow-lg border border-yellow-500"
          >
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-lg text-yellow-400 font-bold">
                ₹{r.principal} @ {r.rate}%
              </h2>
              <button
                onClick={() => deleteResult(i)}
                className="text-red-400 hover:text-red-600 font-bold text-sm"
              >
                ✖ Delete
              </button>
            </div>
            <p>
              Mode: <span className="text-white">{r.mode}</span>
            </p>
            <p>
              Type: <span className="text-white">{r.calcType}</span>
            </p>
            <p>
              Start Date:{" "}
              <span className="text-white">
                {r.startDate
                  ? new Date(r.startDate)
                      .toLocaleDateString("en-GB")
                      .split("/")
                      .join("-")
                  : ""}
              </span>
            </p>
            <p>
              End Date:{" "}
              <span className="text-white">
                {r.endDate
                  ? new Date(r.endDate)
                      .toLocaleDateString("en-GB")
                      .split("/")
                      .join("-")
                  : ""}
              </span>
            </p>
            <p>
              Duration: <span className="text-white">{r.displayUnit}</span>
            </p>
            <p>
              Interest:{" "}
              <span className="text-green-400">₹{r.totalInterest}</span>
            </p>
            <p>
              Total Amount:{" "}
              <span className="text-yellow-400">₹{r.totalAmount}</span>
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}