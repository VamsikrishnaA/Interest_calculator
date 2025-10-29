import React, { useState } from "react";
import dayjs from "dayjs";

export default function InterestCalculator() {
  const [principal, setPrincipal] = useState("");
  const [interestRate, setInterestRate] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [mode, setMode] = useState("Simple"); // Simple or Compound
  const [interestType, setInterestType] = useState("Monthly"); // Monthly or Daily
  const [results, setResults] = useState([]);

  // Date format helper
  const formatDate = (date) => dayjs(date).format("DD-MM-YYYY");

  // Interest calculation
  const calculateInterest = () => {
    if (!principal || !interestRate || !startDate || !endDate) return;

    const start = dayjs(startDate);
    const end = dayjs(endDate);
    const totalDays = end.diff(start, "day") + 1;

    let totalInterest = 0;
    let totalAmount = 0;
    let remainingDays = totalDays;
    let currentPrincipal = Number(principal);
    const rate = Number(interestRate);

    if (mode === "Simple") {
      if (interestType === "Monthly") {
        const months = Math.floor(totalDays / 30);
        totalInterest = (currentPrincipal * rate * months) / 100;
      } else {
        const dailyRate = rate / 30;
        totalInterest = (currentPrincipal * dailyRate * totalDays) / 100;
      }
    } else {
      // Compound logic
      while (remainingDays > 365) {
        const yearlyInterest = (currentPrincipal * (rate * 12)) / 100;
        currentPrincipal += yearlyInterest;
        remainingDays -= 365;
      }
      const remainingInterest = (currentPrincipal * (rate / 30) * remainingDays) / 100;
      totalInterest = remainingInterest + (currentPrincipal - principal);
    }

    totalAmount = Number(principal) + totalInterest;

    const newResult = {
      id: Date.now(),
      principal,
      rate,
      totalDays,
      mode,
      interestType,
      startDate: formatDate(startDate),
      endDate: formatDate(endDate),
      totalInterest: totalInterest.toFixed(2),
      totalAmount: totalAmount.toFixed(2),
    };

    setResults([newResult, ...results]);
  };

  return (
    <div className="p-4 max-w-2xl mx-auto text-white">
      <h1 className="text-2xl font-bold text-center mb-4">Gold Loan Interest Calculator</h1>

      {/* Toggles */}
      <div className="flex justify-center gap-6 mb-4">
        {/* Mode Toggle */}
        <div className="flex items-center gap-2">
          <span className="text-sm">Simple</span>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={mode === "Compound"}
              onChange={() => setMode(mode === "Simple" ? "Compound" : "Simple")}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-yellow-500 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-500"></div>
          </label>
          <span className="text-sm">Compound</span>
        </div>

        {/* Interest Type Toggle */}
        <div className="flex items-center gap-2">
          <span className="text-sm">Monthly</span>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={interestType === "Daily"}
              onChange={() =>
                setInterestType(interestType === "Monthly" ? "Daily" : "Monthly")
              }
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-yellow-500 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-500"></div>
          </label>
          <span className="text-sm">Daily</span>
        </div>
      </div>

      {/* Inputs */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <input
          type="number"
          placeholder="Principal"
          value={principal}
          onChange={(e) => setPrincipal(e.target.value)}
          className="p-2 bg-gray-800 rounded"
        />
        <input
          type="number"
          placeholder="Interest Rate (%)"
          value={interestRate}
          onChange={(e) => setInterestRate(e.target.value)}
          className="p-2 bg-gray-800 rounded"
        />
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="p-2 bg-gray-800 rounded col-span-1"
        />
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="p-2 bg-gray-800 rounded col-span-1"
        />
      </div>

      <button
        onClick={calculateInterest}
        className="w-full py-2 bg-yellow-500 text-black rounded font-bold hover:bg-yellow-400 transition"
      >
        Calculate
      </button>

      {/* Results */}
      <div className="mt-6 space-y-4">
        {results.map((r) => (
          <div
            key={r.id}
            className="bg-gray-900 p-4 rounded-lg shadow-lg border border-gray-700"
          >
            <div className="flex justify-between text-sm mb-2">
              <span>Start: {r.startDate}</span>
              <span>End: {r.endDate}</span>
            </div>
            <p>Principal: ₹{r.principal}</p>
            <p>Rate: {r.rate}% ({r.interestType})</p>
            <p>Mode: {r.mode}</p>
            <p>Days: {r.totalDays}</p>
            <p className="text-yellow-400 font-semibold">
              Interest: ₹{r.totalInterest}
            </p>
            <p className="text-green-400 font-bold">
              Total: ₹{r.totalAmount}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}