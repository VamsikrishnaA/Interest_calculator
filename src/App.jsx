import React, { useState } from "react";

function App() {
  const [principal, setPrincipal] = useState("");
  const [rate, setRate] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [interestType, setInterestType] = useState("monthly");
  const [interest, setInterest] = useState(null);

  const handleCalculate = () => {
    if (!principal || !rate || !startDate || !endDate) {
      alert("Please fill all fields.");
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (end < start) {
      alert("End date must be after start date.");
      return;
    }

    const p = parseFloat(principal);
    const r = parseFloat(rate);

    let calculatedInterest = 0;

    if (interestType === "monthly") {
      const months =
        end.getMonth() -
        start.getMonth() +
        12 * (end.getFullYear() - start.getFullYear());
      calculatedInterest = (p * r * months) / 100;
    } else {
      const days = Math.ceil(
        (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
      );
      const dailyRate = r / 30;
      calculatedInterest = (p * dailyRate * days) / 100;
    }

    setInterest(calculatedInterest.toFixed(2));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white p-6 rounded-xl shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-4 text-center text-gray-800">
          Gold Loan Interest Calculator
        </h1>

        <input
          type="number"
          placeholder="Principal Amount"
          value={principal}
          onChange={(e) => setPrincipal(e.target.value)}
          className="border p-2 w-full mb-3 rounded-md"
        />

        <input
          type="number"
          placeholder="Interest Rate (%)"
          value={rate}
          onChange={(e) => setRate(e.target.value)}
          className="border p-2 w-full mb-3 rounded-md"
        />

        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          placeholder="Start Date"
          className="border p-2 w-full mb-3 rounded-md"
        />

        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          placeholder="End Date"
          className="border p-2 w-full mb-3 rounded-md"
        />

        <select
          value={interestType}
          onChange={(e) => setInterestType(e.target.value)}
          className="border p-2 w-full mb-4 rounded-md"
        >
          <option value="monthly">Monthly</option>
          <option value="daily">Daily</option>
        </select>

        <button
          onClick={handleCalculate}
          className="bg-blue-600 text-white py-2 w-full rounded-md hover:bg-blue-700 transition"
        >
          Calculate
        </button>

        {interest !== null && (
          <div className="mt-4 text-center text-xl text-green-600 font-semibold">
            Interest: ₹{interest}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
