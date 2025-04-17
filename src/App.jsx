import { useState } from "react";

function App() {
  const [principal, setPrincipal] = useState("");
  const [rate, setRate] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [interestType, setInterestType] = useState("monthly");
  const [interest, setInterest] = useState(null);

  const handleCalculate = () => {
    if (!principal || !rate || !startDate || !endDate) {
      alert("Please fill all the fields");
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (end < start) {
      alert("End date should be after start date");
      return;
    }

    const timeDiff = end - start;
    let time;

    if (interestType === "monthly") {
      const months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
      const extra = end.getDate() >= start.getDate() ? 0 : -1;
      time = months + extra + 1;
      const calculatedInterest = (principal * rate * time) / 100;
      setInterest(calculatedInterest);
    } else {
      const days = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
      const dailyRate = rate / 30;
      const calculatedInterest = (principal * dailyRate * days) / 100;
      setInterest(calculatedInterest);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white p-6 rounded shadow-md w-full max-w-md text-center">
        <h1 className="text-2xl font-bold mb-6">Gold Loan Interest Calculator</h1>

        <input
          type="number"
          value={principal}
          onChange={(e) => setPrincipal(e.target.value)}
          placeholder="Principal Amount"
          className="border p-2 mb-4 w-full rounded"
        />

        <input
          type="number"
          value={rate}
          onChange={(e) => setRate(e.target.value)}
          placeholder="Monthly Interest Rate (%)"
          className="border p-2 mb-4 w-full rounded"
        />

        <div className="mb-4 text-left w-full">
          <label className="block text-gray-700 mb-1">Start Date</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="border p-2 w-full rounded"
          />
        </div>

        <div className="mb-4 text-left w-full">
          <label className="block text-gray-700 mb-1">End Date</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="border p-2 w-full rounded"
          />
        </div>

        <div className="flex justify-center mb-4">
          <button
            className={`px-4 py-2 rounded-l ${
              interestType === "monthly" ? "bg-blue-500 text-white" : "bg-gray-200"
            }`}
            onClick={() => setInterestType("monthly")}
          >
            Monthly
          </button>
          <button
            className={`px-4 py-2 rounded-r ${
              interestType === "daily" ? "bg-blue-500 text-white" : "bg-gray-200"
            }`}
            onClick={() => setInterestType("daily")}
          >
            Daily
          </button>
        </div>

        <button
          onClick={handleCalculate}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
          Calculate
        </button>

        {interest !== null && (
          <div className="mt-4 text-xl font-semibold text-blue-600">
            Interest: ₹{interest.toFixed(2)}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
