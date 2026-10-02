import {
  ArrowLeft,
  CheckCircle2,
  ShieldCheck,
  Play,
  RotateCcw,
  AlertCircle,
  Users,
  TrendingDown,
  Gift,
  Loader2,
  XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import LoadingState from "../components/ui/LoadingState";
import ErrorState from "../components/ui/ErrorState";
import { get } from "../lib/api";

const WORKFLOW_1_WEBHOOK =
  "https://sanikak123.app.n8n.cloud/webhook/paypartner/orchestrate";

const opportunityTypeConfig = {
  failed_payment_recovery: {
    icon: AlertCircle,
    iconStyle: "bg-error/10 text-error",
  },
  repeat_customer: {
    icon: Users,
    iconStyle: "bg-primary/10 text-primary",
  },
  sales_pattern: {
    icon: TrendingDown,
    iconStyle: "bg-warning/10 text-warning",
  },
  merchant_benefit: {
    icon: Gift,
    iconStyle: "bg-success/10 text-success",
  },
};

function StepHeader({ number, title, icon: Icon }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Icon size={18} strokeWidth={1.8} />
      </div>

      <div className="flex items-center gap-2">
        <span className="text-xs font-semibold text-text-secondary">
          STEP {number}
        </span>

        <h3 className="text-base font-semibold text-navy">
          {title}
        </h3>
      </div>
    </div>
  );
}

function StatusBadge({ children, tone = "neutral" }) {
  const styles = {
    success: "bg-success/10 text-success",
    warning: "bg-warning/10 text-warning",
    error: "bg-error/10 text-error",
    neutral: "bg-background text-text-secondary",
  };

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${styles[tone]}`}
    >
      {children}
    </span>
  );
}

function ImpactMetric({ label, value }) {
  return (
    <div className="rounded-lg border border-border bg-white p-4">
      <p className="text-xs font-medium text-text-secondary">
        {label}
      </p>

      <p className="mt-2 text-xl font-semibold text-navy">
        {value}
      </p>
    </div>
  );
}

function formatCurrency(value) {
  return `₹${Number(value || 0).toLocaleString("en-IN")}`;
}

function OpportunityDetail() {
  const { type: opportunityId } = useParams();
  const navigate = useNavigate();

  const [opportunity, setOpportunity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [merchantId, setMerchantId] = useState(null);

  const [workflowResult, setWorkflowResult] = useState(null);
  const [workflowLoading, setWorkflowLoading] = useState(false);
  const [workflowError, setWorkflowError] = useState("");

  useEffect(() => {
    async function loadOpportunity() {
      try {
        setLoading(true);
        setError("");

        const storedMerchant = localStorage.getItem(
          "selectedMerchant"
        );

        if (!storedMerchant) {
          throw new Error("No merchant is selected.");
        }

        const merchant = JSON.parse(storedMerchant);

        if (!merchant?.id) {
          throw new Error(
            "The selected merchant is not connected to the backend."
          );
        }

        setMerchantId(merchant.id);

        const data = await get(
          `/api/opportunities/merchant/${merchant.id}/${opportunityId}`
        );

        if (!data?.opportunity) {
          throw new Error(
            "Opportunity details were not returned by the backend."
          );
        }

        setOpportunity(data.opportunity);
      } catch (err) {
        setError(
          err?.message ||
            "Unable to load the opportunity details. Please try again."
        );
      } finally {
        setLoading(false);
      }
    }

    loadOpportunity();
  }, [opportunityId]);

  async function handleStartWorkflow() {
    if (!merchantId || !opportunity) {
      return;
    }

    try {
      setWorkflowLoading(true);
      setWorkflowError("");
      setWorkflowResult(null);

      const response = await fetch(WORKFLOW_1_WEBHOOK, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          merchant_id: merchantId,
        }),
      });

      if (!response.ok) {
        throw new Error(
          `Workflow request failed with status ${response.status}.`
        );
      }

      const data = await response.json();

      if (
        typeof data?.replan_required !== "boolean"
      ) {
        throw new Error(
          "The workflow returned an unexpected response."
        );
      }

      setWorkflowResult(data);
    } catch (err) {
      console.error("Workflow 1 error:", err);

      setWorkflowError(
        err?.message ||
          "Unable to start the PayPartner action. Please try again."
      );
    } finally {
      setWorkflowLoading(false);
    }
  }

  if (loading) {
    return <LoadingState message="Loading opportunity details..." />;
  }

  if (error) {
    return <ErrorState message={error} />;
  }

  if (!opportunity) {
    return (
      <ErrorState message="The requested opportunity could not be found." />
    );
  }

  const config =
    opportunityTypeConfig[opportunity.type] ||
    opportunityTypeConfig.failed_payment_recovery;

  const Icon = config.icon;

  const actionSupported =
    opportunity.type === "failed_payment_recovery";

  const workflowCompleted = workflowResult !== null;

  const fullyVerified =
    workflowResult?.replan_required === false;

  const replanRequired =
    workflowResult?.replan_required === true;

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* Back */}
      <button
        type="button"
        onClick={() => navigate("/todays-business")}
        className="inline-flex items-center gap-2 text-sm font-medium text-text-secondary transition hover:text-navy"
      >
        <ArrowLeft size={17} />
        Back to Today's Business
      </button>

      {/* Header */}
      <Card>
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-4">
            <div
              className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${config.iconStyle}`}
            >
              <Icon size={23} strokeWidth={1.8} />
            </div>

            <div>
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-semibold text-navy">
                  {opportunity.title}
                </h1>

                <span className="rounded-full bg-background px-3 py-1 text-xs font-semibold uppercase tracking-wide text-text-secondary">
                  {opportunity.priority}
                </span>
              </div>

              <p className="text-sm text-text-secondary">
                {opportunity.description}
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* STEP 01 — WHY FOUND */}
      <Card>
        <StepHeader
          number="01"
          title="Why Found"
          icon={AlertCircle}
        />

        <div className="mt-5 rounded-lg bg-background p-5">
          <p className="text-sm leading-6 text-text">
            {opportunity.description}
          </p>
        </div>
      </Card>

      {/* STEP 02 — BUSINESS IMPACT */}
      <Card>
        <StepHeader
          number="02"
          title="Business Impact"
          icon={TrendingDown}
        />

        <div className="mt-5">
          <div className="rounded-lg border border-border p-5">
            <p className="text-sm text-text-secondary">
              Potential opportunity value
            </p>

            <p className="mt-2 text-3xl font-semibold text-navy">
              {formatCurrency(opportunity.potential_value)}
            </p>
          </div>
        </div>
      </Card>

      {/* STEP 03 — RECOMMENDED ACTION */}
      <Card>
        <StepHeader
          number="03"
          title="Recommended Action"
          icon={Play}
        />

        <div className="mt-5 rounded-lg border border-border bg-background p-5">
          {actionSupported ? (
            <>
              <p className="text-sm leading-6 text-text">
                Recover eligible failed payments identified by PayPartner.
                The backend will determine the applicable policy and
                targeted transactions.
              </p>

              <p className="mt-3 text-xs leading-5 text-text-secondary">
                Action execution and verification are controlled by the
                backend policy and action engines.
              </p>
            </>
          ) : (
            <p className="text-sm leading-6 text-text-secondary">
              This opportunity is identified by the backend, but the
              current action workflow does not support automatic execution
              for this opportunity type.
            </p>
          )}
        </div>
      </Card>

      {/* STEP 04 — POLICY CHECK */}
      <Card>
        <StepHeader
          number="04"
          title="Policy Check"
          icon={ShieldCheck}
        />

        <div className="mt-5 space-y-4">
          {!workflowCompleted && (
            <div className="rounded-lg border border-border bg-background p-5">
              <p className="text-sm leading-6 text-text-secondary">
                Start the action to run the backend policy check for this
                opportunity.
              </p>
            </div>
          )}

          {workflowCompleted && fullyVerified && (
            <div className="rounded-lg border border-success/20 bg-success/5 p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-text">
                    Policy and action workflow completed
                  </p>

                  <p className="mt-1 text-sm text-text-secondary">
                    The backend completed the policy-controlled action
                    workflow successfully.
                  </p>
                </div>

                <StatusBadge tone="success">
                  Approved
                </StatusBadge>
              </div>
            </div>
          )}

          {workflowCompleted && replanRequired && (
            <div className="rounded-lg border border-warning/20 bg-warning/5 p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-text">
                    Further action required
                  </p>

                  <p className="mt-1 text-sm text-text-secondary">
                    The backend determined that another permitted recovery
                    step is required.
                  </p>
                </div>

                <StatusBadge tone="warning">
                  Replan Required
                </StatusBadge>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* STEP 05 — ACTION */}
      <Card>
        <StepHeader
          number="05"
          title="Action"
          icon={Play}
        />

        <div className="mt-5 space-y-4">
          {workflowError && (
            <div className="flex items-start gap-3 rounded-lg border border-error/20 bg-error/5 p-4">
              <XCircle
                size={18}
                className="mt-0.5 shrink-0 text-error"
              />

              <p className="text-sm leading-6 text-error">
                {workflowError}
              </p>
            </div>
          )}

          {!workflowCompleted && (
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="max-w-2xl text-sm leading-6 text-text-secondary">
                This opportunity is currently{" "}
                <span className="font-semibold text-text">
                  {opportunity.status}
                </span>
                .
              </p>

              <Button
                disabled={
                  !actionSupported || workflowLoading
                }
                onClick={handleStartWorkflow}
              >
                {workflowLoading ? (
                  <>
                    <Loader2
                      size={16}
                      className="animate-spin"
                    />
                    Processing...
                  </>
                ) : (
                  "Start Action"
                )}
              </Button>
            </div>
          )}

          {workflowCompleted && fullyVerified && (
            <div className="rounded-lg border border-success/20 bg-success/5 p-5">
              <div className="flex items-start gap-3">
                <CheckCircle2
                  size={20}
                  className="mt-0.5 shrink-0 text-success"
                />

                <div>
                  <p className="text-sm font-semibold text-text">
                    Action completed successfully
                  </p>

                  <p className="mt-1 text-sm leading-6 text-text-secondary">
                    The backend completed the policy check, action
                    execution, verification, and replan evaluation.
                  </p>
                </div>
              </div>
            </div>
          )}

          {workflowCompleted && replanRequired && (
            <div className="rounded-lg border border-warning/20 bg-warning/5 p-5">
              <div className="flex items-start gap-3">
                <RotateCcw
                  size={20}
                  className="mt-0.5 shrink-0 text-warning"
                />

                <div>
                  <p className="text-sm font-semibold text-text">
                    Additional recovery step required
                  </p>

                  <p className="mt-1 text-sm leading-6 text-text-secondary">
                    The backend has determined that another permitted
                    action or recovery step is required.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* STEP 06 — VERIFICATION */}
      <Card>
        <StepHeader
          number="06"
          title="Verification"
          icon={CheckCircle2}
        />

        <div className="mt-5 space-y-4">
          {!workflowCompleted && (
            <div className="rounded-lg bg-background p-5">
              <p className="text-sm leading-6 text-text-secondary">
                Verification becomes available after the action has been
                executed successfully.
              </p>
            </div>
          )}

          {workflowCompleted && fullyVerified && (
            <div className="rounded-lg border border-success/20 bg-success/5 p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-text">
                    Verification completed
                  </p>

                  <p className="mt-1 text-sm text-text-secondary">
                    The backend confirmed that the target impact was fully
                    verified.
                  </p>
                </div>

                <StatusBadge tone="success">
                  Fully Verified
                </StatusBadge>
              </div>
            </div>
          )}

          {workflowCompleted && replanRequired && (
            <div className="rounded-lg border border-warning/20 bg-warning/5 p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-text">
                    Verification completed
                  </p>

                  <p className="mt-1 text-sm text-text-secondary">
                    The backend completed verification and determined that
                    another permitted recovery step is required.
                  </p>
                </div>

                <StatusBadge tone="warning">
                  Further Recovery Required
                </StatusBadge>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* STEP 07 — PROOF OF IMPACT */}
      <Card>
        <StepHeader
          number="07"
          title="Proof of Impact"
          icon={CheckCircle2}
        />

        <div className="mt-5 space-y-4">
          {!workflowCompleted && (
            <div className="rounded-lg border border-border bg-background p-5">
              <p className="text-sm leading-6 text-text-secondary">
                Verified impact will appear here after the backend confirms
                the executed action.
              </p>
            </div>
          )}

          {workflowCompleted && fullyVerified && (
            <>
              <div className="rounded-lg border border-success/20 bg-success/5 p-5">
                <div className="flex items-start gap-3">
                  <CheckCircle2
                    size={20}
                    className="mt-0.5 shrink-0 text-success"
                  />

                  <div>
                    <p className="text-sm font-semibold text-text">
                      Impact verified
                    </p>

                    <p className="mt-1 text-sm leading-6 text-text-secondary">
                      {workflowResult.reason ||
                        "Target impact was fully verified by the backend."}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border border-border bg-background p-5">
                <p className="text-xs text-text-secondary">
                  Verification status
                </p>

                <div className="mt-2">
                  <StatusBadge tone="success">
                    Target impact fully verified
                  </StatusBadge>
                </div>
              </div>
            </>
          )}

          {workflowCompleted && replanRequired && (
            <div className="rounded-lg border border-warning/20 bg-warning/5 p-5">
              <div className="flex items-start gap-3">
                <RotateCcw
                  size={20}
                  className="mt-0.5 shrink-0 text-warning"
                />

                <div>
                  <p className="text-sm font-semibold text-text">
                    Additional impact recovery required
                  </p>

                  <p className="mt-1 text-sm leading-6 text-text-secondary">
                    The backend has verified the current action and
                    determined that another permitted recovery step is
                    required.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* STEP 08 — REPLAN */}
      <Card>
        <StepHeader
          number="08"
          title="Replan"
          icon={RotateCcw}
        />

        <div className="mt-5 space-y-4">
          {!workflowCompleted && (
            <div className="rounded-lg bg-background p-5">
              <p className="text-sm leading-6 text-text-secondary">
                Replanning is evaluated after verification.
              </p>
            </div>
          )}

          {workflowCompleted && fullyVerified && (
            <div className="rounded-lg border border-success/20 bg-success/5 p-5">
              <div className="flex items-start gap-3">
                <CheckCircle2
                  size={20}
                  className="mt-0.5 shrink-0 text-success"
                />

                <div>
                  <p className="text-sm font-semibold text-text">
                    Recovery completed
                  </p>

                  <p className="mt-1 text-sm leading-6 text-text-secondary">
                    {workflowResult.reason ||
                      "The backend verified full impact, so no further automatic recovery is required."}
                  </p>
                </div>
              </div>
            </div>
          )}

          {workflowCompleted && replanRequired && (
            <div className="rounded-lg border border-warning/20 bg-warning/5 p-5">
              <div className="flex items-start gap-3">
                <RotateCcw
                  size={20}
                  className="mt-0.5 shrink-0 text-warning"
                />

                <div>
                  <p className="text-sm font-semibold text-text">
                    Replan required
                  </p>

                  <p className="mt-1 text-sm leading-6 text-text-secondary">
                    {workflowResult.reason ||
                      "The backend determined that another permitted action or recovery step is required."}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}

export default OpportunityDetail;