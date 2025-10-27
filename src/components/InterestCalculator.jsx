import React, { useState } from "react";

export default function InterestCalculator() {
const [principal, setPrincipal] = useState("");
const [monthlyRate, setMonthlyRate] = useState("");
const [startDate, setStartDate] = useState("");
const [endDate, setEndDate] = useState("");
const [mode, setMode] = useState("monthly");
const [interestType, setInterestType] = useState("simple");
const [results, setResults] = useState([]);

const inclusiveDaysBetween = (start, end) => {
const s = new Date(start + "T00:00:00");
const e = new Date(end + "T00:00:00");
return Math.floor((e - s) / (1000 * 60 * 60 * 24)) + 1;
};

const countMonthsAndDays = (start, end) => {
const s = new Date(start + "T00:00:00");
const e = new Date(end + "T00:00:00");
let months = (e.getFullYear() - s.getFullYear()) * 12 + (e.getMonth() - s.getMonth());
const dayDiff = e.getDate() - s.getDate();
if (dayDiff >= 16) months += 1;
else if (dayDiff >= 6 && dayDiff <= 15) months += 0.5;
else if (dayDiff > 0 && dayDiff < 6) months += dayDiff / 30;
return Math.max(months, 0);
};

const round = (n) => Math.round(n * 100) / 100;

const calculate = () => {
if (!principal || !monthlyRate || !startDate || !endDate) {
alert("Please fill all fields");
return;
}

```
const P = parseFloat(principal);
const rMonthly = parseFloat(monthlyRate);
const totalDays = inclusiveDaysBetween(startDate, endDate);
const totalMonths = countMonthsAndDays(startDate, endDate);

let interest = 0, total = 0;

if (interestType === "simple") {
  if (mode === "daily") {
    const dailyRate = rMonthly / 30 / 100;
    interest = P * dailyRate * totalDays;
  } else {
    interest = P * (rMonthly / 100) * totalMonths;
  }
  total = P + interest;
} else {
  if (mode === "daily") {
    const dailyRate = rMonthly / 30 / 100;
    let remaining = totalDays;
    let currentPrincipal = P;
    let totalInterest = 0;
    while (remaining > 365) {
      const interestBlock = currentPrincipal * dailyRate * 365;
      totalInterest += interestBlock;
      currentPrincipal += interestBlock;
      remaining -= 365;
    }
    if (remaining > 0) {
      const lastInterest = currentPrincipal * dailyRate * remaining;
      totalInterest += lastInterest;
    }
    interest = totalInterest;
    total = P + totalInterest;
  } else {
    const monthlyRateDecimal = rMonthly / 100;
    let remainingMonths = totalMonths;
    let currentPrincipal = P;
    let totalInterest = 0;
    while (remainingMonths > 12) {
      const interestBlock = currentPrincipal * monthlyRateDecimal * 12;
      totalInterest += interestBlock;
      currentPrincipal += interestBlock;
      remainingMonths -= 12;
    }
    if (remainingMonths > 0) {
      const lastInterest = currentPrincipal * monthlyRateDecimal * remainingMonths;
      totalInterest += lastInterest;
    }
    interest = totalInterest;
    total = P + totalInterest;
  }
}

const newResult = {
  id: Date.now(),
  principal: P,
  monthlyRate: rMonthly,
  mode,
  interestType,
  startDate,
  endDate,
  totalDays,
  totalMonths,
  interest: round(interest),
  total: round(total),
};

setResults([newResult, ...results]);
```

};

const deleteResult = (id) => {
setResults(results.filter((r) => r.id !== id));
};

return ( <div className="max-w-3xl mx-auto p-6 bg-white rounded-2xl shadow-lg"> <h2 className="text-2xl font-semibold mb-4">Gold Loan Interest Calculator</h2>

```
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    <label className="flex flex-col">
      <span className="text-sm">Principal (₹)</span>
      <input
        type="number"
        value={principal}
        onChange={(e) => setPrincipal(e.target.value)}
        className="mt-1 p-2 border rounded"
      />
    </label>

    <label className="flex flex-col">
      <span className="text-sm">Monthly Rate (%)</span>
      <input
        type="number"
        step="0.01"
        value={monthlyRate}
        onChange={(e) => setMonthlyRate(e.target.value)}
        className="mt-1 p-2 border rounded"
      />
    </label>

    <label className="flex flex-col">
      <span className="text-sm">Start Date</span>
      <input
        type="date"
        value={startDate}
        onChange={(e) => setStartDate(e.target.value)}
        className="mt-1 p-2 border rounded"
      />
    </label>

    <label className="flex flex-col">
      <span className="text-sm">End Date</span>
      <input
        type="date"
        value={endDate}
        onChange={(e) => setEndDate(e.target.value)}
        className="mt-1 p-2 border rounded"
      />
    </label>
  </div>

  <div className="flex flex-wrap items-center gap-4 mt-4">
    <div>
      <label className="mr-2">Mode:</label>
      <select
        value={mode}
        onChange={(e) => setMode(e.target.value)}
        className="p-2 border rounded"
      >
        <option value="monthly">Monthly</option>
        <option value="daily">Daily</option>
      </select>
    </div>

    <div>
      <label className="mr-2">Interest Type:</label>
      <select
        value={interestType}
        onChange={(e) => setInterestType(e.target.value)}
        className="p-2 border rounded"
      >
        <option value="simple">Simple</option>
        <option value="compound">Compound</option>
      </select>
    </div>

    <button
      onClick={calculate}
      className="ml-auto px-4 py-2 bg-blue-600 text-white rounded hover:opacity-90"
    >
      Calculate
    </button>
  </div>

  {results.length > 0 && (
    <div className="mt-6 space-y-4">
      {results.map((r) => (
        <div
          key={r.id}
          className="p-4 border rounded bg-gray-50 relative shadow-sm"
        >
          <button
            onClick={() => deleteResult(r.id)}
            className="absolute top-2 right-3 text-red-600 font-bold"
          >
            ✖
          </button>
          <h3 className="font-medium mb-2">
            ₹{r.principal} @ {r.monthlyRate}% ({r.interestType})
          </h3>
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
              {r.mode === "daily" ? (
                <tr>
                  <td className="border p-2">Total Days (inclusive)</td>
                  <td className="border p-2">{r.totalDays}</td>
                </tr>
              ) : (
                <tr>
                  <td className="border p-2">Total Months (incl. partial)</td>
                  <td className="border p-2">{r.totalMonths}</td>
                </tr>
              )}
              <tr>
                <td className="border p-2 font-semibold">Interest</td>
                <td className="border p-2 font-semibold">₹{r.interest}</td>
              </tr>
              <tr>
                <td className="border p-2 font-semibold">Total (P + I)</td>
                <td className="border p-2 font-semibold">₹{r.total}</td>
              </tr>
            </tbody>
          </table>
        </div>
      ))}
    </div>
  )}
</div>
```

);
}
