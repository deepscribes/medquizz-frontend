import { Plan } from "@prisma/client";

function getUserPlanClassNameByPlan(plan: Plan | undefined) {
  switch (plan) {
    case Plan.BASIC:
      return "bg-primary text-white";
    case Plan.PRO:
      return "bg-secondary text-white";
    case Plan.EXCLUSIVE:
      return "bg-backgrounds-exclusive text-text-exclusive";
    default:
      return "bg-primary text-white";
  }
}

function getPlanTextFromPlan(plan: Plan | undefined) {
  switch (plan) {
    case Plan.BASIC:
      return "👋 Basic";
    case Plan.PRO:
      return "🔥 Pro";
    case Plan.EXCLUSIVE:
      return "🚀 Exclusive";
    default:
      return "👋 Basic";
  }
}

export function PlanFactory(plan: Plan | undefined) {
  const basicStyles =
    "inline-flex flex-row items-center py-1 px-2 rounded-full text-sm font-bold";
  return (
    <>
      <span
        className={`${basicStyles} ${getUserPlanClassNameByPlan(
          plan || undefined
        )}`}
      >
        {getPlanTextFromPlan(plan)}
      </span>
    </>
  );
}

export function PlanFactoryWithProps({ plan }: { plan: Plan | undefined }) {
  return PlanFactory(plan);
}

export function BasicPlan() {
  return PlanFactory(Plan.BASIC);
}

export function ProPlan() {
  return PlanFactory(Plan.PRO);
}

export function ExclusivePlan() {
  return PlanFactory(Plan.EXCLUSIVE);
}
