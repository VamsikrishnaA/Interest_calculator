import React, { useState } from "react";
import dayjs from "dayjs";

const InterestCalculator = () => {
  const [principal, setPrincipal] = useState("");
  const [rate, setRate] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [mode, setMode] = useState("Monthly");
  const [interestType, setInterestType] = useState("Simple");
  const [history, setHistory] = useState([]);

  const calculateInterest = () => {
    if (!principal || !rate || !startDate || !endDate) return;

    const start = dayjs(startDate);
    const end = dayjs(endDate);
    const days = end.diff(start, "day") + 1;

    let interest = 0;
    if (mode === "Monthly") {
      const months = Math.floor(days / 30);
      const remDays = days % 30;

      let monthsCount = months;
      if (remDays > 16) monthsCount += 1;
      else if (remDays >= 6) monthsCount += 0.5;

      interest =
        interestType === "Simple"
          ? (principal * rate * monthsCount) / 100
          : calculateCompound(principal, rate, monthsCount);
    } else {
      const dailyRate = rate / 30;
      interest =
        interestType === "Simple"
          ? (principal * dailyRate * days) / 100
          : calculateCompound(principal, dailyRate, days);
    }

    const total = Number(principal) + Number(interest);

    const formatDate = (dateStr) => dayjs(dateStr).format("DD-MM-YYYY");

    const result = {
      id: Date.now(),
      principal,
      rate,
      start: formatDate(startDate),
      end: formatDate(endDate),
      mode,
      interestType,
      interest: interest.toFixed(2),
      total: total.toFixed(2),
      timestamp: dayjs().format("DD-MM-YYYY, HH:mm:ss"),
    };

    setHistory([result, ...history]);
  };

  const calculateCompound = (principal, rate, duration) => {
    let total = principal;
    const years = Math.floor(duration / 12);
    const monthsLeft = duration % 12;

    for (let i = 0; i < years; i++) {
      const yearlyInterest = (total * rate * 12) / 100;
      total += yearlyInterest;
    }
    const remainingInterest = (total * rate * monthsLeft) / 100;
    total += remainingInterest;
    return total - principal;
  };

  const deleteEntry = (id) => {
    setHistory(history.filter((item) => item.id !== id));
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-start bg-gradient-to-b from-black via-neutral-900 to-black text-white p-5">
      <div className="w-full max-w-md bg-neutral-950 bg-opacity-90 shadow-lg rounded-2xl p-6 border border-neutral-800 relative">
        <h1 className="text-2xl font-bold text-yellow-400 mb-4">
          Gold Loan Interest Calculator
        </h1>
        <div className="absolute top-4 right-4 text-sm text-gray-400 space-y-1">
          <div>Mode: {mode.toLowerCase()}</div>
          <div>Type: {interestType.toLowerCase()}</div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block mb-1 text-sm text-gray-400">Principal (₹)</label>
            <input
              type="number"
              value={principal}
              onChange={(e) => setPrincipal(e.target.value)}
              className="w-full p-2 bg-neutral-900 border border-neutral-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-yellow-400"
            />
          </div>

          <div>
            <label className="block mb-1 text-sm text-gray-400">Monthly Rate (%)</label>
            <input
              type="number"
              value={rate}
              onChange={(e) => setRate(e.target.value)}
              className="w-full p-2 bg-neutral-900 border border-neutral-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-yellow-400"
            />
          </div>

          <div>
            <label className="block mb-1 text-sm text-gray-400">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full p-2 bg-neutral-900 border border-neutral-700 rounded-lg"
            />
          </div>

          <div>
            <label className="block mb-1 text-sm text-gray-400">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full p-2 bg-neutral-900 border border-neutral-700 rounded-lg"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block mb-1 text-sm text-gray-400">Mode</label>
              <select
                value={mode}
                onChange={(e) => setMode(e.target.value)}
                className="w-full p-2 bg-neutral-900 border border-neutral-700 rounded-lg"
              >
                <option>Monthly</option>
                <option>Daily</option>
              </select>
            </div>
            <div>
              <label className="block mb-1 text-sm text-gray-400">Interest</label>
              <select
                value={interestType}
                onChange={(e) => setInterestType(e.target.value)}
                className="w-full p-2 bg-neutral-900 border border-neutral-700 rounded-lg"
              >
                <option>Simple</option>
                <option>Compound</option>
              </select>
            </div>
          </div>

          <button
            onClick={calculateInterest}
            className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-semibold py-2 rounded-lg transition-all duration-200"
          >
            Calculate
          </button>
        </div>
      </div>

      <div className="mt-6 w-full max-w-md space-y-4">
        {history.map((item) => (
          <div
            key={item.id}
            className="bg-neutral-950 bg-opacity-90 border border-neutral-800 rounded-2xl p-4 shadow-lg relative"
          >
            <div className="absolute top-3 right-3">
              <button onClick={() => deleteEntry(item.id)} className="text-red-500">
                🗑️
              </button>
            </div>

            <h2 className="text-lg font-semibold text-yellow-400">
              ₹{item.principal} @ {item.rate}%
            </h2>
            <p className="text-sm text-gray-400">
              {item.interestType.toLowerCase()} • {item.mode.toLowerCase()}
            </p>
            <p className="text-xs text-gray-500 mt-1">{item.timestamp}</p>

            <div className="mt-3 text-sm space-y-1">
              <p>
                <span className="text-gray-400">Start:</span>{" "}
                <span className="text-white">{item.start}</span>
              </p>
              <p>
                <span className="text-gray-400">End:</span>{" "}
                <span className="text-white">{item.end}</span>
              </p>
            </div>

            <div className="mt-2 flex justify-between font-semibold">
              <p className="text-green-400">Interest ₹{item.interest}</p>
              <p className="text-yellow-400">Total (P+I) ₹{item.total}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default InterestCalculator;