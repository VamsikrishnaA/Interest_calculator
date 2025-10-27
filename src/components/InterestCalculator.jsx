import React, { useState } from 'react';

// Single-file React component (Tailwind CSS) for the user's gold loan logic.
// Default export a React component so it can be previewed in the canvas.

export default function GoldLoanCalculator() {
  const [principal, setPrincipal] = useState(70000);
  const [monthlyRate, setMonthlyRate] = useState(2.1); // user provides monthly rate directly
  const [startDate, setStartDate] = useState('2021-02-12');
  const [endDate, setEndDate] = useState('2023-02-23');
  const [mode, setMode] = useState('monthly'); // 'monthly' or 'daily'
  const [interestType, setInterestType] = useState('simple'); // 'simple' or 'compound'
  const [result, setResult] = useState(null);

  // Helper: inclusive day count between two dates
  function inclusiveDaysBetween(start, end) {
    const s = new Date(start + 'T00:00:00');
    const e = new Date(end + 'T00:00:00');
    // normalize to midnight UTC- local timezone differences could matter; keep simple
    const msPerDay = 24 * 60 * 60 * 1000;
    const diff = Math.floor((e - s) / msPerDay);
    return diff + 1; // inclusive both dates
  }

  // Helper: count number of full months from start until adding one month would exceed end
  function countFullMonthsAndDays(start, end) {
    const s = new Date(start + 'T00:00:00');
    const e = new Date(end + 'T00:00:00');
    let cursor = new Date(s.getTime());
    let fullMonths = 0;

    function addOneMonth(date) {
      const d = new Date(date.getTime());
      const m = d.getMonth();
      d.setMonth(m + 1);
      // if month overflowed (e.g., Jan 31 -> Mar 3), clamp to last day of prev month
      if (d.getMonth() === (m + 2) % 12) {
        d.setDate(0); // last day of previous month
      }
      return d;
    }

    while (true) {
      const next = addOneMonth(cursor);
      if (next <= e) {
        fullMonths += 1;
        cursor = next;
      } else break;
    }

    // days covered by full months:
    const daysCovered = Math.floor((cursor - s) / (24 * 60 * 60 * 1000));
    const totalInclusive = inclusiveDaysBetween(start, end);
    const remainingDays = totalInclusive - daysCovered;
    return { fullMonths, remainingDays, daysCovered };
  }

  // Main calculation
  function calculate() {
    const P = Number(principal);
    const rMonthly = Number(monthlyRate); // percentage per month (user gives this directly)

    if (!P || P <= 0) {
      alert('Principal should be > 0');
      return;
    }

    const totalDays = inclusiveDaysBetween(startDate, endDate);

    if (interestType === 'simple') {
      if (mode === 'daily') {
        // daily simple: dailyRate = monthlyRate / 30
        const dailyRatePercent = rMonthly / 30;
        const interest = P * (dailyRatePercent / 100) * totalDays;
        const total = P + interest;
        setResult({
          mode,
          interestType,
          principal: P,
          rMonthly,
          totalDays,
          interest: round(interest),
          total: round(total),
          breakdown: { days: totalDays, dailyRatePercent: round(dailyRatePercent, 6) },
        });
      } else {
        // monthly simple using user's custom partial-month rules
        const { fullMonths, remainingDays, daysCovered } = countFullMonthsAndDays(startDate, endDate);
        let monthsCount = fullMonths;
        let extraDaysToCharge = 0;
        let partialMonthLabel = '';

        if (remainingDays < 6) {
          // treat as days
          extraDaysToCharge = remainingDays;
          partialMonthLabel = `${remainingDays} day(s) treated as days`;
        } else if (remainingDays >= 6 && remainingDays <= 16) {
          // half month
          monthsCount += 0.5;
          partialMonthLabel = 'half month (0.5)';
        } else {
          // >16 => full extra month
          monthsCount += 1;
          partialMonthLabel = 'full extra month (1)';
        }

        const interest = P * (rMonthly / 100) * monthsCount;
        // if extraDaysToCharge > 0, include daily portion using daily rate
        let interestDaysPortion = 0;
        if (extraDaysToCharge > 0) {
          const dailyRatePercent = rMonthly / 30;
          interestDaysPortion = P * (dailyRatePercent / 100) * extraDaysToCharge;
        }

        const totalInterest = interest + interestDaysPortion;
        const total = P + totalInterest;

        setResult({
          mode,
          interestType,
          principal: P,
          rMonthly,
          fullMonths,
          remainingDays,
          partialMonthLabel,
          monthsCount,
          daysCovered,
          interest: round(totalInterest),
          total: round(total),
          breakdown: {
            simpleMonthsInterest: round(interest),
            daysInterest: round(interestDaysPortion),
          },
        });
      }
    } else {
      // COMPOUND - use the user's 365-block compounding logic.
      // We'll compute using dailyRate = monthlyRate / 30 (as user requested for compound monthly)
      const dailyRate = (rMonthly / 30) / 100; // fraction
      let remaining = totalDays;
      let currentPrincipal = P;
      let totalInterestAccum = 0;

      const blocks = Math.floor(remaining / 365);
      for (let i = 0; i < blocks; i++) {
        const interestBlock = currentPrincipal * dailyRate * 365;
        totalInterestAccum += interestBlock;
        currentPrincipal += interestBlock; // compound after each 365-day block
        remaining -= 365;
      }

      // remaining days (less than 365) - calculate simple interest on currentPrincipal
      if (remaining > 0) {
        const interestRem = currentPrincipal * dailyRate * remaining;
        totalInterestAccum += interestRem;
      }

      const total = P + totalInterestAccum;
      setResult({
        mode,
        interestType,
        principal: P,
        rMonthly,
        totalDays,
        blocks,
        remainingDays: remaining,
        interest: round(totalInterestAccum),
        total: round(total),
        breakdown: { dailyRate: round(dailyRate * 100, 6) + '% (per day)' },
      });
    }
  }

  function round(n, digits = 2) {
    const m = Math.pow(10, digits);
    return Math.round(n * m) / m;
  }

  function downloadCSV() {
    if (!result) return;
    const rows = [];
    rows.push(['Principal', result.principal]);
    rows.push(['Monthly Rate (%)', result.rMonthly]);
    rows.push(['Mode', result.mode]);
    rows.push(['Interest Type', result.interestType]);
    rows.push(['Total Days', result.totalDays ?? '']);
    if (result.fullMonths !== undefined) rows.push(['Full Months', result.fullMonths]);
    if (result.monthsCount !== undefined) rows.push(['Months Count (incl partial)', result.monthsCount]);
    rows.push(['Interest', result.interest]);
    rows.push(['Total', result.total]);

    const csvContent = rows.map(r => r.map(cell => `"${cell}"`).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'gold_loan_result.csv';
    a.click();
    URL.revokeObjectURL(url);
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
              <option value="compound">Compound (365-block)</option>
            </select>
          </div>

          <button onClick={calculate} className="ml-auto px-4 py-2 bg-blue-600 text-white rounded hover:opacity-90">Calculate</button>
        </div>
      </div>

      <div className="mt-6">
        {result ? (
          <div className="p-4 border rounded bg-gray-50">
            <h3 className="font-medium">Result</h3>
            <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
              <div>Principal: ₹{result.principal}</div>
              <div>Monthly Rate: {result.rMonthly}%</div>
              <div>Interest Type: {result.interestType}</div>
              <div>Mode: {result.mode}</div>
              {result.totalDays !== undefined && <div>Total Days (inclusive): {result.totalDays}</div>}
              {result.fullMonths !== undefined && <div>Full months counted: {result.fullMonths}</div>}
              {result.monthsCount !== undefined && <div>Months count (incl partial): {result.monthsCount}</div>}
              {result.remainingDays !== undefined && <div>Remaining days: {result.remainingDays}</div>}
              <div className="font-semibold">Interest: ₹{result.interest}</div>
              <div className="font-semibold">Total (P + I): ₹{result.total}</div>
            </div>

            {result.partialMonthLabel && <div className="mt-2 text-xs text-gray-600">Partial-month rule: {result.partialMonthLabel}</div>}

            <div className="mt-4 flex gap-2">
              <button onClick={downloadCSV} className="px-3 py-1 border rounded">Download CSV</button>
              <button onClick={() => navigator.clipboard?.writeText(JSON.stringify(result, null, 2))} className="px-3 py-1 border rounded">Copy JSON</button>
            </div>

          </div>
        ) : (
          <div className="text-sm text-gray-600">Enter inputs and press Calculate to see results.</div>
        )}
      </div>

      <div className="mt-6 text-xs text-gray-500">
        Notes:
        <ul className="list-disc list-inside mt-1">
          <li>Monthly rate is used directly as provided (do not divide by 12) — daily rate derived as monthlyRate / 30 when needed.</li>
          <li>Monthly partial-month rules: &lt;6 days = charge as actual days; 6–16 days = half month; &gt;16 days = full extra month.</li>
          <li>Compound mode uses 365-day compounding blocks: after each 365 days interest is added to principal and calculation continues.</li>
        </ul>
      </div>
    </div>
  );
}