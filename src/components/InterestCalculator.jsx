import React, { useState } from 'react';
import { differenceInDays } from 'date-fns';
import { CalendarDays, Calculator, Percent, CalendarPlus } from 'lucide-react';
import { motion } from 'framer-motion';

const InterestCalculator = () => {
  const [viewMode, setViewMode] = useState('single');
  const [Principal, setPrincipal] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [InterestRate, setInterestRate] = useState('');
  const [interestType, setInterestType] = useState('simple');
  const [rateType, setRateType] = useState('monthly');
  const [result, setResult] = useState(null);

  const calculateInterest = () => {
    const principal = parseFloat(Principal);
    const interestRate = parseFloat(InterestRate);

    if (isNaN(principal) || !startDate || !endDate || isNaN(interestRate)) return;

    const days = differenceInDays(new Date(endDate), new Date(startDate));
    let interest = 0;
    const monthlyRate = interestRate;
    const dailyRate = monthlyRate / 30;
    let totalAmount = 0;

    if (rateType === 'monthly') {
      let months = Math.floor(days / 30);
      const remDays = days % 30;

      if (remDays >= 16) months += 1;
      else if (remDays >= 6) months += 0.5;

      if (interestType === 'simple') {
        interest = (principal * monthlyRate * months) / 100;
      } else {
        let amount = principal;
        const years = Math.floor(days / 365);
        const rem = days % 365;
        for (let i = 0; i < years; i++) {
          const compoundInterest = (amount * monthlyRate * 12) / 100;
          amount += compoundInterest;
        }
        interest = (amount * monthlyRate * Math.floor(rem / 30)) / 100;
        totalAmount = amount + interest;
      }
    } else {
      if (interestType === 'simple') {
        interest = (principal * dailyRate * days) / 100;
      } else {
        let amount = principal;
        const years = Math.floor(days / 365);
        const remDays = days % 365;
        for (let i = 0; i < years; i++) {
          const compoundInterest = (amount * dailyRate * 365) / 100;
          amount += compoundInterest;
        }
        interest = (amount * dailyRate * remDays) / 100;
        totalAmount = amount + interest;
      }
    }

    setResult({
      interest: parseFloat(interest.toFixed(2)),
      total: parseFloat((interestType === 'compound' ? totalAmount : principal + interest).toFixed(2)),
      days
    });
  };

  return (
    <motion.div
      className="p-4 rounded-2xl shadow-md bg-zinc-900 text-white max-w-md mx-auto space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <h1 className="text-3xl font-bold text-center">Interest Calculator</h1>

      {/* Mode Toggle */}
      <div className="flex justify-center gap-4 bg-zinc-800 rounded-full p-1">
        {['single', 'bulk'].map((mode) => (
          <button
            key={mode}
            className={`px-4 py-1 rounded-full text-sm font-medium ${
              viewMode === mode ? 'bg-white text-black' : 'text-white'
            }`}
            onClick={() => setViewMode(mode)}
          >
            {mode.charAt(0).toUpperCase() + mode.slice(1)}
          </button>
        ))}
      </div>

      {viewMode === 'single' && (
        <motion.div
          className="space-y-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {/* Input Fields */}
          <div className="space-y-2">
            <label className="block text-sm">Principal Amount</label>
            <div className="flex items-center bg-zinc-800 px-3 rounded-md">
              <Calculator className="w-4 h-4 mr-2" />
              <input
                type="number"
                value={Principal}
                onChange={(e) => setPrincipal(e.target.value)}
                className="bg-transparent w-full p-2 outline-none"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <div className="w-1/2">
              <label className="block text-sm">Start Date</label>
              <div className="flex items-center bg-zinc-800 px-3 rounded-md">
                <CalendarDays className="w-4 h-4 mr-2" />
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="bg-transparent w-full p-2 outline-none"
                />
              </div>
            </div>
            <div className="w-1/2">
              <label className="block text-sm">End Date</label>
              <div className="flex items-center bg-zinc-800 px-3 rounded-md">
                <CalendarPlus className="w-4 h-4 mr-2" />
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="bg-transparent w-full p-2 outline-none"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <div className="w-1/2">
              <label className="block text-sm">Interest Rate</label>
              <div className="flex items-center bg-zinc-800 px-3 rounded-md">
                <Percent className="w-4 h-4 mr-2" />
                <input
                  type="number"
                  value={InterestRate}
                  onChange={(e) => setInterestRate(e.target.value)}
                  className="bg-transparent w-full p-2 outline-none"
                />
              </div>
            </div>
            <div className="w-1/2">
              <label className="block text-sm">Rate Type</label>
              <select
                value={rateType}
                onChange={(e) => setRateType(e.target.value)}
                className="w-full bg-zinc-800 text-white p-2 rounded-md"
              >
                <option value="monthly">Monthly</option>
                <option value="daily">Daily</option>
              </select>
            </div>
          </div>

          {/* Interest Type Toggle */}
          <div className="flex justify-center gap-6 items-center mt-2">
            {['simple', 'compound'].map((type) => (
              <button
                key={type}
                className={`flex items-center gap-1 px-4 py-1 rounded-full text-sm ${
                  interestType === type ? 'bg-white text-black' : 'bg-zinc-800 text-white'
                }`}
                onClick={() => setInterestType(type)}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>

          {/* Calculate Button */}
          <button
            onClick={calculateInterest}
            className="w-full bg-teal-500 hover:bg-teal-600 text-white py-2 rounded-md font-semibold transition"
          >
            Calculate
          </button>

          {/* Results */}
          {result && (
            <motion.div
              className="bg-zinc-800 rounded-xl p-4 text-center space-y-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="flex justify-between text-lg">
                <span>Interest</span>
                <span className="font-bold">{result.interest}</span>
              </div>
              <div className="flex justify-between text-lg">
                <span>Total Amount</span>
                <span className="font-bold">{result.total}</span>
              </div>
              <div className="text-sm text-zinc-400">{result.days} Days</div>
            </motion.div>
          )}
        </motion.div>
      )}
    </motion.div>
  );
};

export default InterestCalculator;

Let me know when you want to implement bulk mode, PDF/screenshot export, or delete + compare cards!

