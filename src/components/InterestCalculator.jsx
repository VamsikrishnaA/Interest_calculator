import React, { useEffect, useState } from "react";

/**
 * InterestCalculator (PWA-ready)
 * - Shows "Install App" button (manual)
 * - Persists results in localStorage
 * - Uses inclusive-day count and monthly partial rules
 * - Monthly compounding in 12-month blocks, daily compounding in 365-day blocks
 */

export default function InterestCalculator() {
  const [principal, setPrincipal] = useState("");
  const [monthlyRate, setMonthlyRate] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [mode, setMode] = useState("monthly");
  const [interestType, setInterestType] = useState("simple");
  const [results, setResults] = useState([]);
  const [installAvailable, setInstallAvailable] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  // Load saved results from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("goldcalc_results");
    if (saved) {
      try {
        setResults(JSON.parse(saved));
      } catch {}
    }
  }, []);

  // Save results whenever they change
  useEffect(() => {
    localStorage.setItem("goldcalc_results", JSON.stringify(results));
  }, [results]);

  // Listen for beforeinstallprompt forwarded from index.html
  useEffect(() => {
    const handler = () => {
      // the site-level script stores the event on window.deferredInstallPrompt
      if (window.deferredInstallPrompt) {
        setDeferredPrompt(window.deferredInstallPrompt);
        setInstallAvailable(true);
      }
    };
    window.addEventListener("load", handler);
    // Also check immediately
    if (window.deferredInstallPrompt) {
      setDeferredPrompt(window.deferredInstallPrompt);
      setInstallAvailable(true);
    }
    return () => window.removeEventListener("load", handler);
  }, []);

  // Helper functions: inclusive days and months count (your rules)
  const inclusiveDaysBetween = (start, end) => {
    const s = new Date(start + "T00:00:00");
    const e = new Date(end + "T00:00:00");
    return Math.floor((e - s) / (1000 * 60 * 60 * 24)) + 1;
  };

  const getMonthsCount = (startISO, endISO) => {
    const start = new Date(startISO + "T00:00:00");
    const end = new Date(endISO + "T00:00:00");
    if (end < start) return { error: "invalid" };

    function addOneMonth(d) {
      const y = d.getFullYear();
      const m = d.getMonth();
      const day = d.getDate();
      const next = new Date(y, m + 1, day);
      if (next.getDate() !== day) next.setDate(0);
      return next;
    }

    let cursor = new Date(start);
    let fullMonths = 0;
    while (true) {
      const next = addOneMonth(cursor);
      if (next <= end) {
        fullMonths++;
        cursor = next;
      } else break;
    }

    const daysCovered = Math.floor((cursor - start) / (1000 * 60 * 60 * 24));
    const totalInclusive = inclusiveDaysBetween(startISO, endISO);
    const remainingDays = totalInclusive - daysCovered;

    let monthsCount = fullMonths;
    let partialRule = "days";
    if (remainingDays < 6) partialRule = "days";
    else if (remainingDays >= 6 && remainingDays <= 16) {
      monthsCount += 0.5;
      partialRule = "half";
    } else {
      monthsCount += 1;
      partialRule = "full";
    }

    return { fullMonths, remainingDays, monthsCount, partialRule, totalInclusive };
  };

  const round = (n, digits = 2) => {
    const m = Math.pow(10, digits);
    return Math.round(n * m) / m;
  };

  // Calculation logic (same as we discussed)
  const calculate = () => {
    if (!principal || !monthlyRate || !startDate || !endDate) {
      alert("Please fill all fields");
      return;
    }
    const P = Number(principal);
    const rMonthly = Number(monthlyRate);
    const totalDays = inclusiveDaysBetween(startDate, endDate);
    const infoMonths = getMonthsCount(startDate, endDate);

    let interest = 0;
    let total = 0;
    let extra = {};

    if (interestType === "simple") {
      if (mode === "daily") {
        const dailyRate = rMonthly / 30 / 100;
        interest = P * dailyRate * totalDays;
      } else {
        // monthly simple using monthsCount
        interest = P * (rMonthly / 100) * infoMonths.monthsCount;
        if (infoMonths.partialRule === "days") {
          // if partial treated as days, add day-portion
          const dailyRate = rMonthly / 30 / 100;
          const dayPortion = P * dailyRate * infoMonths.remainingDays;
          interest = P * (rMonthly / 100) * infoMonths.fullMonths + dayPortion;
        }
        extra = infoMonths;
      }
      total = P + interest;
    } else {
      // Compound
      if (mode === "daily") {
        const dailyRate = rMonthly / 30 / 100;
        let remaining = totalDays;
        let currP = P;
        let acc = 0;
        while (remaining >= 365) {
          const blockInt = currP * dailyRate * 365;
          acc += blockInt;
          currP += blockInt;
          remaining -= 365;
        }
        if (remaining > 0) {
          const rem = currP * dailyRate * remaining;
          acc += rem;
        }
        interest = acc;
        total = P + interest;
        extra = { totalDays };
      } else {
        // monthly compounding: compound per 12 months
        let months = infoMonths.monthsCount;
        let currP = P;
        let acc = 0;
        while (months >= 12) {
          const blockInt = currP * (rMonthly / 100) * 12;
          acc += blockInt;
          currP += blockInt;
          months -= 12;
        }
        if (months > 0) {
          const rem = currP * (rMonthly / 100) * months;
          acc += rem;
        }
        interest = acc;
        total = P + interest;
        extra = infoMonths;
      }
    }

    const entry = {
      id: Date.now(),
      principal: round(P),
      monthlyRate: rMonthly,
      mode,
      interestType,
      startDate,
      endDate,
      interest: round(interest),
      total: round(total),
      ...extra,
    };

    setResults((prev) => [entry, ...prev]);
  };

  const deleteResult = (id) => setResults((prev) => prev.filter((r) => r.id !== id));

  // Manual install button handler — uses deferred prompt stored on window
  const handleInstallClick = async () => {
    const prompt = deferredPrompt || window.deferredInstallPrompt;
    if (!prompt) {
      alert("Install prompt not available on this device/browser.");
      return;
    }
    prompt.prompt();
    const choice = await prompt.userChoice;
    // reset
    setDeferredPrompt(null);
    setInstallAvailable(false);
    window.deferredInstallPrompt = null;
    if (choice.outcome === "accepted") {
      console.log("User accepted the install");
    } else {
      console.log("User dismissed the install");
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white dark:bg-gray-900 dark:text-white rounded-2xl shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold">Gold Loan Interest Calculator</h2>
        {installAvailable && (
          <button
            onClick={handleInstallClick}
            className="px-3 py-1 bg-yellow-500 rounded text-black text-sm"
          >
            📲 Install App
          </button>
        )}
      </div>

      {/* Inputs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <label className="flex flex-col">
          <span className="text-sm">Principal (₹)</span>
          <input type="number" value={principal} onChange={(e) => setPrincipal(e.target.value)} className="mt-1 p-2 border rounded" />
        </label>

        <label className="flex flex-col">
          <span className="text-sm">Monthly Rate (%)</span>
          <input type="number" step="0.01" value={monthlyRate} onChange={(e) => setMonthlyRate(e.target.value)} className="mt-1 p-2 border rounded" />
        </label>

        <label className="flex flex-col">
          <span className="text-sm">Start Date</span>
          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="mt-1 p-2 border rounded" />
        </label>

        <label className="flex flex-col">
          <span className="text-sm">End Date</span>
          <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="mt-1 p-2 border rounded" />
        </label>
      </div>

      <div className="flex items-center gap-4 mt-4">
        <div>
          <label className="mr-2">Mode</label>
          <select value={mode} onChange={(e) => setMode(e.target.value)} className="p-2 border rounded">
            <option value="monthly">Monthly</option>
            <option value="daily">Daily</option>
          </select>
        </div>

        <div>
          <label className="mr-2">Type</label>
          <select value={interestType} onChange={(e) => setInterestType(e.target.value)} className="p-2 border rounded">
            <option value="simple">Simple</option>
            <option value="compound">Compound</option>
          </select>
        </div>

        <button onClick={calculate} className="ml-auto px-4 py-2 bg-blue-600 text-white rounded">Calculate</button>
      </div>

      {/* Results */}
      <div className="mt-6 space-y-4">
        {results.map((r) => (
          <div key={r.id} className="border rounded p-4 bg-gray-50 dark:bg-gray-800 relative">
            <button onClick={() => deleteResult(r.id)} className="absolute top-2 right-3 text-red-600">✖</button>
            <div className="font-semibold">₹{r.principal} @ {r.monthlyRate}% ({r.interestType})</div>
            <div className="text-sm">Mode: {r.mode}</div>
            <div className="text-sm">From {r.startDate} to {r.endDate}</div>
            <div className="mt-1 text-sm font-medium">
              Total {r.mode === "daily" ? "Days" : "Months"}: {r.mode === "daily" ? r.totalDays : r.totalMonths ?? r.monthsCount ?? (r.monthsCount || r.totalMonths)}
            </div>
            <div className="mt-2">Interest: <span className="font-semibold">₹{r.interest}</span></div>
            <div>Total: <span className="font-semibold">₹{r.total}</span></div>
          </div>
        ))}
      </div>
    </div>
  );
}