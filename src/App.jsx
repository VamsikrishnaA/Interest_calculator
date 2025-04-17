import { useState } from "react";
import "./index.css";

function App() {
  const [principal, setPrincipal] = useState("");
  const [rate, setRate] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [type, setType] = useState("monthly");
  const [interest, setInterest] = useState(null);

  const calculateInterest = () => {
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start) || isNaN(end) || !principal || !rate) {
      alert("Please fill all the fields correctly.");
      return;
    }

    const timeDiff = end - start;
    if (timeDiff < 0) {
      alert("End date should be after start date.");
      return;
    }

    let calculatedInterest = 0;

    if (type === "monthly") {
      const months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
      calculatedInterest = (principal * rate * months) / 100;
    } else {
      const days = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
      const dailyRate = rate / 30;
      calculatedInterest = (principal * dailyRate * days) / 100;
    }

    setInterest(calculatedInterest.toFixed(2));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white shadow-lg rounded-xl p-6 w-full max-w-md space-y-4">
        <h1 className="text-2xl font-bold text-center">Gold Loan Interest Calculator</h1>

        <input
          type="number"
          placeholder="Principal Amount"
          value={principal}
          onChange={(e) => setPrincipal(e.target.value)}
          className="w-full border border-gray-300 rounded-md p-2"
        />

        <input
          type="number"
          placeholder="Monthly Interest Rate (%)"
          value={rate}
          onChange={(e) => setRate(e.target.value)}
          className="w-full border border-gray-300 rounded-md p-2"
        />

        <input
  type="date"
  value={startDate}
  onChange={(e) => setStartDate(e.target.value)}
  placeholder="Start Date"
  className="border p-2 w-full rounded-md"
/>

<input
  type="date"
  value={endDate}
  onChange={(e) => setEndDate(e.target.value)}
  placeholder="End Date"
  className="border p-2 w-full rounded-md"
/>
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="w-full border border-gray-300 rounded-md p-2"
        >
          <option value="monthly">Monthly</option>
          <option value="daily">Daily</option>
        </select>

        <button
          onClick={calculateInterest}
          className="w-full bg-yellow-500 text-white font-semibold py-2 rounded-md hover:bg-yellow-600"
        >
          Calculate
        </button>

        {interest !== null && (
          <div className="text-center text-xl font-semibold text-green-600">
            Interest: ₹ {interest}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
