import { useMemo, useState } from "react";
import {
  Activity as ActivityIcon,
  CheckCircle2,
  Clock3,
  AlertCircle,
  Search,
  Filter,
} from "lucide-react";
import Card from "../components/ui/Card";

const activities = [
  {
    id: 1,
    type: "action",
    title: "Failed payment recovery initiated",
    description:
      "A recovery action was initiated for a failed payment opportunity.",
    time: "Today, 10:45 AM",
    status: "Completed",
    category: "Actions",
  },
  {
    id: 2,
    type: "insight",
    title: "Repeat customer opportunity identified",
    description:
      "PayPartner identified a customer with repeat-purchase potential.",
    time: "Today, 10:20 AM",
    status: "Reviewed",
    category: "Insights",
  },
  {
    id: 3,
    type: "policy",
    title: "Discount policy reviewed",
    description:
      "Current discount rules were checked before generating a recommendation.",
    time: "Today, 09:58 AM",
    status: "Completed",
    category: "Policies",
  },
  {
    id: 4,
    type: "action",
    title: "Customer offer prepared",
    description:
      "A customer-focused offer was prepared within the configured policy limits.",
    time: "Today, 09:40 AM",
    status: "Pending",
    category: "Actions",
  },
  {
    id: 5,
    type: "system",
    title: "Transaction data synchronized",
    description:
      "Recent transaction activity was processed for business insights.",
    time: "Today, 09:15 AM",
    status: "Completed",
    category: "System",
  },
  {
    id: 6,
    type: "insight",
    title: "Sales pattern detected",
    description:
      "A change in recent sales behaviour was identified for review.",
    time: "Yesterday, 06:32 PM",
    status: "Reviewed",
    category: "Insights",
  },
  {
    id: 7,
    type: "policy",
    title: "Merchant rules checked",
    description:
      "Business rules were verified before an opportunity was presented.",
    time: "Yesterday, 05:48 PM",
    status: "Completed",
    category: "Policies",
  },
  {
    id: 8,
    type: "action",
    title: "Opportunity marked for review",
    description:
      "A merchant opportunity was added to the attention queue.",
    time: "Yesterday, 04:20 PM",
    status: "Pending",
    category: "Actions",
  },
];

const categoryStyles = {
  Actions: "bg-primary/10 text-primary",
  Insights: "bg-success/10 text-success",
  Policies: "bg-warning/10 text-warning",
  System: "bg-background text-text-secondary",
};

function Activity() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  const filteredActivities = useMemo(() => {
    const query = search.trim().toLowerCase();

    return activities.filter((item) => {
      const matchesSearch =
        !query ||
        item.title.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query);

      const matchesCategory =
        category === "All" || item.category === category;

      return matchesSearch && matchesCategory;
    });
  }, [search, category]);

  const completedCount = activities.filter(
    (item) => item.status === "Completed"
  ).length;

  const pendingCount = activities.filter(
    (item) => item.status === "Pending"
  ).length;

  const reviewedCount = activities.filter(
    (item) => item.status === "Reviewed"
  ).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-navy">
          Activity
        </h1>
        <p className="mt-1 text-sm text-text-secondary">
          Track recommendations, actions, policy checks, and business events.
        </p>
      </div>

      {/* Summary */}
      <div className="grid gap-4 md:grid-cols-3">
        <SummaryCard
          icon={CheckCircle2}
          label="Completed"
          value={completedCount}
          helper="Completed activities"
        />

        <SummaryCard
          icon={Clock3}
          label="Pending"
          value={pendingCount}
          helper="Awaiting attention"
        />

        <SummaryCard
          icon={ActivityIcon}
          label="Reviewed"
          value={reviewedCount}
          helper="Activities reviewed"
        />
      </div>

      {/* Activity List */}
      <Card padding={false}>
        <div className="border-b border-border p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-navy">
                Recent Activity
              </h2>

              <p className="mt-1 text-sm text-text-secondary">
                A transparent record of PayPartner activity.
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
                  placeholder="Search activity..."
                  className="h-10 w-full rounded-lg border border-border bg-white pl-10 pr-4 text-sm text-text outline-none transition placeholder:text-text-secondary/70 focus:border-primary focus:ring-2 focus:ring-primary/10 sm:w-64"
                />
              </div>

              {/* Category Filter */}
              <div className="relative">
                <Filter
                  size={17}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary"
                  strokeWidth={1.8}
                />

                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="h-10 appearance-none rounded-lg border border-border bg-white pl-9 pr-8 text-sm text-text outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                >
                  <option value="All">All Activity</option>
                  <option value="Actions">Actions</option>
                  <option value="Insights">Insights</option>
                  <option value="Policies">Policies</option>
                  <option value="System">System</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="divide-y divide-border">
          {filteredActivities.map((item) => (
            <div
              key={item.id}
              className="flex gap-4 px-6 py-5 transition hover:bg-background/60"
            >
              <ActivityMarker type={item.type} />

              <div className="min-w-0 flex-1">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-sm font-semibold text-navy">
                        {item.title}
                      </h3>

                      <span
                        className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                          categoryStyles[item.category]
                        }`}
                      >
                        {item.category}
                      </span>
                    </div>

                    <p className="mt-1.5 max-w-2xl text-sm leading-6 text-text-secondary">
                      {item.description}
                    </p>
                  </div>

                  <div className="shrink-0 sm:text-right">
                    <p className="text-xs text-text-secondary">
                      {item.time}
                    </p>

                    <p
                      className={`mt-1 text-xs font-medium ${
                        item.status === "Completed"
                          ? "text-success"
                          : item.status === "Pending"
                            ? "text-warning"
                            : "text-text-secondary"
                      }`}
                    >
                      {item.status}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {filteredActivities.length === 0 && (
            <div className="px-6 py-12 text-center">
              <p className="text-sm font-semibold text-navy">
                No activity found
              </p>

              <p className="mt-1 text-sm text-text-secondary">
                Try changing your search or filter.
              </p>
            </div>
          )}
        </div>
      </Card>

      {/* Transparency Note */}
      <div className="flex items-start gap-3 rounded-xl border border-border bg-white p-5">
        <AlertCircle
          size={19}
          className="mt-0.5 shrink-0 text-text-secondary"
          strokeWidth={1.8}
        />

        <div>
          <p className="text-sm font-semibold text-navy">
            Activity transparency
          </p>

          <p className="mt-1 text-sm leading-6 text-text-secondary">
            This activity view helps you understand what PayPartner detected,
            recommended, reviewed, or acted on.
          </p>
        </div>
      </div>
    </div>
  );
}

function ActivityMarker({ type }) {
  const styles = {
    action: "bg-primary/10 text-primary",
    insight: "bg-success/10 text-success",
    policy: "bg-warning/10 text-warning",
    system: "bg-background text-text-secondary",
  };

  return (
    <div
      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
        styles[type]
      }`}
    >
      <ActivityIcon size={19} strokeWidth={1.8} />
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

export default Activity;