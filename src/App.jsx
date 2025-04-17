// src/App.jsx import React, { useState } from 'react'; import dayjs from 'dayjs'; import './App.css';

function calculateCustomSimpleInterest(principal, rate, startDate, endDate, mode) { const start = dayjs(startDate); const end = dayjs(endDate); let interest = 0; let total = 0; let months = 0; let days = 0;

if (mode === 'monthly') { const totalDays = end.diff(start, 'day'); const fullMonths = Math.floor(totalDays / 30); const remainingDays = totalDays % 30;

if (remainingDays >= 6 && remainingDays <= 16) {
  months = fullMonths + 0.5;
} else if (remainingDays > 16) {
  months = fullMonths + 1;
} else {
  months = fullMonths;
  days = remainingDays;
}

const monthlyInterest = (principal * rate) / 100;
interest = monthlyInterest * months + (days * (monthlyInterest / 30));

} else { const totalDays = end.diff(start, 'day') + 1; days = totalDays; const dailyRate = rate / 30;

let p = principal;
let d = 0;
while (d < totalDays) {
  const remainingDays = totalDays - d;
  if (remainingDays > 365) {
    const partInterest = (p * dailyRate * 365) / 100;
    p += partInterest;
    interest += partInterest;
    d += 365;
  } else {
    const partInterest = (p * dailyRate * remainingDays) / 100;
    interest += partInterest;
    break;
  }
}

}

total = principal + interest; return { interest: interest.toFixed(2), total: total.toFixed(2), months, days }; }

export default function App() { const [principal, setPrincipal] = useState(''); const [rate, setRate] = useState(''); const [startDate, setStartDate] = useState(''); const [endDate, setEndDate] = useState(''); const [mode, setMode] = useState('monthly'); const [type, setType] = useState('simple'); const [result, setResult] = useState(null);

const handleCalculate = () => { if (!principal || !rate || !startDate || !endDate) return; const res = calculateCustomSimpleInterest( parseFloat(principal), parseFloat(rate), startDate, endDate, mode ); setResult(res); };

return ( <div className="min-h-screen p-6 bg-gray-100 flex flex-col items-center justify-center dark:bg-gray-900"> <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg w-full max-w-md space-y-4"> <h1 className="text-xl font-bold text-center dark:text-white">Interest Calculator</h1>

<input
      type="number"
      placeholder="Principal Amount"
      value={principal}
      onChange={(e) => setPrincipal(e.target.value)}
      className="w-full p-2 rounded-lg border dark:bg-gray-700 dark:text-white"
      onFocus={(e) => e.target.value === '0' && setPrincipal('')}
    />
    <input
      type="number"
      placeholder="Interest Rate (monthly)"
      value={rate}
      onChange={(e) => setRate(e.target.value)}
      className="w-full p-2 rounded-lg border dark:bg-gray-700 dark:text-white"
      onFocus={(e) => e.target.value === '0' && setRate('')}
    />
    <div className="flex flex-col">
      <label className="text-sm dark:text-gray-200">Start Date</label>
      <input
        type="date"
        value={startDate}
        onChange={(e) => setStartDate(e.target.value)}
        className="w-full p-2 rounded-lg border dark:bg-gray-700 dark:text-white"
      />
    </div>
    <div className="flex flex-col">
      <label className="text-sm dark:text-gray-200">End Date</label>
      <input
        type="date"
        value={endDate}
        onChange={(e) => setEndDate(e.target.value)}
        className="w-full p-2 rounded-lg border dark:bg-gray-700 dark:text-white"
      />
    </div>

    <div className="flex justify-between">
      <select
        value={mode}
        onChange={(e) => setMode(e.target.value)}
        className="p-2 rounded-lg border dark:bg-gray-700 dark:text-white"
      >
        <option value="monthly">Monthly</option>
        <option value="daily">Daily</option>
      </select>

      <select
        value={type}
        onChange={(e) => setType(e.target.value)}
        className="p-2 rounded-lg border dark:bg-gray-700 dark:text-white"
        disabled
      >
        <option value="simple">Simple</option>
        <option value="compound">Compound</option>
      </select>
    </div>

    <button
      onClick={handleCalculate}
      className="w-full bg-blue-600 text-white py-2 rounded-xl hover:bg-blue-700 transition"
    >
      Calculate
    </button>

    {result && (
      <div className="mt-4 bg-gray-50 dark:bg-gray-700 p-4 rounded-lg text-sm text-gray-800 dark:text-gray-100">
        <p><strong>Interest:</strong> ₹{result.interest}</p>
        <p><strong>Total Amount:</strong> ₹{result.total}</p>
        {mode === 'monthly' ? (
          <p><strong>Months:</strong> {result.months} {result.days ? `+ ${result.days} days` : ''}</p>
        ) : (
          <p><strong>Days:</strong> {result.days}</p>
        )}
      </div>
    )}
  </div>
</div>

); }
