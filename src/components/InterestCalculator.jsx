import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function InterestCalculator() {
  const [principal, setPrincipal] = useState("");
  const [rate, setRate] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [mode, setMode] = useState("monthly");
  const [interestType, setInterestType] = useState("simple");
  const [results, setResults] = useState([]);
  const [darkMode, setDarkMode] = useState(false);

  // Inclusive day difference
  function getInclusiveDays(s, e) {
    const start = new Date(s);
    const end = new Date(e);
    return Math.floor((end - start) / (1000 * 60 * 60 * 24)) + 1;
  }

  // Count months + remaining days
  function getMonthsAndDays(s, e) {
    const start = new Date(s);
    const end = new Date(e);
    let months = 0;
    let cursor = new Date(start);
    while (true) {
      const next = new Date(cursor);
      next.setMonth(next.getMonth() + 1);
      if (next <= end) {
        months++;
        cursor = next;
      } else break;
    }
    const totalDays = getInclusiveDays(s, e);
    const daysCovered = getInclusiveDays(start, cursor);
    const remainingDays = totalDays - daysCovered;
    return { months, remainingDays };
  }

  // Rounding helper
  const round = (n) => Math.round(n * 100) / 100;

  // Core calculation logic
  function calculate() {
    if (!principal || !rate || !startDate || !endDate) {
      alert("Please fill all fields");
      return;
    }

    const P = Number(principal);
    const rMonthly = Number(rate);
    const totalDays = getInclusiveDays(startDate, endDate);
    let interest = 0;
    let total = 0;

    if (interestType === "simple") {
      if (mode === "daily") {
        const dailyRate = rMonthly / 30;
        interest = (P * dailyRate * totalDays) / 100;
      } else {
        const { months, remainingDays } = getMonthsAndDays(startDate, endDate);
        let monthCount = months;
        if (remainingDays < 6) monthCount += 0;
        else if (remainingDays >= 6 && remainingDays <= 16) monthCount += 0.5;
        else monthCount += 1;
        interest = (P * rMonthly * monthCount) / 100;
      }
      total = P + interest;
    } else {
      const dailyRate = (rMonthly / 30) / 100;
      let currentPrincipal = P;
      let remaining = totalDays;
      let totalInterest = 0;
      const fullYears = Math.floor(remaining / 365);

      for (let i = 0; i < fullYears; i++) {
        const blockInterest = currentPrincipal * dailyRate * 365;
        totalInterest += blockInterest;
        currentPrincipal += blockInterest;
        remaining -= 365;
      }

      if (remaining > 0) {
        const remInterest = currentPrincipal * dailyRate * remaining;
        totalInterest += remInterest;
      }

      interest = totalInterest;
      total = P + totalInterest;
    }

    const result = {
      id: Date.now(),
      principal: round(P),
      rate: rMonthly,
      startDate,
      endDate,
      mode,
      interestType,
      totalDays,
      interest: round(interest),
      total: round(total),
    };

    setResults((prev) => [result, ...prev]);
  }

  const deleteResult = (id) =>
    setResults((prev) => prev.filter((r) => r.id !== id));

  return (
    <div className={`${darkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-black"} min-h-screen p-6 transition-all duration-300`}>
      <div className="max-w-3xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-lg transition-all duration-300">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold">Gold Loan Interest Calculator</h2>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="text-sm border px-3 py-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition"
          >
            {darkMode ? "☀️ Light" : "🌙 Dark"}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="number"
            placeholder="Principal (₹)"
            value={principal}
            onChange={(e) => setPrincipal(e.target.value)}
            className="p-2 border rounded"
          />
          <input
            type="number"
            placeholder="Monthly Rate (%)"
            value={rate}
            onChange={(e) => setRate(e.target.value)}
            className="p-2 border rounded"
          />
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="p-2 border rounded"
          />
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="p-2 border rounded"
          />

          <div className="flex flex-wrap items-center gap-3 col-span-2">
            <label>Mode:</label>
            <select
              value={mode}
              onChange={(e) => setMode(e.target.value)}
              className="p-2 border rounded"
            >
              <option value="monthly">Monthly</option>
              <option value="daily">Daily</option>
            </select>

            <label>Interest:</label>
            <select
              value={interestType}
              onChange={(e) => setInterestType(e.target.value)}
              className="p-2 border rounded"
            >
              <option value="simple">Simple</option>
              <option value="compound">Compound</option>
            </select>

            <button
              onClick={calculate}
              className="ml-auto px-4 py-2 bg-blue-600 text-white rounded hover:opacity-90 transition"
            >
              Calculate
            </button>
          </div>
        </div>

        <AnimatePresence>
          {results.length > 0 && (
            <motion.div
              className="mt-6"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              {results.map((r) => (
                <motion.div
                  key={r.id}
                  className="p-4 my-3 border rounded-lg shadow-sm bg-gray-50 dark:bg-gray-700"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-semibold text-lg">
                      ₹{r.principal} @ {r.rate}% ({r.interestType})
                    </h3>
                    <button
                      onClick={() => deleteResult(r.id)}
                      className="text-red-500 hover:text-red-700 text-sm"
                    >
                      ✖ Delete
                    </button>
                  </div>
                  <table className="w-full text-sm border">
                    <tbody>
                      <tr>
                        <td className="border p-2">Mode</td>
                        <td className="border p-2">{r.mode}</td>
                      </tr>
                      <tr>
                        <td className="border p-2">Start Date</td>
                        <td className="border p-2">{r.startDate}</td>
                      </tr>
                      <tr>
                        <td className="border p-2">End Date</td>
                        <td className="border p-2">{r.endDate}</td>
                      </tr>
                      <tr>
                        <td className="border p-2">Total Days</td>
                        <td className="border p-2">{r.totalDays}</td>
                      </tr>
                      <tr>
                        <td className="border p-2 font-semibold">Interest</td>
                        <td className="border p-2 font-semibold text-green-600">
                          ₹{r.interest}
                        </td>
                      </tr>
                      <tr>
                        <td className="border p-2 font-semibold">Total (P + I)</td>
                        <td className="border p-2 font-semibold text-blue-600">
                          ₹{r.total}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
