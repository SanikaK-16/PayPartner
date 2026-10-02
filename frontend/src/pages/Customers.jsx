import { useEffect, useMemo, useState } from "react";
import {
  Search,
  Users,
  UserRound,
  ShoppingBag,
  TrendingUp,
  X,
} from "lucide-react";

import Card from "../components/ui/Card";
import LoadingState from "../components/ui/LoadingState";
import ErrorState from "../components/ui/ErrorState";
import EmptyState from "../components/ui/EmptyState";
import { get } from "../lib/api";

function normalizeCustomer(customer) {
  return {
    id: `CUS-${customer.id}`,
    backendId: customer.id,
    name: customer.name || "Unknown customer",
    phone: customer.phone || "—",
    purchases: Number(customer.transaction_count || 0),
    totalSpent: Number(customer.total_purchase_value || 0),
  };
}

function Customers() {
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadCustomers() {
      try {
        setLoading(true);
        setError("");

        const storedMerchant = localStorage.getItem("selectedMerchant");

        if (!storedMerchant) {
          throw new Error("No merchant is selected.");
        }

        const merchant = JSON.parse(storedMerchant);

        if (!merchant?.id) {
          throw new Error(
            "The selected merchant is not connected to the backend."
          );
        }

        const data = await get(
          `/api/customers/merchant/${merchant.id}`
        );

        const backendCustomers = Array.isArray(data?.customers)
          ? data.customers
          : [];

        setCustomers(backendCustomers.map(normalizeCustomer));
      } catch (err) {
        setError(
          err?.message ||
            "Unable to load customers. Please try again."
        );
      } finally {
        setLoading(false);
      }
    }

    loadCustomers();
  }, []);

  const filteredCustomers = useMemo(() => {
    const query = search.trim().toLowerCase();

    return customers.filter((customer) => {
      if (!query) return true;

      return (
        customer.name.toLowerCase().includes(query) ||
        customer.phone.toLowerCase().includes(query) ||
        customer.id.toLowerCase().includes(query)
      );
    });
  }, [customers, search]);

  const totalCustomers = customers.length;

  const activeCustomers = customers.filter(
    (customer) => customer.purchases > 0
  ).length;

  const repeatCustomers = customers.filter(
    (customer) => customer.purchases > 1
  ).length;

  const totalRevenue = customers.reduce(
    (sum, customer) => sum + customer.totalSpent,
    0
  );

  if (loading) {
    return <LoadingState message="Loading customers..." />;
  }

  if (error) {
    return <ErrorState message={error} />;
  }

  if (customers.length === 0) {
    return (
      <EmptyState
        title="No customers available"
        message="There are no customers available for this merchant."
      />
    );
  }

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
          helper="With recorded purchases"
        />

        <SummaryCard
          icon={TrendingUp}
          label="Repeat Customers"
          value={repeatCustomers}
          helper="More than one purchase"
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
                  Purchases
                </th>

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-text-secondary">
                  Total Spent
                </th>

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-text-secondary">
                  Customer Activity
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

                  <td className="px-6 py-4 text-sm font-medium text-text">
                    {customer.purchases}
                  </td>

                  <td className="px-6 py-4 text-sm font-semibold text-navy">
                    ₹{customer.totalSpent.toLocaleString("en-IN")}
                  </td>

                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                        customer.purchases > 1
                          ? "bg-primary/10 text-navy"
                          : "bg-background text-text-secondary"
                      }`}
                    >
                      {customer.purchases > 1
                        ? "Repeat Customer"
                        : "Single Purchase"}
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
                Try changing your search.
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
                  <p className="text-xs text-text-secondary">
                    Purchases
                  </p>

                  <p className="mt-2 text-xl font-semibold text-navy">
                    {selectedCustomer.purchases}
                  </p>
                </div>

                <div className="rounded-xl border border-border p-4">
                  <p className="text-xs text-text-secondary">
                    Total Spent
                  </p>

                  <p className="mt-2 text-xl font-semibold text-navy">
                    ₹
                    {selectedCustomer.totalSpent.toLocaleString(
                      "en-IN"
                    )}
                  </p>
                </div>
              </div>

              {/* Details */}
              <div className="mt-6 space-y-5">
                <DetailRow
                  label="Customer ID"
                  value={selectedCustomer.id}
                />

                <DetailRow
                  label="Phone"
                  value={selectedCustomer.phone}
                />

                <DetailRow
                  label="Purchase Count"
                  value={selectedCustomer.purchases}
                />

                <DetailRow
                  label="Total Purchase Value"
                  value={`₹${selectedCustomer.totalSpent.toLocaleString(
                    "en-IN"
                  )}`}
                />
              </div>

              {/* Insight */}
              <div className="mt-6 rounded-xl border border-primary/20 bg-primary/5 p-4">
                <p className="text-sm font-semibold text-navy">
                  Customer insight
                </p>

                <p className="mt-1 text-sm leading-6 text-text-secondary">
                  {selectedCustomer.purchases > 1
                    ? "This customer has made multiple purchases and may be relevant for repeat-engagement opportunities."
                    : "This customer currently has one recorded purchase. Future activity can help identify repeat-engagement opportunities."}
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

          <p className="mt-2 text-2xl font-semibold text-navy">
            {value}
          </p>

          <p className="mt-1 text-xs text-text-secondary">
            {helper}
          </p>
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
    <div className="flex items-start justify-between gap-6 border-b border-border pb-4 last:border-b-0 last:pb-0">
      <p className="shrink-0 text-sm text-text-secondary">
        {label}
      </p>

      <p className="text-right text-sm font-medium text-navy">
        {value || "—"}
      </p>
    </div>
  );
}

export default Customers;