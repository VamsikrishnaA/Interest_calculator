import React, { useState, useEffect } from "react";
import dayjs from "dayjs";

export default function InterestCalculator() {
  const [principal, setPrincipal] = useState("");
  const [interestRate, setInterestRate] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [mode, setMode] = useState("simple");
  const [interestType, setInterestType] = useState("monthly");
  const [results, setResults] = useState([]);

  const formatDate = (date) => dayjs(date).format("DD-MM-YYYY");

  const calculateDays = (start, end) =>
    dayjs(end).diff(dayjs(start), "day") + 1;

  const calculateInterest = () => {
    if (!principal || !interestRate || !startDate || !endDate) return;

    const totalDays = calculateDays(startDate, endDate);
    let totalInterest = 0;
    let totalAmount = 0;

    if (mode === "simple") {
      if (interestType === "monthly") {
        const months = Math.floor(totalDays / 30);
        totalInterest = (principal * interestRate * months) / 100;
      } else {
        const dailyRate = interestRate / 30;
        totalInterest = (principal * dailyRate * totalDays) / 100;
      }
      totalAmount = parseFloat(principal) + totalInterest;
    } else {
      // Compound interest logic
      let remainingDays = totalDays;
      let currentPrincipal = parseFloat(principal);
      const dailyRate = interestRate / 30 / 100;

      while (remainingDays > 365) {
        const blockInterest = currentPrincipal * dailyRate * 365;
        currentPrincipal += blockInterest;
        remainingDays -= 365;
      }
      const lastInterest = currentPrincipal * dailyRate * remainingDays;
      totalInterest = currentPrincipal + lastInterest - principal;
      totalAmount = parseFloat(principal) + totalInterest;
    }

    const newResult = {
      id: Date.now(),
      principal,
      interestRate,
      startDate: formatDate(startDate),
      endDate: formatDate(endDate),
      totalDays,
      mode,
      interestType,
      totalInterest: totalInterest.toFixed(2),
      totalAmount: totalAmount.toFixed(2),
    };

    setResults([newResult, ...results]);
  };

  const deleteResult = (id) => {
    setResults(results.filter((r) => r.id !== id));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white flex flex-col items-center p-4">
      <h1 className="text-2xl font-bold mb-4 text-amber-400">
        Gold Loan Interest Calculator
      </h1>

      <div className="bg-gray-800 rounded-2xl shadow-xl p-5 w-full max-w-md space-y-3">
        <input
          type="number"
          placeholder="Principal Amount"
          value={principal}
          onChange={(e) => setPrincipal(e.target.value)}
          className="w-full p-3 rounded-xl bg-gray-700 focus:outline-none"
        />

        <input
          type="number"
          placeholder="Interest Rate (%)"
          value={interestRate}
          onChange={(e) => setInterestRate(e.target.value)}
          className="w-full p-3 rounded-xl bg-gray-700 focus:outline-none"
        />

        <div className="flex space-x-2">
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-1/2 p-3 rounded-xl bg-gray-700 focus:outline-none"
          />
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-1/2 p-3 rounded-xl bg-gray-700 focus:outline-none"
          />
        </div>

        <div className="flex justify-between items-center text-sm">
          <label className="flex items-center gap-2">
            <span>Mode:</span>
            <label className="inline-flex relative items-center cursor-pointer">
              <input
                type="checkbox"
                checked={mode === "compound"}
                onChange={() =>
                  setMode(mode === "simple" ? "compound" : "simple")
                }
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:bg-amber-500 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:h-5 after:w-5 after:rounded-full after:transition-all peer-checked:after:translate-x-full"></div>
            </label>
            <span className="capitalize text-amber-400">{mode}</span>
          </label>

          <label className="flex items-center gap-2">
            <span>Type:</span>
            <label className="inline-flex relative items-center cursor-pointer">
              <input
                type="checkbox"
                checked={interestType === "daily"}
                onChange={() =>
                  setInterestType(
                    interestType === "monthly" ? "daily" : "monthly"
                  )
                }
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:bg-amber-500 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:h-5 after:w-5 after:rounded-full after:transition-all peer-checked:after:translate-x-full"></div>
            </label>
            <span className="capitalize text-amber-400">{interestType}</span>
          </label>
        </div>

        <button
          onClick={calculateInterest}
          className="w-full py-3 mt-2 bg-amber-500 hover:bg-amber-600 rounded-xl font-semibold"
        >
          Calculate
        </button>
      </div>

      <div className="w-full max-w-md mt-6 space-y-3">
        {results.map((r) => (
          <div
            key={r.id}
            className="bg-gray-800 rounded-2xl p-4 shadow-lg border border-amber-600 transition-transform transform hover:scale-[1.02]"
          >
            <div className="flex justify-between text-sm text-gray-300">
              <span>{r.startDate}</span>
              <span>{r.endDate}</span>
            </div>
            <h2 className="text-lg font-semibold text-amber-400 mt-1">
              ₹{r.totalAmount}
            </h2>
            <p className="text-gray-400 text-sm">
              Interest: ₹{r.totalInterest} | Days: {r.totalDays}
            </p>
            <button
              onClick={() => deleteResult(r.id)}
              className="text-xs text-red-400 mt-2 hover:underline"
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}