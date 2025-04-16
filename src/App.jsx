import { useState } from 'react';
import './App.css';

function App() {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [amount, setAmount] = useState('');
  const [rate, setRate] = useState('');
  const [rateType, setRateType] = useState('monthly');
  const [interest, setInterest] = useState(null);

  const calculateInterest = () => {
    const oneDay = 24 * 60 * 60 * 1000;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const days = Math.round((end - start) / oneDay) + 1;

    const parsedRate = parseFloat(rate) / 100;
    const dailyRate = rateType === 'daily' ? parsedRate / 30 : parsedRate;

    const result = amount * dailyRate * days;
    setInterest(result.toFixed(2));
  };

  return (
    <div className="App">
      <h2>Gold Loan Interest Calculator</h2>
      <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
      <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
      <input type="number" placeholder="Loan Amount" value={amount} onChange={e => setAmount(e.target.value)} />
      <input type="number" step="0.01" placeholder="Interest Rate (%)" value={rate} onChange={e => setRate(e.target.value)} />

      <select value={rateType} onChange={e => setRateType(e.target.value)}>
        <option value="monthly">Monthly Rate</option>
        <option value="daily">Daily Rate</option>
      </select>

      <button onClick={calculateInterest}>Calculate</button>
      {interest && <p>Total Interest: ₹{interest}</p>}
    </div>
  );
}

export default App;
