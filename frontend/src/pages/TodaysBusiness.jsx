import {
  ArrowRight,
  AlertCircle,
  Users,
  TrendingDown,
  Gift,
} from "lucide-react";

import Card from "../components/ui/Card";
import { useNavigate } from "react-router-dom";
const opportunities = [
  {
    id: "failed-payment",
    priority: "HIGH",
    title: "Failed Payment Recovery",
    description: "Recover revenue from recent failed payment attempts.",
    impact: "₹4,200 revenue at risk",
    detail: "17 failed payments detected",
    icon: AlertCircle,
    iconStyle: "bg-error/10 text-error",
    priorityStyle: "bg-error/10 text-error",
  },
  {
    id: "repeat-customer",
    priority: "MEDIUM",
    title: "Repeat Customer Opportunity",
    description: "Bring back customers who have not returned recently.",
    impact: "14 customers identified",
    detail: "Lapsed repeat customers",
    icon: Users,
    iconStyle: "bg-primary/10 text-primary",
    priorityStyle: "bg-primary/10 text-primary",
  },
  {
    id: "sales-pattern",
    priority: "MEDIUM",
    title: "Sales Pattern Opportunity",
    description: "A recurring period is performing below the usual baseline.",
    impact: "Tuesday, 2–5 PM",
    detail: "18% below baseline",
    icon: TrendingDown,
    iconStyle: "bg-warning/10 text-warning",
    priorityStyle: "bg-primary/10 text-primary",
  },
  {
    id: "merchant-benefit",
    priority: "LOW",
    title: "Merchant Benefit",
    description: "A benefit may be available for your business.",
    impact: "Potential benefit available",
    detail: "Review eligibility and details",
    icon: Gift,
    iconStyle: "bg-success/10 text-success",
    priorityStyle: "bg-success/10 text-success",
  },
];

const filters = ["ALL", "HIGH", "MEDIUM", "LOW"];

function TodaysBusiness() {
    const navigate = useNavigate();
  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h2 className="text-2xl font-semibold text-navy">
          Today's Business
        </h2>

        <p className="mt-1 text-sm text-text-secondary">
          Opportunities and actions that need your attention today.
        </p>
      </div>

      {/* Priority Summary */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card>
          <p className="text-sm text-text-secondary">
            Opportunities
          </p>
          <p className="mt-2 text-2xl font-semibold text-navy">
            4
          </p>
          <p className="mt-1 text-xs text-text-secondary">
            Requiring review
          </p>
        </Card>

        <Card>
          <p className="text-sm text-text-secondary">
            High Priority
          </p>
          <p className="mt-2 text-2xl font-semibold text-error">
            1
          </p>
          <p className="mt-1 text-xs text-text-secondary">
            Requires attention
          </p>
        </Card>

        <Card>
          <p className="text-sm text-text-secondary">
            Medium Priority
          </p>
          <p className="mt-2 text-2xl font-semibold text-warning">
            2
          </p>
          <p className="mt-1 text-xs text-text-secondary">
            Growth opportunities
          </p>
        </Card>

        <Card>
          <p className="text-sm text-text-secondary">
            Low Priority
          </p>
          <p className="mt-2 text-2xl font-semibold text-success">
            1
          </p>
          <p className="mt-1 text-xs text-text-secondary">
            Potential benefit
          </p>
        </Card>
      </div>

      {/* Filters */}
      <section>
        <div className="mb-4 flex flex-wrap gap-2">
          {filters.map((filter, index) => (
            <button
              key={filter}
              type="button"
              className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                index === 0
                  ? "bg-navy text-white"
                  : "border border-border bg-white text-text-secondary hover:border-primary/40 hover:text-navy"
              }`}
            >
              {filter === "ALL"
                ? "All"
                : `${filter.charAt(0)}${filter.slice(1).toLowerCase()}`}
            </button>
          ))}
        </div>

        {/* Opportunity Cards */}
        <div className="space-y-4">
          {opportunities.map((opportunity) => {
            const Icon = opportunity.icon;

            return (
              <Card
  key={opportunity.id}
  className="cursor-pointer transition hover:border-primary/30 hover:shadow-md"
  onClick={() => navigate(`/opportunity/${opportunity.id}`)}
>
                <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex min-w-0 items-start gap-4">
                    <div
                      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg ${opportunity.iconStyle}`}
                    >
                      <Icon size={22} strokeWidth={1.8} />
                    </div>

                    <div className="min-w-0">
                      <div className="mb-2 flex flex-wrap items-center gap-2">
                        <h3 className="text-base font-semibold text-navy">
                          {opportunity.title}
                        </h3>

                        <span
                          className={`rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ${opportunity.priorityStyle}`}
                        >
                          {opportunity.priority}
                        </span>
                      </div>

                      <p className="text-sm text-text-secondary">
                        {opportunity.description}
                      </p>

                      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1">
                        <span className="text-sm font-semibold text-navy">
                          {opportunity.impact}
                        </span>

                        <span className="text-sm text-text-secondary">
                          {opportunity.detail}
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg border border-border bg-white px-4 py-2.5 text-sm font-semibold text-navy transition hover:border-primary hover:text-primary"
                  >
                    Review opportunity
                    <ArrowRight size={16} strokeWidth={2} />
                  </button>
                </div>
              </Card>
            );
          })}
        </div>
      </section>
    </div>
  );
}

export default TodaysBusiness;