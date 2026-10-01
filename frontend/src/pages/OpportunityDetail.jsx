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
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

import Card from "../components/ui/Card";
import Button from "../components/ui/Button";

const opportunityData = {
  "failed-payment": {
    priority: "HIGH",
    title: "Failed Payment Recovery",
    subtitle: "Recover revenue from recent failed payment attempts.",
    icon: AlertCircle,
    iconStyle: "bg-error/10 text-error",

    why: "17 recent payment attempts failed and represent recoverable revenue.",
    impact: "₹4,200",
    impactLabel: "Revenue at risk",
    impactDetail: "17 failed payment transactions identified.",

    recommendation:
      "Send a recovery reminder to eligible customers and provide a payment retry path.",

    policy: "Automatic recovery is enabled for eligible failed payments.",
    policyAllowed: true,

    action: "Start Recovery",

    verification:
      "Payment status will be checked after the recovery workflow completes.",

    proof: "₹3,240 verified recovered",
    proofDetail: "12 of 17 failed payments were successfully recovered.",

    replan:
      "5 payments remain unsuccessful and can be considered for the next permitted recovery attempt.",
  },

  "repeat-customer": {
    priority: "MEDIUM",
    title: "Repeat Customer Opportunity",
    subtitle: "Bring back customers who have become inactive.",
    icon: Users,
    iconStyle: "bg-primary/10 text-primary",

    why: "14 customers who previously purchased repeatedly have not returned within their expected purchase interval.",
    impact: "14 customers",
    impactLabel: "Lapsed repeat customers",
    impactDetail: "Customers identified using their historical purchase behaviour.",

    recommendation:
      "Send a targeted re-engagement message to eligible lapsed repeat customers.",

    policy: "Customer re-engagement communication is permitted.",
    policyAllowed: true,

    action: "Start Re-engagement",

    verification:
      "Future purchases and customer responses will be monitored.",

    proof: "Re-engagement initiated",
    proofDetail: "Eligible customers have been added to the action workflow.",

    replan:
      "Customers who do not respond can be considered for a later permitted follow-up.",
  },

  "sales-pattern": {
    priority: "MEDIUM",
    title: "Sales Pattern Opportunity",
    subtitle: "Address a recurring period of weaker sales.",
    icon: TrendingDown,
    iconStyle: "bg-warning/10 text-warning",

    why: "Tuesday between 2–5 PM is consistently performing below the normal sales baseline.",
    impact: "18%",
    impactLabel: "Below baseline",
    impactDetail: "The identified period shows weaker sales performance.",

    recommendation:
      "Test a targeted promotion or customer engagement strategy during the weak period.",

    policy: "Promotional actions require merchant approval before execution.",
    policyAllowed: false,

    action: "Request Approval",

    verification:
      "Sales performance will be compared against the baseline after the experiment.",

    proof: "Experiment not started",
    proofDetail: "Merchant approval is required before this action can be executed.",

    replan:
      "If the experiment does not improve sales, PayPartner can evaluate another permitted strategy.",
  },

  "merchant-benefit": {
    priority: "LOW",
    title: "Merchant Benefit",
    subtitle: "Review an available benefit for your business.",
    icon: Gift,
    iconStyle: "bg-success/10 text-success",

    why: "Your business appears eligible for an available merchant benefit.",
    impact: "₹7,500",
    impactLabel: "Potential benefit value",
    impactDetail: "Estimated value associated with available benefits.",

    recommendation:
      "Review the benefit details and activate eligible programs.",

    policy: "Benefit activation requires eligibility confirmation.",
    policyAllowed: true,

    action: "Review Benefit",

    verification:
      "Eligibility and activation status will be verified after the action.",

    proof: "Eligibility identified",
    proofDetail: "The benefit is currently available for review.",

    replan:
      "If the benefit is not activated, PayPartner can review other eligible programs.",
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

function OpportunityDetail() {
  const { type } = useParams();
  const navigate = useNavigate();

  const opportunity = opportunityData[type] || opportunityData["failed-payment"];

  const Icon = opportunity.icon;

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
              className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${opportunity.iconStyle}`}
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
                {opportunity.subtitle}
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* WHY FOUND */}
      <Card>
        <StepHeader
          number="01"
          title="Why Found"
          icon={AlertCircle}
        />

        <div className="mt-5 rounded-lg bg-background p-5">
          <p className="text-sm leading-6 text-text">
            {opportunity.why}
          </p>
        </div>
      </Card>

      {/* IMPACT */}
      <Card>
        <StepHeader
          number="02"
          title="Business Impact"
          icon={TrendingDown}
        />

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg border border-border p-5">
            <p className="text-sm text-text-secondary">
              {opportunity.impactLabel}
            </p>

            <p className="mt-2 text-3xl font-semibold text-navy">
              {opportunity.impact}
            </p>
          </div>

          <div className="rounded-lg border border-border p-5">
            <p className="text-sm text-text-secondary">
              Supporting detail
            </p>

            <p className="mt-2 text-sm leading-6 text-text">
              {opportunity.impactDetail}
            </p>
          </div>
        </div>
      </Card>

      {/* RECOMMENDATION */}
      <Card>
        <StepHeader
          number="03"
          title="Recommended Action"
          icon={Play}
        />

        <div className="mt-5 rounded-lg border border-primary/20 bg-primary/5 p-5">
          <p className="text-sm leading-6 text-text">
            {opportunity.recommendation}
          </p>
        </div>
      </Card>

      {/* POLICY */}
      <Card>
        <StepHeader
          number="04"
          title="Policy Check"
          icon={ShieldCheck}
        />

        <div
          className={`mt-5 flex items-start gap-4 rounded-lg border p-5 ${
            opportunity.policyAllowed
              ? "border-success/20 bg-success/5"
              : "border-warning/20 bg-warning/5"
          }`}
        >
          <CheckCircle2
            size={21}
            className={
              opportunity.policyAllowed
                ? "text-success"
                : "text-warning"
            }
            strokeWidth={1.8}
          />

          <div>
            <p className="text-sm font-semibold text-navy">
              {opportunity.policyAllowed
                ? "Action permitted"
                : "Merchant approval required"}
            </p>

            <p className="mt-1 text-sm leading-6 text-text-secondary">
              {opportunity.policy}
            </p>
          </div>
        </div>
      </Card>

      {/* ACTION */}
      <Card>
        <StepHeader
          number="05"
          title="Action"
          icon={Play}
        />

        <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-2xl text-sm leading-6 text-text-secondary">
            Review the recommendation and proceed only when the policy
            requirements are satisfied.
          </p>

          <Button disabled={!opportunity.policyAllowed}>
            {opportunity.action}
          </Button>
        </div>
      </Card>

      {/* VERIFICATION */}
      <Card>
        <StepHeader
          number="06"
          title="Verification"
          icon={CheckCircle2}
        />

        <div className="mt-5 rounded-lg bg-background p-5">
          <p className="text-sm leading-6 text-text">
            {opportunity.verification}
          </p>
        </div>
      </Card>

      {/* PROOF */}
      <Card>
        <StepHeader
          number="07"
          title="Proof of Impact"
          icon={CheckCircle2}
        />

        <div className="mt-5 rounded-lg border border-success/20 bg-success/5 p-5">
          <p className="text-lg font-semibold text-navy">
            {opportunity.proof}
          </p>

          <p className="mt-2 text-sm leading-6 text-text-secondary">
            {opportunity.proofDetail}
          </p>
        </div>
      </Card>

      {/* REPLAN */}
      <Card>
        <StepHeader
          number="08"
          title="Replan"
          icon={RotateCcw}
        />

        <div className="mt-5 rounded-lg bg-background p-5">
          <p className="text-sm leading-6 text-text">
            {opportunity.replan}
          </p>
        </div>
      </Card>
    </div>
  );
}

export default OpportunityDetail;