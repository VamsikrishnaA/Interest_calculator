import React, { useState } from "react";

function App() {
  const [principal, setPrincipal] = useState("");
  const [rate, setRate] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [interestType, setInterestType] = useState("monthly");
  const [compoundType, setCompoundType] = useState("simple");
  const [interest, setInterest] = useState(null);

  const calculateInterest = () => {
    const p = parseFloat(principal);
    const r = parseFloat(rate);
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(p) || isNaN(r) || !startDate || !endDate || start > end) {
      alert("Please enter valid inputs");
      return;
    }

    let result = 0;
    const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    const months = Math.ceil(days / 30);

    if (compoundType === "compound") {
      // Custom compound logic
      if (interestType === "daily") {
        let dailyRate = r / 30;
        let totalPrincipal = p;
        let remainingDays = days;

        if (days <= 365) {
          result = (totalPrincipal * dailyRate * days) / 100;
        } else {
          let firstYearInterest = (totalPrincipal * dailyRate * 365) / 100;
          totalPrincipal += firstYearInterest;
          remainingDays -= 365;
          let nextInterest = (totalPrincipal * dailyRate * remainingDays) / 100;
          result = firstYearInterest + nextInterest;
        }
      } else {
        let totalPrincipal = p;
        let remainingMonths = months;

        if (months <= 12) {
          result = (totalPrincipal * r * months) / 100;
        } else {
          let firstYearInterest = (totalPrincipal * r * 12) / 100;
          totalPrincipal += firstYearInterest;
          remainingMonths -= 12;
          let nextInterest = (totalPrincipal * r * remainingMonths) / 100;
          result = firstYearInterest + nextInterest;
        }
      }
    } else {
      // Simple interest logic
      if (interestType === "daily") {
        const dailyRate = r / 30;
        result = (p * dailyRate * days) / 100;
      } else {
        result = (p * r * months) / 100;
      }
    }

    setInterest(result.toFixed(2));
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div className="bg-white p-6 rounded-2xl shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-bold mb-4 text-center">Gold Loan Interest Calculator</h1>

        <input
          type="number"
          placeholder="Principal Amount"
          value={principal}
          onChange={(e) => setPrincipal(e.target.value)}
          className="w-full mb-3 px-4 py-2 border rounded-lg"
        />

        <input
          type="number"
          placeholder="Monthly Interest Rate (%)"
          value={rate}
          onChange={(e) => setRate(e.target.value)}
          className="w-full mb-3 px-4 py-2 border rounded-lg"
        />

        <input
          type="date"
          placeholder="Start Date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="w-full mb-3 px-4 py-2 border rounded-lg"
        />

        <input
          type="date"
          placeholder="End Date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="w-full mb-4 px-4 py-2 border rounded-lg"
        />

        {/* Simple vs Compound Toggle */}
        <div className="flex justify-center mb-3">
          <button
            className={`px-4 py-2 rounded-l ${compoundType === "simple" ? "bg-blue-600 text-white" : "bg-gray-200"}`}
            onClick={() => setCompoundType("simple")}
          >
            Simple
          </button>
          <button
            className={`px-4 py-2 rounded-r ${compoundType === "compound" ? "bg-blue-600 text-white" : "bg-gray-200"}`}
            onClick={() => setCompoundType("compound")}
          >
            Compound
          </button>
        </div>

        {/* Interest Type Toggle */}
        <div className="flex justify-center mb-4">
          <button
            className={`px-4 py-2 rounded-l ${interestType === "monthly" ? "bg-green-600 text-white" : "bg-gray-200"}`}
            onClick={() => setInterestType("monthly")}
          >
            Monthly
          </button>
          <button
            className={`px-4 py-2 rounded-r ${interestType === "daily" ? "bg-green-600 text-white" : "bg-gray-200"}`}
            onClick={() => setInterestType("daily")}
          >
            Daily
          </button>
        </div>

        <button
          onClick={calculateInterest}
          className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition"
        >
          Calculate
        </button>

        {interest !== null && (
          <div className="mt-4 text-center">
            <p className="text-xl font-semibold">Interest: ₹{interest}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
