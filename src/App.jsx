import { useState } from "react";
import dayjs from "dayjs";

function App() {
  const [principal, setPrincipal] = useState("");
  const [rate, setRate] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [type, setType] = useState("daily");
  const [compound, setCompound] = useState(false);
  const [result, setResult] = useState(null);

  const handleCalculate = () => {
    if (!principal || !rate || !startDate || !endDate) return;

    const start = dayjs(startDate);
    const end = dayjs(endDate);
    const diffInDays = end.diff(start, "day");

    if (type === "daily") {
      const dailyRate = rate / 30;
      if (compound) {
        let interest = 0;
        let tempPrincipal = parseFloat(principal);
        if (diffInDays > 365) {
          const fullYears = Math.floor(diffInDays / 365);
          const remainingDays = diffInDays % 365;
          for (let i = 0; i < fullYears; i++) {
            interest += (tempPrincipal * dailyRate * 365) / 100;
            tempPrincipal += (tempPrincipal * dailyRate * 365) / 100;
          }
          interest += (tempPrincipal * dailyRate * remainingDays) / 100;
          setResult({
            interest: interest.toFixed(2),
            total: (parseFloat(principal) + interest).toFixed(2),
            duration: `${diffInDays} days`,
          });
        } else {
          interest = (tempPrincipal * dailyRate * diffInDays) / 100;
          setResult({
            interest: interest.toFixed(2),
            total: (tempPrincipal + interest).toFixed(2),
            duration: `${diffInDays} days`,
          });
        }
      } else {
        const interest = (principal * dailyRate * diffInDays) / 100;
        setResult({
          interest: interest.toFixed(2),
          total: (parseFloat(principal) + interest).toFixed(2),
          duration: `${diffInDays} days`,
        });
      }
    }

    if (type === "monthly") {
      let months = end.diff(start, "month");
      const daysRemainder = end.diff(start.add(months, "month"), "day");

      if (daysRemainder >= 6 && daysRemainder <= 16) {
        months += 0.5;
      } else if (daysRemainder > 16) {
        months += 1;
      }

      if (compound) {
        let interest = 0;
        let tempPrincipal = parseFloat(principal);
        const years = Math.floor(months / 12);
        const remainingMonths = months % 12;
        for (let i = 0; i < years; i++) {
          interest += (tempPrincipal * rate * 12) / 100;
          tempPrincipal += (tempPrincipal * rate * 12) / 100;
        }
        interest += (tempPrincipal * rate * remainingMonths) / 100;
        setResult({
          interest: interest.toFixed(2),
          total: (parseFloat(principal) + interest).toFixed(2),
          duration: `${months} months`,
        });
      } else {
        const interest = (principal * rate * months) / 100;
        setResult({
          interest: interest.toFixed(2),
          total: (parseFloat(principal) + interest).toFixed(2),
          duration: `${months} months`,
        });
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-gray-800 rounded-2xl shadow-2xl p-6 space-y-6">
        <h1 className="text-2xl font-bold text-center">Gold Loan Interest Calculator</h1>

        <div className="space-y-4">
          <div>
            <label className="block mb-1">Principal Amount</label>
            <input
              type="number"
              value={principal}
              onChange={(e) => setPrincipal(e.target.value)}
              placeholder="Enter principal"
              className="w-full p-2 rounded bg-gray-700 text-white"
            />
          </div>

          <div>
            <label className="block mb-1">Interest Rate (%)</label>
            <input
              type="number"
              value={rate}
              onChange={(e) => setRate(e.target.value)}
              placeholder="Monthly rate (e.g. 2)"
              className="w-full p-2 rounded bg-gray-700 text-white"
            />
          </div>

          <div>
            <label className="block mb-1">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              placeholder="Select start date"
              className="w-full p-2 rounded bg-gray-700 text-white"
            />
          </div>

          <div>
            <label className="block mb-1">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              placeholder="Select end date"
              className="w-full p-2 rounded bg-gray-700 text-white"
            />
          </div>

          <div className="flex justify-between">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="type"
                value="daily"
                checked={type === "daily"}
                onChange={() => setType("daily")}
              />
              Daily
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="type"
                value="monthly"
                checked={type === "monthly"}
                onChange={() => setType("monthly")}
              />
              Monthly
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={compound}
                onChange={() => setCompound(!compound)}
              />
              Compound
            </label>
          </div>

          <button
            onClick={handleCalculate}
            className="w-full bg-yellow-500 text-black font-semibold p-2 rounded hover:bg-yellow-400"
          >
            Calculate
          </button>
        </div>

        {result && (
          <div className="bg-gray-900 rounded-lg p-4 mt-4 space-y-2">
            <div><strong>Interest:</strong> ₹{result.interest}</div>
            <div><strong>Total Amount:</strong> ₹{result.total}</div>
            <div><strong>Duration:</strong> {result.duration}</div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
