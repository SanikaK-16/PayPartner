import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  AlertCircle,
  Users,
  TrendingDown,
  Gift,
} from "lucide-react";

import Card from "../components/ui/Card";
import LoadingState from "../components/ui/LoadingState";
import ErrorState from "../components/ui/ErrorState";
import { get } from "../lib/api";
import { useNavigate } from "react-router-dom";

const filters = ["ALL", "HIGH", "MEDIUM", "LOW"];

function getOpportunityIcon(type = "") {
  const normalizedType = type.toLowerCase();

  if (normalizedType.includes("failed")) {
    return {
      icon: AlertCircle,
      iconStyle: "bg-error/10 text-error",
    };
  }

  if (normalizedType.includes("customer")) {
    return {
      icon: Users,
      iconStyle: "bg-primary/10 text-primary",
    };
  }

  if (normalizedType.includes("sales")) {
    return {
      icon: TrendingDown,
      iconStyle: "bg-warning/10 text-warning",
    };
  }

  return {
    icon: Gift,
    iconStyle: "bg-success/10 text-success",
  };
}

function TodaysBusiness() {
  const navigate = useNavigate();

  const [opportunities, setOpportunities] = useState([]);
  const [activeFilter, setActiveFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadOpportunities() {
      try {
        setLoading(true);
        setError("");

        const merchant = JSON.parse(
          localStorage.getItem("selectedMerchant") || "null"
        );

        if (!merchant?.id) {
          throw new Error("No merchant is selected.");
        }

        const data = await get(
          `/api/opportunities/merchant/${merchant.id}`
        );

        setOpportunities(data?.opportunities || []);
      } catch (err) {
        setError(
          err?.message || "Unable to load today's opportunities."
        );
      } finally {
        setLoading(false);
      }
    }

    loadOpportunities();
  }, []);

  const filteredOpportunities = useMemo(() => {
    if (activeFilter === "ALL") {
      return opportunities;
    }

    return opportunities.filter(
      (opportunity) =>
        String(opportunity.priority || "").toUpperCase() === activeFilter
    );
  }, [opportunities, activeFilter]);

  const priorityCounts = useMemo(() => {
    return opportunities.reduce(
      (counts, opportunity) => {
        const priority = String(
          opportunity.priority || ""
        ).toUpperCase();

        if (priority === "HIGH") counts.high += 1;
        if (priority === "MEDIUM") counts.medium += 1;
        if (priority === "LOW") counts.low += 1;

        return counts;
      },
      { high: 0, medium: 0, low: 0 }
    );
  }, [opportunities]);

  if (loading) {
    return <LoadingState message="Loading today's opportunities..." />;
  }

  if (error) {
    return <ErrorState message={error} />;
  }

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
            {opportunities.length}
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
            {priorityCounts.high}
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
            {priorityCounts.medium}
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
            {priorityCounts.low}
          </p>
          <p className="mt-1 text-xs text-text-secondary">
            Potential benefit
          </p>
        </Card>
      </div>

      {/* Filters */}
      <section>
        <div className="mb-4 flex flex-wrap gap-2">
          {filters.map((filter) => (
            <button
              key={filter}
              type="button"
              onClick={() => setActiveFilter(filter)}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                activeFilter === filter
                  ? "bg-navy text-white"
                  : "border border-border bg-white text-text-secondary hover:border-primary/40 hover:text-navy"
              }`}
            >
              {filter === "ALL"
                ? "All"
                : `${filter.charAt(0)}${filter
                    .slice(1)
                    .toLowerCase()}`}
            </button>
          ))}
        </div>

        {/* Opportunity Cards */}
        <div className="space-y-4">
          {filteredOpportunities.map((opportunity) => {
            const { icon: Icon, iconStyle } = getOpportunityIcon(
              opportunity.type
            );

            const priority = String(
              opportunity.priority || ""
            ).toUpperCase();

            const priorityStyle =
              priority === "HIGH"
                ? "bg-error/10 text-error"
                : priority === "MEDIUM"
                ? "bg-primary/10 text-primary"
                : "bg-success/10 text-success";

            return (
              <Card
                key={opportunity.id}
                className="cursor-pointer transition hover:border-primary/30 hover:shadow-md"
                onClick={() =>
                  navigate(`/opportunity/${opportunity.id}`)
                }
              >
                <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex min-w-0 items-start gap-4">
                    <div
                      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg ${iconStyle}`}
                    >
                      <Icon size={22} strokeWidth={1.8} />
                    </div>

                    <div className="min-w-0">
                      <div className="mb-2 flex flex-wrap items-center gap-2">
                        <h3 className="text-base font-semibold text-navy">
                          {opportunity.title}
                        </h3>

                        <span
                          className={`rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ${priorityStyle}`}
                        >
                          {priority}
                        </span>
                      </div>

                      <p className="text-sm text-text-secondary">
                        {opportunity.description}
                      </p>

                      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1">
                        <span className="text-sm font-semibold text-navy">
                          ₹
                          {Number(
                            opportunity.potential_value || 0
                          ).toLocaleString("en-IN")}
                          {" potential value"}
                        </span>

                        <span className="text-sm text-text-secondary">
                          Status:{" "}
                          {opportunity.status || "open"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      navigate(`/opportunity/${opportunity.id}`);
                    }}
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