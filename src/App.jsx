import React, { useState } from "react";

function App() {
  const [principal, setPrincipal] = useState("");
  const [rate, setRate] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [type, setType] = useState("daily");
  const [mode, setMode] = useState("simple");
  const [result, setResult] = useState("");

  const calculateMonths = (start, end) => {
    const startObj = new Date(start);
    const endObj = new Date(end);

    let totalMonths =
      (endObj.getFullYear() - startObj.getFullYear()) * 12 +
      (endObj.getMonth() - startObj.getMonth());

    const extraDays = endObj.getDate() - startObj.getDate();

    if (extraDays >= 6 && extraDays <= 16) {
      totalMonths += 0.5;
    } else if (extraDays > 16) {
      totalMonths += 1;
    } else if (extraDays > 0) {
      totalMonths += extraDays / 30;
    }

    return totalMonths;
  };

  const calculateDays = (start, end) => {
    const startObj = new Date(start);
    const endObj = new Date(end);
    const diffTime = Math.abs(endObj - startObj);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const handleCalculate = () => {
    const P = parseFloat(principal);
    const R = parseFloat(rate);
    const start = startDate;
    const end = endDate;

    if (!P || !R || !start || !end) {
      setResult("Please fill all fields.");
      return;
    }

    let interest = 0;
    let total = 0;

    if (type === "daily") {
      const days = calculateDays(start, end);
      const dailyRate = R / 30 / 100;

      if (mode === "compound") {
        let currentPrincipal = P;
        if (days > 365) {
          const interestFirstYear = currentPrincipal * dailyRate * 365;
          currentPrincipal += interestFirstYear;
          const remainingDays = days - 365;
          interest = interestFirstYear + currentPrincipal * dailyRate * remainingDays;
        } else {
          interest = currentPrincipal * dailyRate * days;
        }
        total = P + interest;
        setResult(
          `Total Amount: ₹${total.toFixed(2)}\n(Principal ₹${P} + Interest ₹${interest.toFixed(2)})\nNo. of Days: ${days}`
        );
      } else {
        interest = P * dailyRate * days;
        total = P + interest;
        setResult(
          `Total Amount: ₹${total.toFixed(2)}\n(Principal ₹${P} + Interest ₹${interest.toFixed(2)})\nNo. of Days: ${days}`
        );
      }
    } else if (type === "monthly") {
      const months = calculateMonths(start, end);
      const monthlyRate = R / 100;

      if (mode === "compound") {
        let currentPrincipal = P;
        if (months > 12) {
          const interestFirstYear = currentPrincipal * monthlyRate * 12;
          currentPrincipal += interestFirstYear;
          const remainingMonths = months - 12;
          interest = interestFirstYear + currentPrincipal * monthlyRate * remainingMonths;
        } else {
          interest = currentPrincipal * monthlyRate * months;
        }
        total = P + interest;
        setResult(
          `Total Amount: ₹${total.toFixed(2)}\n(Principal ₹${P} + Interest ₹${interest.toFixed(2)})\nNo. of Months: ${months}`
        );
      } else {
        interest = P * monthlyRate * months;
        total = P + interest;
        setResult(
          `Total Amount: ₹${total.toFixed(2)}\n(Principal ₹${P} + Interest ₹${interest.toFixed(2)})\nNo. of Months: ${months}`
        );
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-100">
      <div className="bg-white shadow-lg rounded-2xl p-6 w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-4">Gold Loan Interest Calculator</h1>
        
        <input
          type="number"
          placeholder="Principal Amount (₹)"
          className="w-full p-2 border rounded mb-3"
          value={principal}
          onChange={(e) => setPrincipal(e.target.value)}
        />

        <input
          type="number"
          placeholder="Monthly Interest Rate (%)"
          className="w-full p-2 border rounded mb-3"
          value={rate}
          onChange={(e) => setRate(e.target.value)}
        />

        <label className="block text-sm mb-1">Start Date</label>
        <input
          type="date"
          className="w-full p-2 border rounded mb-3"
          placeholder="Start Date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />

        <label className="block text-sm mb-1">End Date</label>
        <input
          type="date"
          className="w-full p-2 border rounded mb-3"
          placeholder="End Date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
        />

        <div className="flex justify-between mb-3">
          <select
            className="w-1/2 p-2 border rounded mr-2"
            value={type}
            onChange={(e) => setType(e.target.value)}
          >
            <option value="daily">Daily</option>
            <option value="monthly">Monthly</option>
          </select>

          <select
            className="w-1/2 p-2 border rounded ml-2"
            value={mode}
            onChange={(e) => setMode(e.target.value)}
          >
            <option value="simple">Simple</option>
            <option value="compound">Compound</option>
          </select>
        </div>

        <button
          onClick={handleCalculate}
          className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
        >
          Calculate
        </button>

        {result && (
          <div className="mt-4 whitespace-pre-line bg-gray-50 p-4 rounded shadow text-gray-700">
            {result}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
