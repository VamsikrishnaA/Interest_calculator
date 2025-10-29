import React, { useState } from "react";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { Calculator, Calendar, Trash2 } from "lucide-react";

export default function InterestCalculator() {
  const [principal, setPrincipal] = useState("");
  const [rate, setRate] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [mode, setMode] = useState("daily");
  const [type, setType] = useState("simple");
  const [results, setResults] = useState([]);

  const formatDate = (date) => {
    if (!date) return "";
    const d = new Date(date);
    return `${String(d.getDate()).padStart(2, "0")}-${String(
      d.getMonth() + 1
    ).padStart(2, "0")}-${d.getFullYear()}`;
  };

  const calculateInterest = () => {
    if (!principal || !rate || !startDate || !endDate) return;

    const s = new Date(startDate);
    const e = new Date(endDate);
    const diffDays = Math.floor((e - s) / (1000 * 60 * 60 * 24)) + 1;

    let totalInterest = 0;
    let totalAmount = 0;
    let months = 0;

    if (mode === "daily") {
      const dailyRate = rate / 30 / 100;
      if (type === "simple") {
        totalInterest = principal * dailyRate * diffDays;
        totalAmount = Number(principal) + totalInterest;
      } else {
        let remainingDays = diffDays;
        let currentPrincipal = principal;
        while (remainingDays > 365) {
          const yearlyInterest = currentPrincipal * dailyRate * 365;
          currentPrincipal += yearlyInterest;
          remainingDays -= 365;
        }
        totalInterest = currentPrincipal * dailyRate * remainingDays;
        totalAmount = currentPrincipal + totalInterest;
      }
    } else {
      months =
        (e.getFullYear() - s.getFullYear()) * 12 + (e.getMonth() - s.getMonth());
      if (e.getDate() - s.getDate() >= 16) months += 1;
      else if (e.getDate() - s.getDate() >= 6) months += 0.5;

      const monthlyRate = rate / 100;
      if (type === "simple") {
        totalInterest = principal * monthlyRate * months;
        totalAmount = Number(principal) + totalInterest;
      } else {
        let remainingMonths = months;
        let currentPrincipal = principal;
        while (remainingMonths > 12) {
          const yearlyInterest = currentPrincipal * monthlyRate * 12;
          currentPrincipal += yearlyInterest;
          remainingMonths -= 12;
        }
        totalInterest = currentPrincipal * monthlyRate * remainingMonths;
        totalAmount = currentPrincipal + totalInterest;
      }
    }

    const newResult = {
      id: Date.now(),
      principal: Number(principal),
      rate: Number(rate),
      mode,
      type,
      startDate: formatDate(startDate),
      endDate: formatDate(endDate),
      totalInterest: totalInterest.toFixed(2),
      totalAmount: totalAmount.toFixed(2),
      duration: mode === "daily" ? `${diffDays} days` : `${months} months`,
    };

    setResults([newResult, ...results]);
  };

  const deleteResult = (id) => {
    setResults(results.filter((r) => r.id !== id));
  };

  const Toggle = ({ label1, label2, value, setValue }) => (
    <div className="flex items-center gap-2">
      <span className={value === label1.toLowerCase() ? "text-yellow-400" : "text-gray-400"}>
        {label1}
      </span>
      <div
        onClick={() =>
          setValue(value === label1.toLowerCase() ? label2.toLowerCase() : label1.toLowerCase())
        }
        className="w-12 h-6 bg-gray-700 rounded-full relative cursor-pointer transition-all duration-300"
      >
        <motion.div
          className="absolute top-0.5 left-0.5 w-5 h-5 bg-yellow-400 rounded-full"
          animate={{ x: value === label1.toLowerCase() ? 0 : 24 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        />
      </div>
      <span className={value === label2.toLowerCase() ? "text-yellow-400" : "text-gray-400"}>
        {label2}
      </span>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white flex flex-col items-center py-10 px-4">
      <motion.h1
        className="text-3xl font-bold mb-6 flex items-center gap-2"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Calculator className="text-yellow-400" /> Gold Loan Interest Calculator
      </motion.h1>

      <div className="bg-gray-800/60 backdrop-blur-md p-6 rounded-2xl w-full max-w-md shadow-lg space-y-4">
        <div className="flex gap-2">
          <input
            type="number"
            placeholder="Principal (₹)"
            className="w-1/2 p-2 rounded-lg bg-gray-700 text-white outline-none"
            value={principal}
            onChange={(e) => setPrincipal(e.target.value)}
          />
          <input
            type="number"
            placeholder="Interest %"
            className="w-1/2 p-2 rounded-lg bg-gray-700 text-white outline-none"
            value={rate}
            onChange={(e) => setRate(e.target.value)}
          />
        </div>

        <div className="flex gap-2 items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="text-yellow-400" />
            <input
              type="date"
              className="p-2 rounded-lg bg-gray-700 text-white outline-none"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
            <input
              type="date"
              className="p-2 rounded-lg bg-gray-700 text-white outline-none"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </div>

        <div className="flex justify-between items-center mt-3">
          <Toggle label1="Daily" label2="Monthly" value={mode} setValue={setMode} />
          <Toggle label1="Simple" label2="Compound" value={type} setValue={setType} />
        </div>

        <motion.button
          onClick={calculateInterest}
          whileTap={{ scale: 0.9 }}
          className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-semibold py-2 rounded-xl transition-all"
        >
          Calculate
        </motion.button>
      </div>

      <div className="mt-8 w-full max-w-md space-y-4">
        {results.map((res) => (
          <motion.div
            key={res.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-800/70 backdrop-blur-md p-5 rounded-2xl shadow-lg"
          >
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-lg font-bold text-yellow-400">
                ₹{res.principal} @ {res.rate}%
              </h2>
              <button
                onClick={() => deleteResult(res.id)}
                className="text-red-400 hover:text-red-500"
              >
                <Trash2 size={18} />
              </button>
            </div>
            <p>
              <strong>Mode:</strong> {res.mode} ({res.duration})
            </p>
            <p>
              <strong>Type:</strong> {res.type}
            </p>
            <p>
              <strong>Start:</strong> {res.startDate}
            </p>
            <p>
              <strong>End:</strong> {res.endDate}
            </p>
            <p>
              <strong>Interest:</strong> ₹{res.totalInterest}
            </p>
            <p>
              <strong>Total:</strong> ₹{res.totalAmount}
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}