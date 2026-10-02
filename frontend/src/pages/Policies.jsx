import { useEffect, useState } from "react";
import {
  ShieldCheck,
  CreditCard,
  MessageSquare,
  Percent,
  Wallet,
  BadgeCheck,
  ChevronRight,
  CheckCircle2,
  X,
} from "lucide-react";

import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import LoadingState from "../components/ui/LoadingState";
import ErrorState from "../components/ui/ErrorState";
import { get, put } from "../lib/api";

const policyDefinitions = [
  {
    id: "automatic_recovery",
    title: "Automatic Payment Recovery",
    description:
      "Controls whether PayPartner can automatically act on eligible failed payments.",
    icon: CreditCard,
    type: "toggle",
    detail:
      "When enabled, PayPartner can identify eligible failed-payment opportunities and proceed with recovery actions when the configured policy allows them.",
  },
  {
    id: "automatic_messaging",
    title: "Automatic Customer Messaging",
    description:
      "Controls whether PayPartner can automatically send eligible customer messages.",
    icon: MessageSquare,
    type: "toggle",
    detail:
      "When enabled, PayPartner can send customer-facing messages for eligible actions while respecting the merchant's configured rules.",
  },
  {
    id: "max_discount_percent",
    title: "Maximum Discount",
    description:
      "Sets the highest discount percentage PayPartner can propose or apply.",
    icon: Percent,
    type: "percentage",
    detail:
      "Discount-based actions must remain within this configured percentage limit. Actions above the limit require approval when approval controls are enabled.",
  },
  {
    id: "campaign_limit",
    title: "Campaign Budget",
    description:
      "Sets the maximum budget available for campaign-related actions.",
    icon: Wallet,
    type: "currency",
    detail:
      "Campaign-related actions must remain within this configured budget. The value is treated as the merchant's campaign spending limit.",
  },
  {
    id: "approval_above_limit",
    title: "Approval Above Limit",
    description:
      "Requires merchant approval when an action exceeds a configured limit.",
    icon: BadgeCheck,
    type: "toggle",
    detail:
      "When enabled, PayPartner should request merchant approval before proceeding with an action that exceeds the applicable configured policy limit.",
  },
];

function formatPolicyValue(policy, value) {
  if (policy.type === "toggle") {
    return value ? "Enabled" : "Disabled";
  }

  if (policy.type === "percentage") {
    return `${value}%`;
  }

  if (policy.type === "currency") {
    return `₹${Number(value).toLocaleString("en-IN")}`;
  }

  return value;
}

function normalizePolicy(policy) {
  return {
    automatic_recovery: Boolean(policy.automatic_recovery),
    automatic_messaging: Boolean(policy.automatic_messaging),
    max_discount_percent: Number(policy.max_discount_percent),
    campaign_limit: Number(policy.campaign_limit),
    approval_above_limit: Boolean(policy.approval_above_limit),
  };
}

function Policies() {
  const [policies, setPolicies] = useState(null);
  const [originalPolicies, setOriginalPolicies] = useState(null);
  const [selectedPolicy, setSelectedPolicy] = useState(null);

  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadPolicies() {
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
          `/api/policies/merchant/${merchant.id}`
        );

        if (!data?.policy) {
          throw new Error(
            "Policy configuration was not returned by the backend."
          );
        }

        const normalized = normalizePolicy(data.policy);

        setPolicies(normalized);
        setOriginalPolicies(normalized);
      } catch (err) {
        setError(
          err?.message ||
            "Unable to load policies. Please try again."
        );
      } finally {
        setLoading(false);
      }
    }

    loadPolicies();
  }, []);

  const hasChanges =
    policies &&
    originalPolicies &&
    JSON.stringify(policies) !== JSON.stringify(originalPolicies);

  const handleToggle = (id) => {
    setPolicies((current) => ({
      ...current,
      [id]: !current[id],
    }));

    setSaved(false);
  };

  const handleNumericChange = (id, value) => {
    const numericValue = value === "" ? "" : Number(value);

    setPolicies((current) => ({
      ...current,
      [id]: numericValue,
    }));

    setSaved(false);
  };

  const handleSave = async () => {
    if (!hasChanges || saving || !policies) {
      return;
    }

    try {
      setSaving(true);
      setSaved(false);
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

      const payload = {
        automatic_recovery: Boolean(policies.automatic_recovery),
        automatic_messaging: Boolean(policies.automatic_messaging),
        max_discount_percent: Number(
          policies.max_discount_percent
        ),
        campaign_limit: Number(policies.campaign_limit),
        approval_above_limit: Boolean(
          policies.approval_above_limit
        ),
      };

      const data = await put(
        `/api/policies/merchant/${merchant.id}`,
        payload
      );

      if (!data?.policy) {
        throw new Error(
          "The backend did not return the updated policy."
        );
      }

      const updatedPolicies = normalizePolicy(data.policy);

      setPolicies(updatedPolicies);
      setOriginalPolicies(updatedPolicies);
      setSaved(true);

      setTimeout(() => {
        setSaved(false);
      }, 2500);
    } catch (err) {
      setError(
        err?.message ||
          "Unable to save policies. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingState message="Loading policies..." />;
  }

  if (error && !policies) {
    return <ErrorState message={error} />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-navy">
          Policies
        </h1>

        <p className="mt-1 text-sm text-text-secondary">
          Define the rules PayPartner should follow for your business.
        </p>
      </div>

      {/* Trust Banner */}
      <div className="flex items-start gap-4 rounded-xl border border-primary/20 bg-primary/5 p-5">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white text-primary shadow-sm">
          <ShieldCheck size={21} strokeWidth={1.8} />
        </div>

        <div>
          <p className="text-sm font-semibold text-navy">
            Your business rules come first
          </p>

          <p className="mt-1 max-w-3xl text-sm leading-6 text-text-secondary">
            PayPartner uses these policies to keep recommendations and
            merchant actions within the limits you define.
          </p>
        </div>
      </div>

      {/* Save Error */}
      {error && policies && (
        <div className="rounded-xl border border-error/20 bg-error/5 px-5 py-4">
          <p className="text-sm font-semibold text-error">
            Unable to save policy changes
          </p>

          <p className="mt-1 text-sm text-text-secondary">
            {error}
          </p>
        </div>
      )}

      {/* Policy Cards */}
      <div className="grid gap-5 md:grid-cols-2">
        {policyDefinitions.map((policy) => {
          const Icon = policy.icon;
          const value = policies[policy.id];

          const isEnabled =
            policy.type === "toggle" ? Boolean(value) : true;

          return (
            <Card key={policy.id}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex min-w-0 items-start gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon size={21} strokeWidth={1.8} />
                  </div>

                  <div className="min-w-0">
                    <h2 className="text-base font-semibold text-navy">
                      {policy.title}
                    </h2>

                    <p className="mt-1 text-sm leading-6 text-text-secondary">
                      {policy.description}
                    </p>
                  </div>
                </div>

                {policy.type === "toggle" && (
                  <span
                    className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${
                      isEnabled
                        ? "bg-success/10 text-success"
                        : "bg-background text-text-secondary"
                    }`}
                  >
                    {isEnabled ? "Enabled" : "Disabled"}
                  </span>
                )}
              </div>

              <div className="mt-6 border-t border-border pt-5">
                {policy.type === "toggle" ? (
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-xs text-text-secondary">
                        Current setting
                      </p>

                      <p className="mt-1 text-sm font-semibold text-navy">
                        {formatPolicyValue(policy, value)}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => handleToggle(policy.id)}
                        className={`relative h-6 w-11 rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:ring-offset-1 ${
                          isEnabled ? "bg-primary" : "bg-border"
                        }`}
                        aria-label={`Toggle ${policy.title}`}
                        aria-pressed={isEnabled}
                      >
                        <span
                          className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition-all duration-200 ${
                            isEnabled ? "left-6" : "left-1"
                          }`}
                        />
                      </button>

                      <button
                        type="button"
                        onClick={() => setSelectedPolicy(policy)}
                        className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-sm font-medium text-navy transition-all duration-200 hover:bg-primary/5 hover:text-primary"
                      >
                        Details
                        <ChevronRight
                          size={16}
                          strokeWidth={1.8}
                        />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div className="flex-1">
                      <label
                        htmlFor={policy.id}
                        className="text-xs text-text-secondary"
                      >
                        Current setting
                      </label>

                      <div className="mt-1 flex max-w-xs items-center rounded-lg border border-border bg-white transition focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20">
                        {policy.type === "currency" && (
                          <span className="pl-3 text-sm font-medium text-text-secondary">
                            ₹
                          </span>
                        )}

                        <input
                          id={policy.id}
                          type="number"
                          min="0"
                          max={
                            policy.type === "percentage"
                              ? 100
                              : undefined
                          }
                          value={value}
                          onChange={(event) =>
                            handleNumericChange(
                              policy.id,
                              event.target.value
                            )
                          }
                          className="w-full bg-transparent px-3 py-2.5 text-sm font-semibold text-navy outline-none"
                        />

                        {policy.type === "percentage" && (
                          <span className="pr-3 text-sm font-medium text-text-secondary">
                            %
                          </span>
                        )}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setSelectedPolicy(policy)}
                      className="flex items-center gap-1 self-start rounded-lg px-2 py-1.5 text-sm font-medium text-navy transition-all duration-200 hover:bg-primary/5 hover:text-primary sm:self-auto"
                    >
                      Details
                      <ChevronRight
                        size={16}
                        strokeWidth={1.8}
                      />
                    </button>
                  </div>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      {/* Save Section */}
      <Card className="relative">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between lg:pr-28">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-navy">
              Policy configuration
            </p>

            <p className="mt-1 text-sm leading-6 text-text-secondary">
              Save your current business rules before continuing.
            </p>
          </div>

          <div className="flex shrink-0 flex-col items-stretch gap-3 sm:flex-row sm:items-center">
            {saved && (
              <span className="flex items-center justify-center gap-1.5 text-sm font-medium text-success">
                <CheckCircle2 size={17} strokeWidth={1.8} />
                Policies saved successfully
              </span>
            )}

            <Button
              onClick={handleSave}
              disabled={!hasChanges || saving}
              className="min-w-32"
            >
              {saving ? "Saving..." : "Save Policies"}
            </Button>
          </div>
        </div>
      </Card>

      {/* Policy Details Drawer */}
      {selectedPolicy && (
        <div className="fixed inset-0 z-50">
          <button
            type="button"
            aria-label="Close policy details"
            onClick={() => setSelectedPolicy(null)}
            className="absolute inset-0 bg-navy/20 backdrop-blur-[1px]"
          />

          <aside className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col border-l border-border bg-white shadow-xl">
            {/* Drawer Header */}
            <div className="flex items-center justify-between border-b border-border px-6 py-5">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-text-secondary">
                  Policy Details
                </p>

                <h2 className="mt-1 text-lg font-semibold text-navy">
                  {selectedPolicy.title}
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setSelectedPolicy(null)}
                className="rounded-lg p-2 text-text-secondary transition hover:bg-background hover:text-navy focus:outline-none focus:ring-2 focus:ring-primary/30"
                aria-label="Close"
              >
                <X size={20} strokeWidth={1.8} />
              </button>
            </div>

            {/* Drawer Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="flex items-center gap-4 rounded-xl bg-background p-5">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  {(() => {
                    const Icon = selectedPolicy.icon;
                    return <Icon size={22} strokeWidth={1.8} />;
                  })()}
                </div>

                <div>
                  <p className="text-base font-semibold text-navy">
                    {formatPolicyValue(
                      selectedPolicy,
                      policies[selectedPolicy.id]
                    )}
                  </p>

                  <p className="mt-1 text-sm text-text-secondary">
                    Current configuration
                  </p>
                </div>
              </div>

              <div className="mt-6">
                <p className="text-sm font-semibold text-navy">
                  About this policy
                </p>

                <p className="mt-2 text-sm leading-6 text-text-secondary">
                  {selectedPolicy.detail}
                </p>
              </div>

              <div className="mt-6 rounded-xl border border-primary/20 bg-primary/5 p-4">
                <div className="flex gap-3">
                  <ShieldCheck
                    size={19}
                    className="mt-0.5 shrink-0 text-primary"
                    strokeWidth={1.8}
                  />

                  <p className="text-sm leading-6 text-text-secondary">
                    PayPartner should respect this rule when generating
                    recommendations or proposing merchant actions.
                  </p>
                </div>
              </div>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}

export default Policies;