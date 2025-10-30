import React, { useState, useEffect } from "react";

const InterestCalculator = () => {
  const [principal, setPrincipal] = useState("");
  const [rate, setRate] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [mode, setMode] = useState("Monthly");
  const [interestType, setInterestType] = useState("Simple");
  const [result, setResult] = useState(null);
  const [paidStatus, setPaidStatus] = useState("Unpaid");

  // ✅ Auto-refresh when new version detected
  useEffect(() => {
    const checkForUpdate = async () => {
      try {
        const response = await fetch(window.location.href, { cache: "no-store" });
        const newHtml = await response.text();
        const currentHtml = document.documentElement.innerHTML;

        if (newHtml && !newHtml.includes(currentHtml.slice(0, 200))) {
          console.log("🔁 New version detected — reloading...");
          alert("🔄 New update found! Refreshing...");
          window.location.reload(true);
        }
      } catch (error) {
        console.log("⚠️ Update check failed:", error);
      }
    };

    checkForUpdate();
  }, []);

  // ✅ Interest Calculation
  const calculateInterest = () => {
    if (!principal || !rate || !startDate || !endDate) {
      alert("Please fill all fields!");
      return;
    }

    const p = parseFloat(principal);
    const r = parseFloat(rate);
    const start = new Date(startDate);
    const end = new Date(endDate);
    const days =
      Math.floor((end - start) / (1000 * 60 * 60 * 24)) + 1; // inclusive days

    let interest = 0;

    if (mode === "Monthly") {
      // Partial month logic
      let months = Math.floor(days / 30);
      const remainingDays = days % 30;

      if (remainingDays >= 6 && remainingDays <= 16) months += 0.5;
      else if (remainingDays > 16) months += 1;

      if (interestType === "Simple") {
        interest = (p * r * months) / 100;
      }
    } else if (mode === "Daily") {
      const dailyRate = r / 30;
      if (interestType === "Simple") {
        interest = (p * dailyRate * days) / 100;
      }
    }

    const total = p + interest;
    setResult({
      principal: p,
      rate: r,
      days,
      interest: interest.toFixed(2),
      total: total.toFixed(2),
    });
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-black via-gray-900 to-gray-950 text-white p-4">
      <div className="w-full max-w-md bg-gray-900 bg-opacity-60 rounded-2xl p-5 shadow-lg transition-all duration-500">
        <h2 className="text-2xl font-bold text-yellow-400 mb-4 text-center">
          Gold Loan Interest Calculator
        </h2>

        <div className="space-y-3">
          <input
            type="number"
            placeholder="Principal (₹)"
            value={principal}
            onChange={(e) => setPrincipal(e.target.value)}
            className="w-full p-2 rounded bg-gray-800 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-yellow-400"
          />

          <input
            type="number"
            placeholder="Monthly Rate (%)"
            value={rate}
            onChange={(e) => setRate(e.target.value)}
            className="w-full p-2 rounded bg-gray-800 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-yellow-400"
          />

          <div className="flex gap-2">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-1/2 p-2 rounded bg-gray-800 border border-gray-700"
            />
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-1/2 p-2 rounded bg-gray-800 border border-gray-700"
            />
          </div>

          <select
            value={mode}
            onChange={(e) => setMode(e.target.value)}
            className="w-full p-2 rounded bg-gray-800 border border-gray-700"
          >
            <option>Monthly</option>
            <option>Daily</option>
          </select>

          <select
            value={interestType}
            onChange={(e) => setInterestType(e.target.value)}
            className="w-full p-2 rounded bg-gray-800 border border-gray-700"
          >
            <option>Simple</option>
            <option>Compound</option>
          </select>

          <select
            value={paidStatus}
            onChange={(e) => setPaidStatus(e.target.value)}
            className="w-full p-2 rounded bg-gray-800 border border-gray-700"
          >
            <option>Unpaid</option>
            <option>Paid</option>
          </select>

          <button
            onClick={calculateInterest}
            className="w-full py-2 mt-2 bg-yellow-400 text-black font-semibold rounded-lg hover:bg-yellow-500 transition-all"
          >
            Calculate
          </button>
        </div>

        {result && (
          <div className="mt-5 p-4 bg-gray-800 rounded-lg border border-gray-700 text-center animate-fadeIn">
            <p>Days: {result.days}</p>
            <p>Interest: ₹{result.interest}</p>
            <p>Total Amount: ₹{result.total}</p>
            <p className="text-sm text-gray-400 mt-2">
              Status:{" "}
              <span
                className={`${
                  paidStatus === "Paid" ? "text-green-400" : "text-red-400"
                } font-semibold`}
              >
                {paidStatus}
              </span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default InterestCalculator;