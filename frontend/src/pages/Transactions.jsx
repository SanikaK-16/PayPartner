import { useEffect, useMemo, useState } from "react";
import {
  Search,
  SlidersHorizontal,
  X,
  CheckCircle2,
  Clock3,
  XCircle,
  ArrowDownLeft,
} from "lucide-react";

import Card from "../components/ui/Card";
import LoadingState from "../components/ui/LoadingState";
import ErrorState from "../components/ui/ErrorState";
import EmptyState from "../components/ui/EmptyState";
import { get } from "../lib/api";

const statusConfig = {
  Success: {
    icon: CheckCircle2,
    className: "bg-success/10 text-success",
  },
  Pending: {
    icon: Clock3,
    className: "bg-warning/10 text-warning",
  },
  Failed: {
    icon: XCircle,
    className: "bg-error/10 text-error",
  },
};

function formatStatus(status) {
  if (!status) return "Unknown";

  return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
}

function formatDateTime(value) {
  if (!value) {
    return {
      date: "—",
      time: "—",
    };
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return {
      date: value,
      time: "—",
    };
  }

  return {
    date: date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }),
    time: date.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    }),
  };
}

function normalizeTransaction(transaction) {
  const { date, time } = formatDateTime(transaction.created_at);

  return {
    id: `TXN-${transaction.id}`,
    customer: transaction.customer || "Unknown customer",
    amount: Number(transaction.amount || 0),
    method: transaction.payment_method || "Unknown",
    status: formatStatus(transaction.status),
    date,
    time,
    category: transaction.product || "Purchase",
  };
}
function DetailRow({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-6 border-b border-border pb-4 last:border-b-0 last:pb-0">
      <p className="shrink-0 text-sm text-text-secondary">
        {label}
      </p>

      <p className="text-right text-sm font-medium text-text">
        {value || "—"}
      </p>
    </div>
  );
}
function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadTransactions() {
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
          `/api/transactions/merchant/${merchant.id}`
        );

        const backendTransactions = Array.isArray(data?.transactions)
          ? data.transactions
          : [];

        setTransactions(backendTransactions.map(normalizeTransaction));
      } catch (err) {
        setError(
          err?.message ||
            "Unable to load transactions. Please try again."
        );
      } finally {
        setLoading(false);
      }
    }

    loadTransactions();
  }, []);

  const filteredTransactions = useMemo(() => {
    const query = search.trim().toLowerCase();

    return transactions.filter((transaction) => {
      const matchesSearch =
        !query ||
        transaction.customer.toLowerCase().includes(query) ||
        transaction.id.toLowerCase().includes(query) ||
        transaction.method.toLowerCase().includes(query) ||
        transaction.category.toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === "All" ||
        transaction.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [transactions, search, statusFilter]);

  const totalAmount = transactions
    .filter((transaction) => transaction.status === "Success")
    .reduce((sum, transaction) => sum + transaction.amount, 0);

  const successfulCount = transactions.filter(
    (transaction) => transaction.status === "Success"
  ).length;

  const failedCount = transactions.filter(
    (transaction) => transaction.status === "Failed"
  ).length;

  if (loading) {
    return <LoadingState message="Loading transactions..." />;
  }

  if (error) {
    return <ErrorState message={error} />;
  }

  if (transactions.length === 0) {
    return (
      <EmptyState
        title="No transactions available"
        message="There are no transactions available for this merchant."
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-navy">
          Transactions
        </h1>

        <p className="mt-1 text-sm text-text-secondary">
          View and track your recent business transactions.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <p className="text-sm text-text-secondary">
            Successful Payments
          </p>

          <p className="mt-2 text-2xl font-semibold text-navy">
            {successfulCount}
          </p>

          <p className="mt-1 text-xs text-success">
            ₹{totalAmount.toLocaleString("en-IN")} processed
          </p>
        </Card>

        <Card>
          <p className="text-sm text-text-secondary">
            Failed Payments
          </p>

          <p className="mt-2 text-2xl font-semibold text-navy">
            {failedCount}
          </p>

          <p className="mt-1 text-xs text-error">
            Requires attention
          </p>
        </Card>

        <Card>
          <p className="text-sm text-text-secondary">
            Total Transactions
          </p>

          <p className="mt-2 text-2xl font-semibold text-navy">
            {transactions.length}
          </p>

          <p className="mt-1 text-xs text-text-secondary">
            Across recent activity
          </p>
        </Card>
      </div>

      {/* Transactions Table */}
      <Card padding={false}>
        <div className="border-b border-border p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-navy">
                Recent Transactions
              </h2>

              <p className="mt-1 text-sm text-text-secondary">
                Search and filter your payment activity.
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
                  placeholder="Search transactions..."
                  className="h-10 w-full rounded-lg border border-border bg-white pl-10 pr-4 text-sm text-text outline-none transition placeholder:text-text-secondary/70 focus:border-primary focus:ring-2 focus:ring-primary/10 sm:w-64"
                />
              </div>

              {/* Status Filter */}
              <div className="relative">
                <SlidersHorizontal
                  size={17}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary"
                  strokeWidth={1.8}
                />

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="h-10 appearance-none rounded-lg border border-border bg-white pl-9 pr-8 text-sm text-text outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                >
                  <option value="All">All Status</option>
                  <option value="Success">Success</option>
                  <option value="Pending">Pending</option>
                  <option value="Failed">Failed</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-180">
            <thead>
              <tr className="border-b border-border bg-background/70">
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-text-secondary">
                  Transaction
                </th>

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-text-secondary">
                  Customer
                </th>

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-text-secondary">
                  Amount
                </th>

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-text-secondary">
                  Method
                </th>

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-text-secondary">
                  Status
                </th>

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-text-secondary">
                  Date
                </th>
              </tr>
            </thead>

            <tbody>
              {filteredTransactions.map((transaction) => {
                const config =
                  statusConfig[transaction.status] ||
                  statusConfig.Pending;

                const StatusIcon = config.icon;

                return (
                  <tr
                    key={transaction.id}
                    onClick={() =>
                      setSelectedTransaction(transaction)
                    }
                    className="cursor-pointer border-b border-border last:border-b-0 hover:bg-background/70"
                  >
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-semibold text-navy">
                          {transaction.id}
                        </p>

                        <p className="mt-1 max-w-48 truncate text-xs text-text-secondary">
                          {transaction.category}
                        </p>
                      </div>
                    </td>

                    <td className="px-6 py-4 text-sm text-text">
                      {transaction.customer}
                    </td>

                    <td className="px-6 py-4 text-sm font-semibold text-navy">
                      ₹{transaction.amount.toLocaleString("en-IN")}
                    </td>

                    <td className="px-6 py-4 text-sm text-text-secondary">
                      {transaction.method}
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${config.className}`}
                      >
                        <StatusIcon size={14} strokeWidth={2} />
                        {transaction.status}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <p className="text-sm text-text">
                        {transaction.date}
                      </p>

                      <p className="mt-1 text-xs text-text-secondary">
                        {transaction.time}
                      </p>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {filteredTransactions.length === 0 && (
            <div className="px-6 py-12 text-center">
              <p className="text-sm font-semibold text-navy">
                No transactions found
              </p>

              <p className="mt-1 text-sm text-text-secondary">
                Try changing your search or filter.
              </p>
            </div>
          )}
        </div>
      </Card>

      {/* Transaction Detail Drawer */}
      {selectedTransaction && (
        <div className="fixed inset-0 z-50">
          <button
            type="button"
            aria-label="Close transaction details"
            onClick={() => setSelectedTransaction(null)}
            className="absolute inset-0 bg-navy/20 backdrop-blur-[1px]"
          />

          <aside className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col border-l border-border bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-border px-6 py-5">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-text-secondary">
                  Transaction Details
                </p>

                <h2 className="mt-1 text-lg font-semibold text-navy">
                  {selectedTransaction.id}
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setSelectedTransaction(null)}
                className="rounded-lg p-2 text-text-secondary transition hover:bg-background hover:text-navy"
                aria-label="Close"
              >
                <X size={20} strokeWidth={1.8} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <div className="rounded-xl bg-background p-5">
                <p className="text-sm text-text-secondary">
                  Payment Amount
                </p>

                <p className="mt-2 text-3xl font-semibold text-navy">
                  ₹
                  {selectedTransaction.amount.toLocaleString(
                    "en-IN"
                  )}
                </p>

                <div className="mt-4">
                  {(() => {
                    const config =
                      statusConfig[selectedTransaction.status] ||
                      statusConfig.Pending;

                    const StatusIcon = config.icon;

                    return (
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${config.className}`}
                      >
                        <StatusIcon
                          size={14}
                          strokeWidth={2}
                        />

                        {selectedTransaction.status}
                      </span>
                    );
                  })()}
                </div>
              </div>

              <div className="mt-6 space-y-5">
                <DetailRow
                  label="Customer"
                  value={selectedTransaction.customer}
                />

                <DetailRow
                  label="Payment Method"
                  value={selectedTransaction.method}
                />

                <DetailRow
                  label="Date"
                  value={`${selectedTransaction.date}, ${selectedTransaction.time}`}
                />

                <DetailRow
                  label="Product"
                  value={selectedTransaction.category}
                />

                <DetailRow
                  label="Transaction ID"
                  value={selectedTransaction.id}
                />
              </div>

              {selectedTransaction.status === "Failed" && (
                <div className="mt-6 rounded-xl border border-error/20 bg-error/5 p-4">
                  <div className="flex gap-3">
                    <ArrowDownLeft
                      size={19}
                      className="mt-0.5 shrink-0 text-error"
                      strokeWidth={1.8}
                    />

                    <div>
                      <p className="text-sm font-semibold text-navy">
                        Payment requires attention
                      </p>

                      <p className="mt-1 text-sm leading-6 text-text-secondary">
                        This payment was unsuccessful and may represent a
                        recoverable sales opportunity.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}

export default Transactions;