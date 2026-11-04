import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import SEO from "../components/common/SEO";

const formatKES = (amount) => {
  if (!amount || isNaN(amount)) return "KES 0";
  return "KES " + Math.round(amount).toLocaleString();
};

const KENYAN_BANKS = [
  { name: "KCB Bank", rate: 13.5 },
  { name: "Equity Bank", rate: 14.0 },
  { name: "Co-operative Bank", rate: 13.0 },
  { name: "Standard Chartered", rate: 13.5 },
  { name: "Absa Bank Kenya", rate: 14.5 },
  { name: "NCBA Bank", rate: 14.0 },
  { name: "NIC Bank", rate: 13.5 },
  { name: "DTB", rate: 15.0 },
  { name: "Custom rate", rate: null },
];

export default function MortgageCalculatorPage() {
  const [loanAmount, setLoanAmount] = useState(10000000);
  const [interestRate, setInterestRate] = useState(13.5);
  const [loanTerm, setLoanTerm] = useState(20);
  const [downPayment, setDownPayment] = useState(2000000);
  const [selectedBank, setSelectedBank] = useState("KCB Bank");
  const [customRate, setCustomRate] = useState(13.5);
  const [propertyPrice, setPropertyPrice] = useState(12000000);
  const [results, setResults] = useState(null);
  const [schedule, setSchedule] = useState([]);
  const [showSchedule, setShowSchedule] = useState(false);
  const [scheduleView, setScheduleView] = useState("yearly");

  useEffect(() => {
    calculate();
  }, [loanAmount, interestRate, loanTerm, downPayment]);

  const handleBankChange = (bankName) => {
    setSelectedBank(bankName);
    const bank = KENYAN_BANKS.find((b) => b.name === bankName);
    if (bank?.rate) setInterestRate(bank.rate);
  };

  const handlePropertyPrice = (price) => {
    setPropertyPrice(price);
    setLoanAmount(Math.max(0, price - downPayment));
  };

  const handleDownPayment = (dp) => {
    setDownPayment(dp);
    setLoanAmount(Math.max(0, propertyPrice - dp));
  };

  const calculate = () => {
    const principal = Number(loanAmount);
    const rate = Number(interestRate) / 100 / 12;
    const payments = Number(loanTerm) * 12;

    if (principal <= 0 || rate <= 0 || payments <= 0) {
      setResults(null);
      return;
    }

    const monthlyPayment =
      (principal * (rate * Math.pow(1 + rate, payments))) /
      (Math.pow(1 + rate, payments) - 1);

    const totalPayment = monthlyPayment * payments;
    const totalInterest = totalPayment - principal;

    // Build amortization schedule
    let balance = principal;
    const sched = [];
    for (let month = 1; month <= payments; month++) {
      const interestPayment = balance * rate;
      const principalPayment = monthlyPayment - interestPayment;
      balance -= principalPayment;
      sched.push({
        month,
        year: Math.ceil(month / 12),
        payment: monthlyPayment,
        principal: principalPayment,
        interest: interestPayment,
        balance: Math.max(0, balance),
        totalPrincipalPaid: principal - Math.max(0, balance),
      });
    }

    // Group by year
    const yearlySchedule = [];
    for (let y = 1; y <= loanTerm; y++) {
      const months = sched.filter((s) => s.year === y);
      yearlySchedule.push({
        year: y,
        payment: months.reduce((s, m) => s + m.payment, 0),
        principal: months.reduce((s, m) => s + m.principal, 0),
        interest: months.reduce((s, m) => s + m.interest, 0),
        balance: months[months.length - 1]?.balance || 0,
      });
    }

    setResults({
      monthlyPayment,
      totalPayment,
      totalInterest,
      principal,
      interestRate,
      loanTerm,
    });
    setSchedule(scheduleView === "yearly" ? yearlySchedule : sched);
  };

  const downPaymentPercent =
    propertyPrice > 0 ? Math.round((downPayment / propertyPrice) * 100) : 0;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <SEO
        title="Mortgage Calculator — nestHaven"
        description="Calculate your monthly mortgage payments for properties in Kenya. Compare rates from top Kenyan banks."
      />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <p className="text-brand-500 text-sm font-medium mb-1">
          Financial tools
        </p>
        <h1 className="text-display-md text-surface-900 mb-2">
          Mortgage Calculator
        </h1>
        <p className="text-surface-500 text-sm">
          Calculate your monthly repayments for properties in Kenya. Rates
          sourced from major Kenyan banks.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* ── Input panel ─────────────────────────────── */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card p-6 space-y-5">
            <h2 className="font-semibold text-surface-900">Property details</h2>

            <div>
              <div className="flex justify-between mb-1.5">
                <label className="text-sm font-medium text-surface-700">
                  Property price
                </label>
                <span className="text-sm font-bold text-surface-900">
                  {formatKES(propertyPrice)}
                </span>
              </div>
              <input
                type="range"
                min={1000000}
                max={100000000}
                step={500000}
                value={propertyPrice}
                onChange={(e) => handlePropertyPrice(Number(e.target.value))}
                className="w-full accent-brand-500"
              />
              <div className="flex justify-between text-xs text-surface-400 mt-1">
                <span>KES 1M</span>
                <span>KES 100M</span>
              </div>
              <input
                type="number"
                value={propertyPrice}
                onChange={(e) => handlePropertyPrice(Number(e.target.value))}
                className="input mt-2 text-sm"
                min={0}
              />
            </div>

            <div>
              <div className="flex justify-between mb-1.5">
                <label className="text-sm font-medium text-surface-700">
                  Down payment
                </label>
                <span className="text-sm font-bold text-surface-900">
                  {formatKES(downPayment)}
                  <span className="text-surface-400 font-normal ml-1">
                    ({downPaymentPercent}%)
                  </span>
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={propertyPrice}
                step={100000}
                value={downPayment}
                onChange={(e) => handleDownPayment(Number(e.target.value))}
                className="w-full accent-brand-500"
              />
              <div className="flex justify-between text-xs text-surface-400 mt-1">
                <span>KES 0</span>
                <span>{formatKES(propertyPrice)}</span>
              </div>
              <div className="flex gap-2 mt-2">
                {[10, 20, 30].map((pct) => (
                  <button
                    key={pct}
                    onClick={() =>
                      handleDownPayment(Math.round((propertyPrice * pct) / 100))
                    }
                    className={
                      "flex-1 py-1.5 text-xs rounded-lg border transition-colors " +
                      (downPaymentPercent === pct
                        ? "bg-brand-500 text-white border-brand-500"
                        : "border-surface-200 text-surface-600 hover:border-brand-300")
                    }
                  >
                    {pct}%
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1.5">
                <label className="text-sm font-medium text-surface-700">
                  Loan amount
                </label>
                <span className="text-sm font-bold text-brand-500">
                  {formatKES(loanAmount)}
                </span>
              </div>
              <input
                type="number"
                value={loanAmount}
                onChange={(e) => setLoanAmount(Number(e.target.value))}
                className="input text-sm"
                min={0}
              />
            </div>
          </div>

          <div className="card p-6 space-y-5">
            <h2 className="font-semibold text-surface-900">Loan terms</h2>

            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1.5">
                Bank / Lender
              </label>
              <select
                value={selectedBank}
                onChange={(e) => handleBankChange(e.target.value)}
                className="input"
              >
                {KENYAN_BANKS.map((b) => (
                  <option key={b.name} value={b.name}>
                    {b.name}
                    {b.rate ? " — " + b.rate + "%" : ""}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <div className="flex justify-between mb-1.5">
                <label className="text-sm font-medium text-surface-700">
                  Interest rate (% per year)
                </label>
                <span className="text-sm font-bold text-surface-900">
                  {interestRate}%
                </span>
              </div>
              {selectedBank === "Custom rate" ? (
                <input
                  type="number"
                  step="0.1"
                  min={1}
                  max={30}
                  value={interestRate}
                  onChange={(e) => setInterestRate(Number(e.target.value))}
                  className="input text-sm"
                />
              ) : (
                <input
                  type="range"
                  min={8}
                  max={25}
                  step={0.5}
                  value={interestRate}
                  onChange={(e) => setInterestRate(Number(e.target.value))}
                  className="w-full accent-brand-500"
                />
              )}
              <div className="flex justify-between text-xs text-surface-400 mt-1">
                <span>8%</span>
                <span>25%</span>
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1.5">
                <label className="text-sm font-medium text-surface-700">
                  Loan term
                </label>
                <span className="text-sm font-bold text-surface-900">
                  {loanTerm} years
                </span>
              </div>
              <input
                type="range"
                min={5}
                max={30}
                step={1}
                value={loanTerm}
                onChange={(e) => setLoanTerm(Number(e.target.value))}
                className="w-full accent-brand-500"
              />
              <div className="flex justify-between text-xs text-surface-400 mt-1">
                <span>5 years</span>
                <span>30 years</span>
              </div>
              <div className="flex gap-2 mt-2">
                {[10, 15, 20, 25].map((y) => (
                  <button
                    key={y}
                    onClick={() => setLoanTerm(y)}
                    className={
                      "flex-1 py-1.5 text-xs rounded-lg border transition-colors " +
                      (loanTerm === y
                        ? "bg-brand-500 text-white border-brand-500"
                        : "border-surface-200 text-surface-600 hover:border-brand-300")
                    }
                  >
                    {y}yr
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── Results panel ────────────────────────────── */}
        <div className="lg:col-span-3 space-y-6">
          {results ? (
            <>
              {/* Monthly payment — hero card */}
              <motion.div
                key={results.monthlyPayment}
                initial={{ scale: 0.98, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="card p-6 bg-gradient-to-br from-brand-500 to-brand-700 text-white"
              >
                <p className="text-white/70 text-sm mb-1">Monthly repayment</p>
                <p className="text-4xl font-bold mb-1">
                  {formatKES(results.monthlyPayment)}
                </p>
                <p className="text-white/60 text-sm">
                  per month for {results.loanTerm} years at{" "}
                  {results.interestRate}% p.a.
                </p>

                <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-white/20">
                  <div>
                    <p className="text-white/60 text-xs mb-1">Loan amount</p>
                    <p className="font-bold text-sm">
                      {formatKES(results.principal)}
                    </p>
                  </div>
                  <div>
                    <p className="text-white/60 text-xs mb-1">Total interest</p>
                    <p className="font-bold text-sm">
                      {formatKES(results.totalInterest)}
                    </p>
                  </div>
                  <div>
                    <p className="text-white/60 text-xs mb-1">
                      Total repayment
                    </p>
                    <p className="font-bold text-sm">
                      {formatKES(results.totalPayment)}
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Breakdown chart */}
              <div className="card p-6">
                <h3 className="font-semibold text-surface-900 mb-4">
                  Payment breakdown
                </h3>

                {/* Visual bar */}
                <div className="mb-4">
                  <div className="flex rounded-xl overflow-hidden h-6">
                    <div
                      className="bg-brand-500 flex items-center justify-center"
                      style={{
                        width:
                          (results.principal / results.totalPayment) * 100 +
                          "%",
                      }}
                    >
                      {results.principal / results.totalPayment > 0.15 && (
                        <span className="text-white text-xs font-medium">
                          Principal
                        </span>
                      )}
                    </div>
                    <div
                      className="bg-amber-400 flex items-center justify-center"
                      style={{
                        width:
                          (results.totalInterest / results.totalPayment) * 100 +
                          "%",
                      }}
                    >
                      {results.totalInterest / results.totalPayment > 0.15 && (
                        <span className="text-white text-xs font-medium">
                          Interest
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-4 mt-2">
                    <div className="flex items-center gap-1.5">
                      <div className="w-3 h-3 rounded-sm bg-brand-500" />
                      <span className="text-xs text-surface-600">
                        Principal (
                        {Math.round(
                          (results.principal / results.totalPayment) * 100,
                        )}
                        %)
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-3 h-3 rounded-sm bg-amber-400" />
                      <span className="text-xs text-surface-600">
                        Interest (
                        {Math.round(
                          (results.totalInterest / results.totalPayment) * 100,
                        )}
                        %)
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {[
                    {
                      label: "Property price",
                      value: propertyPrice,
                      color: "text-surface-900",
                    },
                    {
                      label: "Down payment",
                      value: downPayment,
                      color: "text-green-600",
                    },
                    {
                      label: "Loan amount",
                      value: results.principal,
                      color: "text-brand-500",
                    },
                    {
                      label: "Total interest",
                      value: results.totalInterest,
                      color: "text-amber-500",
                    },
                    {
                      label: "Total repayment",
                      value: results.totalPayment,
                      color: "text-surface-900",
                    },
                    {
                      label: "Monthly payment",
                      value: results.monthlyPayment,
                      color: "text-brand-500",
                    },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="flex items-center justify-between py-2 border-b border-surface-100 last:border-0"
                    >
                      <span className="text-sm text-surface-500">
                        {item.label}
                      </span>
                      <span className={"text-sm font-semibold " + item.color}>
                        {formatKES(item.value)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Amortization schedule */}
              <div className="card p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-surface-900">
                    Amortization schedule
                  </h3>
                  <div className="flex gap-2">
                    {["yearly", "monthly"].map((v) => (
                      <button
                        key={v}
                        onClick={() => {
                          setScheduleView(v);
                          setShowSchedule(false);
                          setTimeout(() => {
                            calculate();
                            setShowSchedule(true);
                          }, 50);
                        }}
                        className={
                          "px-3 py-1.5 text-xs rounded-lg border transition-colors capitalize " +
                          (scheduleView === v
                            ? "bg-brand-500 text-white border-brand-500"
                            : "border-surface-200 text-surface-600 hover:border-brand-300")
                        }
                      >
                        {v}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => {
                    setShowSchedule((s) => !s);
                    if (!showSchedule) calculate();
                  }}
                  className="btn-secondary w-full text-sm mb-4"
                >
                  {showSchedule ? "Hide schedule" : "View full schedule"}
                </button>

                {showSchedule && (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-surface-200">
                          <th className="text-left py-2 px-2 text-xs text-surface-500 font-medium">
                            {scheduleView === "yearly" ? "Year" : "Month"}
                          </th>
                          <th className="text-right py-2 px-2 text-xs text-surface-500 font-medium">
                            Payment
                          </th>
                          <th className="text-right py-2 px-2 text-xs text-surface-500 font-medium">
                            Principal
                          </th>
                          <th className="text-right py-2 px-2 text-xs text-surface-500 font-medium">
                            Interest
                          </th>
                          <th className="text-right py-2 px-2 text-xs text-surface-500 font-medium">
                            Balance
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {schedule.map((row, i) => (
                          <tr
                            key={i}
                            className={
                              "border-b border-surface-50 " +
                              (i % 2 === 0 ? "bg-surface-50/50" : "")
                            }
                          >
                            <td className="py-2 px-2 text-surface-700 font-medium">
                              {scheduleView === "yearly"
                                ? "Year " + row.year
                                : "Month " + row.month}
                            </td>
                            <td className="py-2 px-2 text-right text-surface-900 font-medium">
                              {formatKES(row.payment)}
                            </td>
                            <td className="py-2 px-2 text-right text-brand-600">
                              {formatKES(row.principal)}
                            </td>
                            <td className="py-2 px-2 text-right text-amber-600">
                              {formatKES(row.interest)}
                            </td>
                            <td className="py-2 px-2 text-right text-surface-600">
                              {formatKES(row.balance)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Tips */}
              <div className="card p-6 bg-blue-50 border-blue-100">
                <h3 className="font-semibold text-blue-900 mb-3">
                  Kenyan mortgage tips
                </h3>
                <ul className="space-y-2 text-sm text-blue-800">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 flex-shrink-0 mt-0.5">
                      •
                    </span>
                    Most Kenyan banks require a minimum 10-20% down payment
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 flex-shrink-0 mt-0.5">
                      •
                    </span>
                    Kenya Revenue Authority requires stamp duty of 2-4% of
                    property value
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 flex-shrink-0 mt-0.5">
                      •
                    </span>
                    Legal fees typically range from 1-2% of the property price
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 flex-shrink-0 mt-0.5">
                      •
                    </span>
                    The National Housing Corporation offers subsidized mortgages
                    for qualifying buyers
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 flex-shrink-0 mt-0.5">
                      •
                    </span>
                    NSSF and NHIF can sometimes be used to supplement mortgage
                    applications
                  </li>
                </ul>
              </div>
            </>
          ) : (
            <div className="card p-12 text-center">
              <svg
                className="w-16 h-16 text-surface-200 mx-auto mb-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 11h.01M12 11h.01M15 11h.01M4 19h16a2 2 0 002-2V7a2 2 0 00-2-2H4a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
              <p className="text-surface-400 text-sm">
                Enter property details to see your calculation
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
