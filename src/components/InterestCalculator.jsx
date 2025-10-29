import React, { useState } from "react";
import dayjs from "dayjs";
import "./InterestCalculator.css"; // Keep your CSS file same as before

export default function InterestCalculator() {
  const [principal, setPrincipal] = useState("");
  const [interestRate, setInterestRate] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [interestType, setInterestType] = useState("monthly");
  const [mode, setMode] = useState("simple");
  const [results, setResults] = useState([]);

  const formatDate = (date) => dayjs(date).format("DD-MM-YYYY");

  const calculateInterest = () => {
    if (!principal || !interestRate || !startDate || !endDate) return;

    const start = dayjs(startDate);
    const end = dayjs(endDate);
    const totalDays = end.diff(start, "day") + 1;

    let totalInterest = 0;
    let totalAmount = 0;
    let remainingDays = totalDays;
    let updatedPrincipal = parseFloat(principal);
    const rate = parseFloat(interestRate);

    if (mode === "compound") {
      // Custom compound logic: add interest to principal every 365 days
      while (remainingDays > 0) {
        const daysBlock = Math.min(365, remainingDays);
        const dailyRate = (rate / 30) / 100;
        const interestBlock = updatedPrincipal * dailyRate * daysBlock;
        totalInterest += interestBlock;
        remainingDays -= daysBlock;
        if (remainingDays > 0) updatedPrincipal += interestBlock;
      }
      totalAmount = updatedPrincipal;
    } else {
      // Simple interest
      if (interestType === "monthly") {
        const months = Math.floor(totalDays / 30);
        totalInterest = (principal * rate * months) / 100;
      } else {
        const dailyRate = (rate / 30) / 100;
        totalInterest = principal * dailyRate * totalDays;
      }
      totalAmount = parseFloat(principal) + totalInterest;
    }

    const newResult = {
      id: Date.now(),
      principal,
      rate: rate,
      start: formatDate(startDate),
      end: formatDate(endDate),
      days: totalDays,
      interest: totalInterest.toFixed(2),
      total: totalAmount.toFixed(2),
      mode,
      type: interestType,
    };

    setResults([newResult, ...results]);
  };

  const clearAll = () => setResults([]);

  return (
    <div className="interest-app">
      <h2 className="title">Gold Loan Interest Calculator</h2>

      <div className="input-card">
        <input
          type="number"
          placeholder="Principal Amount"
          value={principal}
          onChange={(e) => setPrincipal(e.target.value)}
        />
        <input
          type="number"
          placeholder="Interest Rate (%)"
          value={interestRate}
          onChange={(e) => setInterestRate(e.target.value)}
        />
        <div className="date-group">
          <label>Start Date</label>
          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        </div>
        <div className="date-group">
          <label>End Date</label>
          <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
        </div>

        {/* Toggles */}
        <div className="toggle-group">
          <div className="toggle">
            <span>Mode</span>
            <label className="switch">
              <input
                type="checkbox"
                checked={mode === "compound"}
                onChange={() => setMode(mode === "simple" ? "compound" : "simple")}
              />
              <span className="slider"></span>
            </label>
            <span className="toggle-label">{mode}</span>
          </div>

          <div className="toggle">
            <span>Interest</span>
            <label className="switch">
              <input
                type="checkbox"
                checked={interestType === "daily"}
                onChange={() =>
                  setInterestType(interestType === "monthly" ? "daily" : "monthly")
                }
              />
              <span className="slider"></span>
            </label>
            <span className="toggle-label">{interestType}</span>
          </div>
        </div>

        <button className="calc-btn" onClick={calculateInterest}>
          Calculate
        </button>
        <button className="clear-btn" onClick={clearAll}>
          Clear
        </button>
      </div>

      <div className="results">
        {results.map((res) => (
          <div key={res.id} className="result-card animate-fade-in">
            <h3>₹{res.total}</h3>
            <p>Principal: ₹{res.principal}</p>
            <p>Interest: ₹{res.interest}</p>
            <p>Start: {res.start}</p>
            <p>End: {res.end}</p>
            <p>{res.days} days | {res.mode} | {res.type}</p>
          </div>
        ))}
      </div>
    </div>
  );
}