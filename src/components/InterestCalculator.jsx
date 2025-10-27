import React, { useState } from "react";
import { motion } from "framer-motion";
import { Trash2, Calculator } from "lucide-react";

export default function InterestCalculator() {
  const [principal, setPrincipal] = useState("");
  const [rate, setRate] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [results, setResults] = useState([]);
  const [darkMode, setDarkMode] = useState(false);

  // Inclusive date difference in days
  const getInclusiveDays = (start, end) => {
    const s = new Date(start);
    const e = new Date(end);
    const diff = Math.floor((e - s) / (1000 * 60 * 60 * 24)) + 1;
    return diff;
  };

  // Compound interest logic for 365-day blocks
  const calculateInterest = (p, r, days) => {
    const ratePerDay = (r / 100) / 30; // monthly rate → daily
    let totalInterest = 0;
    let remainingDays = days;
    let currentPrincipal = p;

    while (remainingDays > 365) {
      const blockInterest = currentPrincipal * ratePerDay * 365;
      totalInterest += blockInterest;
      currentPrincipal += blockInterest;
      remainingDays -= 365;
    }

    const lastInterest = currentPrincipal * ratePerDay * remainingDays;
    totalInterest += lastInterest;

    return { totalInterest, totalAmount: p + totalInterest };
  };

  const handleCalculate = () => {
    if (!principal || !rate || !startDate || !endDate) return alert("Please fill all fields");

    const days = getInclusiveDays(startDate, endDate);
    const { totalInterest, totalAmount } = calculateInterest(Number(principal), Number(rate), days);

    const newResult = {
      id: Date.now(),
      principal,
      rate,
      startDate,
      endDate,
      days,
      totalInterest: totalInterest.toFixed(2),
      totalAmount: totalAmount.toFixed(2),
    };

    setResults([newResult, ...results]);
  };

  const handleDelete = (id) => {
    setResults(results.filter((res) => res.id !== id));
  };

  return (
    <div
      className={`min-h-screen p-4 transition-all duration-500 ${
        darkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-800"
      }`}
    >
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Calculator className="w-6 h-6" /> Gold Loan Interest Calculator
          </h1>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="px-3 py-1 rounded-lg text-sm border hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            {darkMode ? "☀️ Light" : "🌙 Dark"}
          </button>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="p-6 rounded-2xl shadow-lg bg-white dark:bg-gray-800"
        >
          <div className="grid md:grid-cols-2 gap-4">
            <input
              type="number"
              placeholder="Principal Amount"
              value={principal}
              onChange={(e) => setPrincipal(e.target.value)}
              className="p-3 rounded-lg border w-full text-sm dark:bg-gray-700 dark:border-gray-600"
            />
            <input
              type="number"
              placeholder="Monthly Interest Rate (%)"
              value={rate}
              onChange={(e) => setRate(e.target.value)}
              className="p-3 rounded-lg border w-full text-sm dark:bg-gray-700 dark:border-gray-600"
            />
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="p-3 rounded-lg border w-full text-sm dark:bg-gray-700 dark:border-gray-600"
            />
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="p-3 rounded-lg border w-full text-sm dark:bg-gray-700 dark:border-gray-600"
            />
          </div>

          <button
            onClick={handleCalculate}
            className="mt-5 w-full bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-2 rounded-lg transition"
          >
            Calculate
          </button>
        </motion.div>

        {results.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-8 overflow-x-auto"
          >
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-gray-200 dark:bg-gray-700">
                  <th className="p-3 border">Principal</th>
                  <th className="p-3 border">Rate (%)</th>
                  <th className="p-3 border">Start</th>
                  <th className="p-3 border">End</th>
                  <th className="p-3 border">Days</th>
                  <th className="p-3 border">Interest</th>
                  <th className="p-3 border">Total</th>
                  <th className="p-3 border">Action</th>
                </tr>
              </thead>
              <tbody>
                {results.map((res, i) => (
                  <motion.tr
                    key={res.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="text-center dark:border-gray-700"
                  >
                    <td className="p-2 border">{res.principal}</td>
                    <td className="p-2 border">{res.rate}</td>
                    <td className="p-2 border">{res.startDate}</td>
                    <td className="p-2 border">{res.endDate}</td>
                    <td className="p-2 border">{res.days}</td>
                    <td className="p-2 border text-yellow-600 font-semibold">
                      {res.totalInterest}
                    </td>
                    <td className="p-2 border text-green-600 font-semibold">
                      {res.totalAmount}
                    </td>
                    <td className="p-2 border">
                      <button
                        onClick={() => handleDelete(res.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </motion.div>
        )}
      </div>
    </div>
  );
}
