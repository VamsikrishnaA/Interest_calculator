import React, { useState } from 'react';

export default function GoldLoanCalculator() {
  const [principal, setPrincipal] = useState(70000);
  const [monthlyRate, setMonthlyRate] = useState(2.1);
  const [startDate, setStartDate] = useState('2021-02-12');
  const [endDate, setEndDate] = useState('2023-02-23');
  const [mode, setMode] = useState('monthly');
  const [interestType, setInterestType] = useState('simple');
  const [result, setResult] = useState(null);

  function inclusiveDaysBetween(start, end) {
    const s = new Date(start + 'T00:00:00');
    const e = new Date(end + 'T00:00:00');
    const diff = Math.floor((e - s) / (24 * 60 * 60 * 1000));
    return diff + 1;
  }

  function countFullMonthsAndDays(start, end) {
    const s = new Date(start + 'T00:00:00');
    const e = new Date(end + 'T00:00:00');
    let cursor = new Date(s.getTime());
    let fullMonths = 0;

    function addOneMonth(date) {
      const d = new Date(date.getTime());
      const m = d.getMonth();
      d.setMonth(m + 1);
      if (d.getMonth() === (m + 2) % 12) d.setDate(0);
      return d;
    }

    while (true) {
      const next = addOneMonth(cursor);
      if (next <= e) {
        fullMonths += 1;
        cursor = next;
      } else break;
    }

    const daysCovered = Math.floor((cursor - s) / (24 * 60 * 60 * 1000));
    const totalInclusive = inclusiveDaysBetween(start, end);
    const remainingDays = totalInclusive - daysCovered;
    return { fullMonths, remainingDays, daysCovered };
  }

  function calculate() {
    const P = Number(principal);
    const rMonthly = Number(monthlyRate);
    if (!P || P <= 0) {
      alert('Principal should be > 0');
      return;
    }

    const totalDays = inclusiveDaysBetween(startDate, endDate);

    if (interestType === 'simple') {
      if (mode === 'daily') {
        const dailyRatePercent = rMonthly / 30;
        const interest = P * (dailyRatePercent / 100) * totalDays;
        const total = P + interest;
        setResult({ mode, interestType, principal: P, rMonthly, totalDays, interest: round(interest), total: round(total) });
      } else {
        const { fullMonths, remainingDays } = countFullMonthsAndDays(startDate, endDate);
        let monthsCount = fullMonths;
        let extraDaysToCharge = 0;

        if (remainingDays < 6) {
          extraDaysToCharge = remainingDays;
        } else if (remainingDays >= 6 && remainingDays <= 16) {
          monthsCount += 0.5;
        } else {
          monthsCount += 1;
        }

        const interest = P * (rMonthly / 100) * monthsCount;
        let interestDaysPortion = 0;
        if (extraDaysToCharge > 0) {
          const dailyRatePercent = rMonthly / 30;
          interestDaysPortion = P * (dailyRatePercent / 100) * extraDaysToCharge;
        }

        const totalInterest = interest + interestDaysPortion;
        const total = P + totalInterest;
        setResult({ mode, interestType, principal: P, rMonthly, fullMonths, remainingDays, monthsCount, interest: round(totalInterest), total: round(total) });
      }
    } else {
      const dailyRate = (rMonthly / 30) / 100;
      let remaining = totalDays;
      let currentPrincipal = P;
      let totalInterestAccum = 0;
      const blocks = Math.floor(remaining / 365);

      for (let i = 0; i < blocks; i++) {
        const interestBlock = currentPrincipal * dailyRate * 365;
        totalInterestAccum += interestBlock;
        currentPrincipal += interestBlock;
        remaining -= 365;
      }

      if (remaining > 0) {
        const interestRem = currentPrincipal * dailyRate * remaining;
        totalInterestAccum += interestRem;
      }

      const total = P + totalInterestAccum;
      setResult({ mode, interestType, principal: P, rMonthly, totalDays, blocks, remainingDays: remaining, interest: round(totalInterestAccum), total: round(total) });
    }
  }

  function round(n, digits = 2) {
    const m = Math.pow(10, digits);
    return Math.round(n * m) / m;
  }

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-2xl shadow-lg">
      <h2 className="text-2xl font-semibold mb-4">Gold Loan Interest Calculator</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <label className="flex flex-col">
          <span className="text-sm">Principal (₹)</span>
          <input type="number" value={principal} onChange={e => setPrincipal(e.target.value)} className="mt-1 p-2 border rounded" />
        </label>

        <label className="flex flex-col">
          <span className="text-sm">Monthly Rate (%)</span>
          <input type="number" step="0.01" value={monthlyRate} onChange={e => setMonthlyRate(e.target.value)} className="mt-1 p-2 border rounded" />
        </label>

        <label className="flex flex-col">
          <span className="text-sm">Start Date</span>
          <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="mt-1 p-2 border rounded" />
        </label>

        <label className="flex flex-col">
          <span className="text-sm">End Date</span>
          <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="mt-1 p-2 border rounded" />
        </label>

        <div className="col-span-1 md:col-span-2 flex gap-4 items-center">
          <div>
            <label className="mr-3">Mode:</label>
            <select value={mode} onChange={e => setMode(e.target.value)} className="p-2 border rounded">
              <option value="monthly">Monthly</option>
              <option value="daily">Daily</option>
            </select>
          </div>

          <div>
            <label className="mr-3">Interest Type:</label>
            <select value={interestType} onChange={e => setInterestType(e.target.value)} className="p-2 border rounded">
              <option value="simple">Simple</option>
              <option value="compound">Compound</option>
            </select>
          </div>

          <button onClick={calculate} className="ml-auto px-4 py-2 bg-blue-600 text-white rounded hover:opacity-90">Calculate</button>
        </div>
      </div>

      {result && (
        <div className="mt-6 p-4 border rounded bg-gray-50">
          <h3 className="font-medium mb-2">Calculation Summary</h3>
          <table className="w-full text-sm border">
            <tbody>
              <tr><td className="border p-2">Principal</td><td className="border p-2">₹{result.principal}</td></tr>
              <tr><td className="border p-2">Monthly Rate</td><td className="border p-2">{result.rMonthly}%</td></tr>
              <tr><td className="border p-2">Interest Type</td><td className="border p-2">{result.interestType}</td></tr>
              <tr><td className="border p-2">Mode</td><td className="border p-2">{result.mode}</td></tr>
              {result.totalDays !== undefined && <tr><td className="border p-2">Total Days (inclusive)</td><td className="border p-2">{result.totalDays}</td></tr>}
              {result.fullMonths !== undefined && <tr><td className="border p-2">Full Months</td><td className="border p-2">{result.fullMonths}</td></tr>}
              {result.monthsCount !== undefined && <tr><td className="border p-2">Months Count (incl partial)</td><td className="border p-2">{result.monthsCount}</td></tr>}
              {result.remainingDays !== undefined && <tr><td className="border p-2">Remaining Days</td><td className="border p-2">{result.remainingDays}</td></tr>}
              <tr><td className="border p-2 font-semibold">Interest</td><td className="border p-2 font-semibold">₹{result.interest}</td></tr>
              <tr><td className="border p-2 font-semibold">Total (P + I)</td><td className="border p-2 font-semibold">₹{result.total}</td></tr>
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-6 text-xs text-gray-500">
        Notes:
        <ul className="list-disc list-inside mt-1">
          <li>Monthly rate is used directly as provided (do not divide by 12).</li>
          <li>Partial month logic: &lt;6 days = actual days, 6–16 = half month, &gt;16 = full month.</li>
          <li>Compound mode compounds every 365 days and continues for remaining days.</li>
        </ul>
      </div>
    </div>
  );
}
