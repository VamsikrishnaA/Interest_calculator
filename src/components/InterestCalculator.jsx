import React, { useState } from "react";

function InterestCalculator() {
  const [principal, setPrincipal] = useState("");
  const [rate, setRate] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [mode, setMode] = useState("daily");
  const [interestType, setInterestType] = useState("simple");
  const [results, setResults] = useState([]);

  const calculateDays = (s, e) => {
    const sd = new Date(s);
    const ed = new Date(e);
    const diff = Math.floor((ed - sd) / (1000 * 60 * 60 * 24)) + 1; // inclusive
    return diff;
  };

  const calculateMonths = (s, e) => {
    const sd = new Date(s);
    const ed = new Date(e);
    let months =
      (ed.getFullYear() - sd.getFullYear()) * 12 + (ed.getMonth() - sd.getMonth());
    const dayDiff = ed.getDate() - sd.getDate();
    if (dayDiff >= 6 && dayDiff <= 16) months += 0.5;
    else if (dayDiff > 16) months += 1;
    else if (dayDiff < 0 && Math.abs(dayDiff) > 16) months -= 1; // handle negative overlap
    return months;
  };

  const handleCalculate = () => {
    if (!principal || !rate || !startDate || !endDate) return;

    const p = parseFloat(principal);
    const r = parseFloat(rate);
    let totalInterest = 0;
    let totalAmount = 0;
    let durationLabel = "";
    let count = 0;

    if (mode === "daily") {
      const totalDays = calculateDays(startDate, endDate);
      durationLabel = `${totalDays} Days`;

      if (interestType === "simple") {
        const dailyRate = r / 30 / 100;
        totalInterest = p * dailyRate * totalDays;
      } else {
        // Compound every 365 days
        const dailyRate = r / 30 / 100;
        let remaining = totalDays;
        let tempPrincipal = p;
        while (remaining > 0) {
          const block = Math.min(365, remaining);
          const interest = tempPrincipal * dailyRate * block;
          remaining -= block;
          tempPrincipal += interest;
        }
        totalInterest = tempPrincipal - p;
      }

      totalAmount = p + totalInterest;
      count = totalDays;
    } else {
      const totalMonths = calculateMonths(startDate, endDate);
      durationLabel = `${totalMonths} Months`;

      if (interestType === "simple") {
        const monthlyRate = r / 100;
        totalInterest = p * monthlyRate * totalMonths;
      } else {
        // Compound every 12 months
        const monthlyRate = r / 100;
        let remaining = totalMonths;
        let tempPrincipal = p;
        while (remaining > 0) {
          const block = Math.min(12, remaining);
          const interest = tempPrincipal * monthlyRate * block;
          remaining -= block;
          tempPrincipal += interest;
        }
        totalInterest = tempPrincipal - p;
      }

      totalAmount = p + totalInterest;
      count = totalMonths;
    }

    const newResult = {
      id: Date.now(),
      mode,
      interestType,
      startDate,
      endDate,
      rate: r,
      principal: p,
      totalInterest,
      totalAmount,
      count,
    };

    setResults([newResult, ...results]);
  };

  const handleDelete = (id) => {
    setResults(results.filter((r) => r.id !== id));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 to-gray-900 text-white p-4 flex flex-col items-center">
      <h1 className="text-2xl font-bold mb-4 text-yellow-400">
        Gold Loan Interest Calculator
      </h1>

      <div className="bg-gray-800 p-4 rounded-2xl w-full max-w-md shadow-lg">
        <div className="mb-3">
          <label className="block text-sm mb-1">Principal (₹)</label>
          <input
            type="number"
            className="w-full p-2 rounded bg-gray-700 outline-none"
            value={principal}
            onChange={(e) => setPrincipal(e.target.value)}
          />
        </div>

        <div className="mb-3">
          <label className="block text-sm mb-1">Interest Rate (%)</label>
          <input
            type="number"
            className="w-full p-2 rounded bg-gray-700 outline-none"
            value={rate}
            onChange={(e) => setRate(e.target.value)}
          />
        </div>

        <div className="mb-3 flex gap-2">
          <div className="flex-1">
            <label className="block text-sm mb-1">Start Date</label>
            <input
              type="date"
              className="w-full p-2 rounded bg-gray-700 outline-none"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm mb-1">End Date</label>
            <input
              type="date"
              className="w-full p-2 rounded bg-gray-700 outline-none"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </div>

        <div className="flex justify-between items-center mb-3">
          <div className="flex gap-3 items-center">
            <label className="text-sm">Mode:</label>
            <select
              value={mode}
              onChange={(e) => setMode(e.target.value)}
              className="bg-gray-700 p-1 rounded"
            >
              <option value="daily">Daily</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>

          <div className="flex gap-3 items-center">
            <label className="text-sm">Type:</label>
            <select
              value={interestType}
              onChange={(e) => setInterestType(e.target.value)}
              className="bg-gray-700 p-1 rounded"
            >
              <option value="simple">Simple</option>
              <option value="compound">Compound</option>
            </select>
          </div>
        </div>

        <button
          onClick={handleCalculate}
          className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-2 rounded-lg mt-2"
        >
          Calculate
        </button>
      </div>

      <div className="w-full max-w-2xl mt-6 space-y-4">
        {results.map((r) => (
          <div
            key={r.id}
            className="bg-gray-800 p-4 rounded-xl shadow-md relative"
          >
            <button
              onClick={() => handleDelete(r.id)}
              className="absolute top-2 right-3 text-red-400 hover:text-red-500 text-xl"
            >
              ✖
            </button>
            <p className="font-semibold text-yellow-400 text-lg">
              ₹{r.principal.toLocaleString()} @ {r.rate}% ({r.interestType})
            </p>
            <p className="text-sm text-gray-400">Mode: {r.mode}</p>
            <p className="text-sm text-gray-400">
              Start: {r.startDate} | End: {r.endDate}
            </p>
            <p className="text-sm mt-2 text-blue-400">
              Total {r.mode === "daily" ? "Days" : "Months"}: {r.count}
            </p>
            <p className="mt-2">
              Interest:{" "}
              <span className="text-green-400 font-bold">
                ₹{r.totalInterest.toFixed(2)}
              </span>
            </p>
            <p className="text-lg">
              Total Amount:{" "}
              <span className="text-yellow-400 font-bold">
                ₹{r.totalAmount.toFixed(2)}
              </span>
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default InterestCalculator;
