import { useEffect, useState } from "react";
import {
  ArrowUpRight,
  CheckCircle2,
  CreditCard,
  IndianRupee,
  Users,
  WalletCards,
} from "lucide-react";
import {
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import Card from "../components/ui/Card";
import LoadingState from "../components/ui/LoadingState";
import ErrorState from "../components/ui/ErrorState";
import { get } from "../lib/api";

const salesData = [
  { day: "Mon", current: 8200, previous: 7600 },
  { day: "Tue", current: 9100, previous: 8500 },
  { day: "Wed", current: 8800, previous: 9200 },
  { day: "Thu", current: 10400, previous: 9700 },
  { day: "Fri", current: 11200, previous: 10800 },
  { day: "Sat", current: 12800, previous: 11600 },
  { day: "Sun", current: 11900, previous: 11100 },
];

const customerData = [
  { name: "Active", value: 58 },
  { name: "Repeat", value: 24 },
  { name: "At-risk", value: 10 },
  { name: "New", value: 8 },
];

const customerColors = ["#00BAF2", "#012A4D", "#F5A623", "#1DB954"];

const salesPatterns = [
  {
    title: "Best performing day",
    value: "Saturday",
    detail: "₹12,800 average sales",
  },
  {
    title: "Weakest period",
    value: "Tuesday, 2–5 PM",
    detail: "18% below baseline",
  },
  {
    title: "Top category",
    value: "Daily Essentials",
    detail: "32% of total sales",
  },
  {
    title: "Lowest category",
    value: "Personal Care",
    detail: "9% of total sales",
  },
];

function formatCurrency(value) {
  return `₹${Number(value || 0).toLocaleString("en-IN")}`;
}

function MetricCard({ metric }) {
  const Icon = metric.icon;

  return (
    <Card>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-text-secondary">{metric.title}</p>

          <p className="mt-2 text-2xl font-semibold text-navy">
            {metric.value}
          </p>

          {metric.change && (
            <div className="mt-2 flex items-center gap-1 text-xs font-medium text-success">
              <ArrowUpRight size={14} />
              {metric.change}
              <span className="font-normal text-text-secondary">
                {metric.changeLabel || ""}
              </span>
            </div>
          )}
        </div>

        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon size={20} strokeWidth={1.8} />
        </div>
      </div>
    </Card>
  );
}

function Overview() {
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadOverview = async () => {
      try {
        setLoading(true);
        setError("");

        const storedMerchant = localStorage.getItem("selectedMerchant");

        if (!storedMerchant) {
          throw new Error("No merchant is selected.");
        }

        let merchant;

        try {
          merchant = JSON.parse(storedMerchant);
        } catch {
          throw new Error("Merchant information is invalid.");
        }

        if (!merchant?.id) {
          throw new Error(
            "This merchant is not connected to the backend yet."
          );
        }

        const response = await get(
          `/api/overview/merchant/${merchant.id}`
        );

        if (!response?.overview) {
          throw new Error("Overview data is unavailable.");
        }

        setOverview(response.overview);
      } catch (err) {
        setError(
          err?.message ||
            "Unable to load the business overview. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

    loadOverview();
  }, []);

  if (loading) {
    return <LoadingState message="Loading business overview..." />;
  }

  if (error) {
    return <ErrorState message={error} />;
  }

  if (!overview) {
    return (
      <ErrorState message="Business overview data is unavailable." />
    );
  }

  const healthMetrics = [
    {
      title: "Sales",
      value: formatCurrency(overview.sales),
      icon: IndianRupee,
    },
    {
      title: "Customers",
      value: overview.customer_count.toLocaleString("en-IN"),
      icon: Users,
    },
    {
      title: "Active Opportunities",
      value: overview.active_opportunities.toLocaleString("en-IN"),
      icon: WalletCards,
    },
    {
      title: "Verified Impact",
      value: formatCurrency(overview.verified_impact),
      icon: CheckCircle2,
    },
  ];

  const paymentData = [
    {
      label: "Successful",
      value: `${overview.successful_transactions.toLocaleString(
        "en-IN"
      )}`,
      count: `${overview.successful_transactions.toLocaleString(
        "en-IN"
      )} transactions`,
      icon: CheckCircle2,
    },
    {
      label: "Failed",
      value: `${overview.failed_transactions.toLocaleString("en-IN")}`,
      count: `${formatCurrency(
        overview.failed_value
      )} failed value`,
      icon: CreditCard,
    },
    {
      label: "Total",
      value: `${overview.total_transactions.toLocaleString(
        "en-IN"
      )}`,
      count: "total transactions",
      icon: CreditCard,
    },
  ];

  return (
    <div className="space-y-8">
      {/* Page introduction */}
      <div>
        <h2 className="text-2xl font-semibold text-navy">
          Business Overview
        </h2>

        <p className="mt-1 text-sm text-text-secondary">
          Understand how your business is performing across sales,
          customers and payments.
        </p>
      </div>

      {/* Business Health */}
      <section>
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-navy">
            Business Health
          </h3>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {healthMetrics.map((metric) => (
            <MetricCard key={metric.title} metric={metric} />
          ))}
        </div>
      </section>

      {/* Backend-supported transaction summary */}
      <section>
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-navy">
            Transaction Performance
          </h3>

          <p className="mt-1 text-sm text-text-secondary">
            Transaction activity reported by your business data.
          </p>
        </div>

        <Card>
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <p className="text-sm text-text-secondary">
                Total transactions
              </p>

              <p className="mt-2 text-2xl font-semibold text-navy">
                {overview.total_transactions.toLocaleString("en-IN")}
              </p>
            </div>

            <div>
              <p className="text-sm text-text-secondary">
                Successful transactions
              </p>

              <p className="mt-2 text-2xl font-semibold text-success">
                {overview.successful_transactions.toLocaleString(
                  "en-IN"
                )}
              </p>
            </div>

            <div>
              <p className="text-sm text-text-secondary">
                Failed transactions
              </p>

              <p className="mt-2 text-2xl font-semibold text-navy">
                {overview.failed_transactions.toLocaleString("en-IN")}
              </p>
            </div>
          </div>
        </Card>
      </section>

      {/* Sales Performance */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-navy">
              Sales Performance
            </h3>

            <p className="mt-1 text-sm text-text-secondary">
              Current period compared with the previous period.
            </p>
          </div>
        </div>

        <Card>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={salesData}
                margin={{
                  top: 10,
                  right: 20,
                  left: 0,
                  bottom: 0,
                }}
              >
                <XAxis
                  dataKey="day"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 12 }}
                />

                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => `₹${value / 1000}k`}
                />

                <Tooltip
                  formatter={(value) => [
                    `₹${Number(value).toLocaleString("en-IN")}`,
                  ]}
                />

                <Legend />

                <Line
                  type="monotone"
                  dataKey="current"
                  name="Current period"
                  stroke="#00BAF2"
                  strokeWidth={2.5}
                  dot={{ r: 3 }}
                />

                <Line
                  type="monotone"
                  dataKey="previous"
                  name="Previous period"
                  stroke="#012A4D"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </section>

      {/* Customer + Payment */}
      <section className="grid gap-6 xl:grid-cols-2">
        {/* Customer Behaviour */}
        <Card>
          <div className="mb-5">
            <h3 className="text-lg font-semibold text-navy">
              Customer Behaviour
            </h3>

            <p className="mt-1 text-sm text-text-secondary">
              Current customer distribution.
            </p>
          </div>

          <div className="grid items-center gap-4 md:grid-cols-2">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={customerData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={2}
                  >
                    {customerData.map((entry, index) => (
                      <Cell
                        key={entry.name}
                        fill={customerColors[index]}
                      />
                    ))}
                  </Pie>

                  <Tooltip formatter={(value) => `${value}%`} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-4">
              {customerData.map((customer, index) => (
                <div
                  key={customer.name}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{
                        backgroundColor: customerColors[index],
                      }}
                    />

                    <span className="text-sm text-text-secondary">
                      {customer.name}
                    </span>
                  </div>

                  <span className="text-sm font-semibold text-navy">
                    {customer.value}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Payment Performance */}
        <Card>
          <div className="mb-5">
            <h3 className="text-lg font-semibold text-navy">
              Payment Performance
            </h3>

            <p className="mt-1 text-sm text-text-secondary">
              Payment activity across your transactions.
            </p>
          </div>

          <div className="space-y-3">
            {paymentData.map((payment) => {
              const Icon = payment.icon;

              return (
                <div
                  key={payment.label}
                  className="flex items-center justify-between rounded-lg border border-border p-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-background text-navy">
                      <Icon size={18} strokeWidth={1.8} />
                    </div>

                    <div>
                      <p className="text-sm font-medium text-navy">
                        {payment.label}
                      </p>

                      <p className="text-xs text-text-secondary">
                        {payment.count}
                      </p>
                    </div>
                  </div>

                  <p className="text-sm font-semibold text-navy">
                    {payment.value}
                  </p>
                </div>
              );
            })}
          </div>
        </Card>
      </section>

      {/* Sales Patterns */}
      <section>
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-navy">
            Sales Patterns
          </h3>

          <p className="mt-1 text-sm text-text-secondary">
            Key patterns identified from your sales history.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {salesPatterns.map((pattern) => (
            <Card key={pattern.title}>
              <p className="text-xs font-medium uppercase tracking-wide text-text-secondary">
                {pattern.title}
              </p>

              <p className="mt-3 text-lg font-semibold text-navy">
                {pattern.value}
              </p>

              <p className="mt-1 text-sm text-text-secondary">
                {pattern.detail}
              </p>
            </Card>
          ))}
        </div>
      </section>

      {/* Merchant Benefits */}
      <section>
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-navy">
            Merchant Benefits
          </h3>

          <p className="mt-1 text-sm text-text-secondary">
            Benefits currently available to your business.
          </p>
        </div>

        <Card>
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
            <div>
              <p className="text-sm text-text-secondary">Active opportunities</p>

              <p className="mt-2 text-2xl font-semibold text-navy">
                {overview.active_opportunities}
              </p>
            </div>

            <div>
              <p className="text-sm text-text-secondary">
                Potential opportunity value
              </p>

              <p className="mt-2 text-2xl font-semibold text-navy">
                {formatCurrency(overview.potential_opportunity_value)}
              </p>
            </div>

            <div>
              <p className="text-sm text-text-secondary">
                Verified impact
              </p>

              <p className="mt-2 text-2xl font-semibold text-success">
                {formatCurrency(overview.verified_impact)}
              </p>
            </div>

            <div>
              <p className="text-sm text-text-secondary">
                Failed payment value
              </p>

              <p className="mt-2 text-2xl font-semibold text-navy">
                {formatCurrency(overview.failed_value)}
              </p>
            </div>
          </div>
        </Card>
      </section>
    </div>
  );
}

export default Overview;