import { useMemo, useState } from "react";
import {
  Search,
  Users,
  UserRound,
  ShoppingBag,
  TrendingUp,
  X,
} from "lucide-react";
import Card from "../components/ui/Card";

const customers = [
  {
    id: "CUS-1001",
    name: "Ravi Sharma",
    phone: "+91 98765 43210",
    purchases: 12,
    totalSpent: 18450,
    lastPurchase: "30 Sep 2026",
    segment: "Loyal",
    status: "Active",
  },
  {
    id: "CUS-1002",
    name: "Neha Patil",
    phone: "+91 98234 56781",
    purchases: 8,
    totalSpent: 11200,
    lastPurchase: "30 Sep 2026",
    segment: "Regular",
    status: "Active",
  },
  {
    id: "CUS-1003",
    name: "Amit Kulkarni",
    phone: "+91 97654 32109",
    purchases: 3,
    totalSpent: 5200,
    lastPurchase: "30 Sep 2026",
    segment: "New",
    status: "Active",
  },
  {
    id: "CUS-1004",
    name: "Priya Joshi",
    phone: "+91 98987 65432",
    purchases: 15,
    totalSpent: 24600,
    lastPurchase: "29 Sep 2026",
    segment: "Loyal",
    status: "Active",
  },
  {
    id: "CUS-1005",
    name: "Suresh More",
    phone: "+91 98123 45670",
    purchases: 6,
    totalSpent: 7800,
    lastPurchase: "29 Sep 2026",
    segment: "Regular",
    status: "Active",
  },
  {
    id: "CUS-1006",
    name: "Anjali Deshmukh",
    phone: "+91 97531 86420",
    purchases: 2,
    totalSpent: 3100,
    lastPurchase: "28 Sep 2026",
    segment: "New",
    status: "Active",
  },
  {
    id: "CUS-1007",
    name: "Rahul Shah",
    phone: "+91 98670 12345",
    purchases: 11,
    totalSpent: 16900,
    lastPurchase: "27 Sep 2026",
    segment: "Loyal",
    status: "Active",
  },
  {
    id: "CUS-1008",
    name: "Meera Nair",
    phone: "+91 97222 34567",
    purchases: 4,
    totalSpent: 6400,
    lastPurchase: "24 Sep 2026",
    segment: "Regular",
    status: "Inactive",
  },
];

const segmentStyles = {
  Loyal: "bg-primary/10 text-navy",
  Regular: "bg-background text-text",
  New: "bg-success/10 text-success",
};

function Customers() {
  const [search, setSearch] = useState("");
  const [segmentFilter, setSegmentFilter] = useState("All");
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  const filteredCustomers = useMemo(() => {
    const query = search.trim().toLowerCase();

    return customers.filter((customer) => {
      const matchesSearch =
        !query ||
        customer.name.toLowerCase().includes(query) ||
        customer.phone.toLowerCase().includes(query) ||
        customer.id.toLowerCase().includes(query);

      const matchesSegment =
        segmentFilter === "All" || customer.segment === segmentFilter;

      return matchesSearch && matchesSegment;
    });
  }, [search, segmentFilter]);

  const totalCustomers = customers.length;

  const loyalCustomers = customers.filter(
    (customer) => customer.segment === "Loyal"
  ).length;

  const activeCustomers = customers.filter(
    (customer) => customer.status === "Active"
  ).length;

  const totalRevenue = customers.reduce(
    (sum, customer) => sum + customer.totalSpent,
    0
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-navy">
          Customers
        </h1>
        <p className="mt-1 text-sm text-text-secondary">
          Understand your customer base and purchasing patterns.
        </p>
      </div>

      {/* Summary */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          icon={Users}
          label="Total Customers"
          value={totalCustomers}
          helper="Customer accounts"
        />

        <SummaryCard
          icon={UserRound}
          label="Active Customers"
          value={activeCustomers}
          helper="Recently engaged"
        />

        <SummaryCard
          icon={TrendingUp}
          label="Loyal Customers"
          value={loyalCustomers}
          helper="Repeat purchasers"
        />

        <SummaryCard
          icon={ShoppingBag}
          label="Customer Revenue"
          value={`₹${totalRevenue.toLocaleString("en-IN")}`}
          helper="Tracked purchases"
        />
      </div>

      {/* Customer List */}
      <Card padding={false}>
        <div className="border-b border-border p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-navy">
                Customer Overview
              </h2>
              <p className="mt-1 text-sm text-text-secondary">
                Search customers and view their activity.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              {/* Search */}
              <div className="relative">
                <Search
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary"
                  strokeWidth={1.8}
                />

                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search customers..."
                  className="h-10 w-full rounded-lg border border-border bg-white pl-10 pr-4 text-sm text-text outline-none transition placeholder:text-text-secondary/70 focus:border-primary focus:ring-2 focus:ring-primary/10 sm:w-64"
                />
              </div>

              {/* Segment Filter */}
              <select
                value={segmentFilter}
                onChange={(e) => setSegmentFilter(e.target.value)}
                className="h-10 rounded-lg border border-border bg-white px-4 text-sm text-text outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
              >
                <option value="All">All Customers</option>
                <option value="Loyal">Loyal</option>
                <option value="Regular">Regular</option>
                <option value="New">New</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-220">
            <thead>
              <tr className="border-b border-border bg-background/70">
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-text-secondary">
                  Customer
                </th>

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-text-secondary">
                  Segment
                </th>

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-text-secondary">
                  Purchases
                </th>

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-text-secondary">
                  Total Spent
                </th>

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-text-secondary">
                  Last Purchase
                </th>

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-text-secondary">
                  Status
                </th>
              </tr>
            </thead>

            <tbody>
              {filteredCustomers.map((customer) => (
                <tr
                  key={customer.id}
                  onClick={() => setSelectedCustomer(customer)}
                  className="cursor-pointer border-b border-border last:border-b-0 hover:bg-background/70"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-navy">
                        {customer.name.charAt(0)}
                      </div>

                      <div>
                        <p className="text-sm font-semibold text-navy">
                          {customer.name}
                        </p>

                        <p className="mt-1 text-xs text-text-secondary">
                          {customer.phone}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                        segmentStyles[customer.segment]
                      }`}
                    >
                      {customer.segment}
                    </span>
                  </td>

                  <td className="px-6 py-4 text-sm font-medium text-text">
                    {customer.purchases}
                  </td>

                  <td className="px-6 py-4 text-sm font-semibold text-navy">
                    ₹{customer.totalSpent.toLocaleString("en-IN")}
                  </td>

                  <td className="px-6 py-4 text-sm text-text-secondary">
                    {customer.lastPurchase}
                  </td>

                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                        customer.status === "Active"
                          ? "bg-success/10 text-success"
                          : "bg-background text-text-secondary"
                      }`}
                    >
                      {customer.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredCustomers.length === 0 && (
            <div className="px-6 py-12 text-center">
              <p className="text-sm font-semibold text-navy">
                No customers found
              </p>

              <p className="mt-1 text-sm text-text-secondary">
                Try changing your search or filter.
              </p>
            </div>
          )}
        </div>
      </Card>

      {/* Customer Detail Drawer */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50">
          <button
            type="button"
            aria-label="Close customer details"
            onClick={() => setSelectedCustomer(null)}
            className="absolute inset-0 bg-navy/20 backdrop-blur-[1px]"
          />

          <aside className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col border-l border-border bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-border px-6 py-5">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-text-secondary">
                  Customer Details
                </p>

                <h2 className="mt-1 text-lg font-semibold text-navy">
                  {selectedCustomer.name}
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setSelectedCustomer(null)}
                className="rounded-lg p-2 text-text-secondary transition hover:bg-background hover:text-navy"
                aria-label="Close"
              >
                <X size={20} strokeWidth={1.8} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {/* Profile */}
              <div className="flex items-center gap-4 rounded-xl bg-background p-5">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-lg font-semibold text-white">
                  {selectedCustomer.name.charAt(0)}
                </div>

                <div>
                  <p className="text-base font-semibold text-navy">
                    {selectedCustomer.name}
                  </p>

                  <p className="mt-1 text-sm text-text-secondary">
                    {selectedCustomer.phone}
                  </p>

                  <p className="mt-2 text-xs font-medium text-text-secondary">
                    {selectedCustomer.id}
                  </p>
                </div>
              </div>

              {/* Customer metrics */}
              <div className="mt-6 grid grid-cols-2 gap-4">
                <div className="rounded-xl border border-border p-4">
                  <p className="text-xs text-text-secondary">Purchases</p>
                  <p className="mt-2 text-xl font-semibold text-navy">
                    {selectedCustomer.purchases}
                  </p>
                </div>

                <div className="rounded-xl border border-border p-4">
                  <p className="text-xs text-text-secondary">Total Spent</p>
                  <p className="mt-2 text-xl font-semibold text-navy">
                    ₹
                    {selectedCustomer.totalSpent.toLocaleString("en-IN")}
                  </p>
                </div>
              </div>

              {/* Details */}
              <div className="mt-6 space-y-5">
                <DetailRow
                  label="Customer Segment"
                  value={selectedCustomer.segment}
                />

                <DetailRow
                  label="Last Purchase"
                  value={selectedCustomer.lastPurchase}
                />

                <DetailRow
                  label="Account Status"
                  value={selectedCustomer.status}
                />
              </div>

              {/* Insight */}
              <div className="mt-6 rounded-xl border border-primary/20 bg-primary/5 p-4">
                <p className="text-sm font-semibold text-navy">
                  Customer insight
                </p>

                <p className="mt-1 text-sm leading-6 text-text-secondary">
                  {selectedCustomer.segment === "Loyal"
                    ? "This customer shows repeat purchasing behaviour and may be suitable for retention-focused opportunities."
                    : selectedCustomer.segment === "New"
                      ? "This is a newer customer. Building a repeat-purchase relationship may create future value."
                      : "This customer has an established purchase history and can be monitored for repeat engagement."}
                </p>
              </div>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}

function SummaryCard({ icon: Icon, label, value, helper }) {
  return (
    <Card>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-text-secondary">{label}</p>

          <p className="mt-2 text-2xl font-semibold text-navy">{value}</p>

          <p className="mt-1 text-xs text-text-secondary">{helper}</p>
        </div>

        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon size={20} strokeWidth={1.8} />
        </div>
      </div>
    </Card>
  );
}

function DetailRow({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-6 border-b border-border pb-4">
      <p className="text-sm text-text-secondary">{label}</p>

      <p className="text-right text-sm font-medium text-navy">{value}</p>
    </div>
  );
}

export default Customers;