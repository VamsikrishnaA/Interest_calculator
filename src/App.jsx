import React, { useState } from "react"; import dayjs from "dayjs"; import "./App.css";

function App() { const [principal, setPrincipal] = useState(0); const [rate, setRate] = useState(0); const [startDate, setStartDate] = useState(""); const [endDate, setEndDate] = useState(""); const [isCompound, setIsCompound] = useState(false); const [mode, setMode] = useState("daily"); const [result, setResult] = useState(null);

const calculateInterest = () => { if (!startDate || !endDate) return;

const start = dayjs(startDate);
const end = dayjs(endDate);
let total = 0;
let interest = 0;
const timeDiff = end.diff(start, mode === "daily" ? "day" : "month", true);

if (isCompound) {
  if (mode === "daily") {
    let days = Math.floor(timeDiff);
    let currentPrincipal = principal;
    const dailyRate = rate / 30 / 100;

    if (days >= 365) {
      const interest1 = currentPrincipal * dailyRate * 365;
      currentPrincipal += interest1;
      const remainingDays = days - 365;
      const interest2 = currentPrincipal * dailyRate * remainingDays;
      interest = interest1 + interest2;
    } else {
      interest = currentPrincipal * dailyRate * days;
    }
    total = principal + interest;
    setResult({ total, time: `${days} Days`, interest });

  } else {
    const start = dayjs(startDate);
    const end = dayjs(endDate);
    const totalMonths = end.diff(start, 'month');
    const remainingDays = end.diff(start.add(totalMonths, 'month'), 'day');

    let monthsCount = totalMonths;
    if (remainingDays > 16) monthsCount += 1;
    else if (remainingDays >= 6) monthsCount += 0.5;

    const monthlyRate = rate / 100;
    let currentPrincipal = principal;
    let tempInterest = 0;

    if (monthsCount >= 12) {
      const interest1 = currentPrincipal * monthlyRate * 12;
      currentPrincipal += interest1;
      const interest2 = currentPrincipal * monthlyRate * (monthsCount - 12);
      tempInterest = interest1 + interest2;
    } else {
      tempInterest = currentPrincipal * monthlyRate * monthsCount;
    }

    // Add interest for <6 days
    if (remainingDays < 6 && remainingDays > 0) {
      const dailyRate = rate / 30 / 100;
      tempInterest += currentPrincipal * dailyRate * remainingDays;
    }

    interest = tempInterest;
    total = principal + interest;
    setResult({ total, time: `${monthsCount} Months`, interest });
  }
} else {
  if (mode === "daily") {
    const days = Math.floor(timeDiff);
    const dailyRate = rate / 30 / 100;
    interest = principal * dailyRate * days;
    total = principal + interest;
    setResult({ total, time: `${days} Days`, interest });
  } else {
    const totalMonths = end.diff(start, 'month');
    const remainingDays = end.diff(start.add(totalMonths, 'month'), 'day');

    let monthsCount = totalMonths;
    if (remainingDays > 16) monthsCount += 1;
    else if (remainingDays >= 6) monthsCount += 0.5;

    const monthlyRate = rate / 100;
    interest = principal * monthlyRate * monthsCount;

    // Add interest for <6 days
    if (remainingDays < 6 && remainingDays > 0) {
      const dailyRate = rate / 30 / 100;
      interest += principal * dailyRate * remainingDays;
    }

    total = principal + interest;
    setResult({ total, time: `${monthsCount} Months`, interest });
  }
}

};

return ( <div className="min-h-screen bg-gradient-to-b from-white to-blue-50 p-4"> <div className="max-w-xl mx-auto bg-white p-6 rounded-2xl shadow-xl space-y-4"> <h1 className="text-2xl font-bold text-blue-600 text-center">Gold Loan Interest Calculator</h1>

<div className="space-y-2">
      <label className="block text-sm font-medium">Principal Amount</label>
      <input
        type="number"
        placeholder="Enter principal"
        className="w-full p-2 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-md"
        value={principal}
        onChange={(e) => setPrincipal(parseFloat(e.target.value))}
      />
    </div>

    <div className="space-y-2">
      <label className="block text-sm font-medium">Interest Rate (Monthly %)</label>
      <input
        type="number"
        placeholder="Enter monthly interest rate"
        className="w-full p-2 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-md"
        value={rate}
        onChange={(e) => setRate(parseFloat(e.target.value))}
      />
    </div>

    <div className="space-y-2">
      <label className="block text-sm font-medium">Start Date</label>
      <input
        type="date"
        placeholder="Select start date"
        className="w-full p-2 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-md"
        value={startDate}
        onChange={(e) => setStartDate(e.target.value)}
      />
    </div>

    <div className="space-y-2">
      <label className="block text-sm font-medium">End Date</label>
      <input
        type="date"
        placeholder="Select end date"
        className="w-full p-2 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-md"
        value={endDate}
        onChange={(e) => setEndDate(e.target.value)}
      />
    </div>

    <div className="flex justify-between items-center">
      <span className="text-sm">Simple</span>
      <label className="relative inline-flex items-center cursor-pointer">
        <input
          type="checkbox"
          className="sr-only peer"
          checked={isCompound}
          onChange={(e) => setIsCompound(e.target.checked)}
        />
        <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
      </label>
      <span className="text-sm">Compound</span>
    </div>

    <div className="flex gap-4">
      <button
        onClick={() => setMode("daily")}
        className={`flex-1 px-4 py-2 rounded-xl ${mode === "daily" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700"}`}
      >
        Daily
      </button>
      <button
        onClick={() => setMode("monthly")}
        className={`flex-1 px-4 py-2 rounded-xl ${mode === "monthly" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700"}`}
      >
        Monthly
      </button>
    </div>

    <button
      onClick={calculateInterest}
      className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-medium px-4 py-2 rounded-xl shadow hover:scale-105 transition"
    >
      Calculate
    </button>

    {result && (
      <div className="mt-4 bg-gray-50 p-4 rounded-xl shadow-md">
        <p className="text-lg font-bold text-green-600">Total Amount: ₹{result.total.toFixed(2)}</p>
        <p className="text-sm text-gray-600">Duration: {result.time}</p>
        <p className="text-sm text-gray-600">Interest: ₹{result.interest.toFixed(2)}</p>
      </div>
    )}
  </div>
</div>

); }

export default App;
