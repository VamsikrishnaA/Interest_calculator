import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2 } from "lucide-react";

export default function InterestCalculator() {
  const [principal, setPrincipal] = useState("");
  const [rate, setRate] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [mode, setMode] = useState("daily");
  const [type, setType] = useState("simple");
  const [results, setResults] = useState([]);

  const calculateInterest = () => {
    if (!principal || !rate || !startDate || !endDate) {
      alert("Please fill all fields!");
      return;
    }

    const p = parseFloat(principal);
    const r = parseFloat(rate);
    const start = new Date(startDate);
    const end = new Date(endDate);

    // Include both start and end dates
    const timeDiff = end.getTime() - start.getTime();
    const days = Math.floor(timeDiff / (1000 * 3600 * 24)) + 1;

    let interest = 0;
    let total = 0;

    if (mode === "daily") {
      const dailyRate = r / 30 / 100;
      if (type === "simple") {
        interest = p * dailyRate * days;
      } else {
        // Compound interest daily, 365-block logic
        let remainingDays = days;
        let principalTemp = p;
        while (remainingDays > 0) {
          const blockDays = Math.min(remainingDays, 365);
          const blockInterest = principalTemp * dailyRate * blockDays;
          principalTemp += blockInterest;
          remainingDays -= blockDays;
        }
        interest = principalTemp - p;
      }
      total = p + interest;
    } else {
      // Monthly mode
      const months = calculateMonths(start, end);
      if (type === "simple") {
        interest = p * (r / 100) * months;
      } else {
        // Compound logic: for every 12 months, compound
        let remainingMonths = months;
        let principalTemp = p;
        while (remainingMonths > 0) {
          const blockMonths = Math.min(remainingMonths, 12);
          const blockInterest = principalTemp * (r / 100) * blockMonths;
          principalTemp += blockInterest;
          remainingMonths -= blockMonths;
        }
        interest = principalTemp - p;
      }
      total = p + interest;
    }

    const newResult = {
      id: Date.now(),
      principal: p,
      rate: r,
      startDate,
      endDate,
      mode,
      type,
      interest: interest.toFixed(2),
      total: total.toFixed(2),
      duration: mode === "daily" ? `${days} days` : `${calculateMonths(start, end)} months`,
    };

    setResults([newResult, ...results]);
  };

  const calculateMonths = (start, end) => {
    const totalMonths = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
    const extraDays = end.getDate() - start.getDate();

    let months = totalMonths;
    if (extraDays >= 16) months += 1;
    else if (extraDays >= 6) months += 0.5;

    return months < 0 ? 0 : months;
  };

  const deleteResult = (id) => {
    setResults(results.filter((res) => res.id !== id));
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-start bg-gradient-to-b from-[#0b0b0b] to-[#121212] p-4">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-2xl font-bold text-[#FFD700] mb-6 mt-6 text-center"
      >
        Gold Loan Interest Calculator
      </motion.h1>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[#1e1e1e] rounded-2xl p-6 shadow-xl w-full max-w-md"
      >
        <div className="flex flex-col gap-4">
          <input
            type="number"
            placeholder="Principal (₹)"
            className="bg-[#2b2b2b] p-3 rounded-lg text-white focus:outline-none"
            value={principal}
            onChange={(e) => setPrincipal(e.target.value)}
          />
          <input
            type="number"
            placeholder="Interest Rate (%)"
            className="bg-[#2b2b2b] p-3 rounded-lg text-white focus:outline-none"
            value={rate}
            onChange={(e) => setRate(e.target.value)}
          />
          <div className="flex gap-2">
            <input
              type="date"
              className="bg-[#2b2b2b] p-3 rounded-lg text-white w-1/2 focus:outline-none"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
            <input
              type="date"
              className="bg-[#2b2b2b] p-3 rounded-lg text-white w-1/2 focus:outline-none"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>

          <div className="flex gap-2">
            <select
              className="bg-[#2b2b2b] p-3 rounded-lg text-white w-1/2 focus:outline-none"
              value={mode}
              onChange={(e) => setMode(e.target.value)}
            >
              <option value="daily">Daily</option>
              <option value="monthly">Monthly</option>
            </select>
            <select
              className="bg-[#2b2b2b] p-3 rounded-lg text-white w-1/2 focus:outline-none"
              value={type}
              onChange={(e) => setType(e.target.value)}
            >
              <option value="simple">Simple</option>
              <option value="compound">Compound</option>
            </select>
          </div>

          <button
            onClick={calculateInterest}
            className="bg-[#FFD700] hover:bg-[#e6c200] text-black font-semibold py-3 rounded-lg transition-all"
          >
            Calculate
          </button>
        </div>
      </motion.div>

      <AnimatePresence>
        {results.map((res) => (
          <motion.div
            key={res.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            layout
            className="bg-[#1e1e1e] text-white rounded-2xl shadow-lg p-4 mt-4 w-full max-w-md border border-[#FFD700]/30"
          >
            <div className="flex justify-between items-center mb-2">
              <h2 className="font-semibold text-[#FFD700]">₹{res.principal} @ {res.rate}%</h2>
              <button onClick={() => deleteResult(res.id)} className="text-red-400 hover:text-red-600">
                <Trash2 size={18} />
              </button>
            </div>
            <p><strong>Mode:</strong> {res.mode}</p>
            <p><strong>Type:</strong> {res.type}</p>
            <p><strong>Start Date:</strong> {res.startDate}</p>
            <p><strong>End Date:</strong> {res.endDate}</p>
            <p><strong>Duration:</strong> {res.duration}</p>
            <p><strong>Interest:</strong> ₹{res.interest}</p>
            <p><strong>Total:</strong> ₹{res.total}</p>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}