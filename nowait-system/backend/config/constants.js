const DEFAULT_AVG_SERVICE_TIME = Number(process.env.AVG_SERVICE_TIME || 6);

const TOKEN_STATUSES = {
  WAITING: "waiting",
  SERVING: "serving",
  COMPLETED: "completed",
};

const SERVICE_CATALOG = [
  {
    id: "general-consultation",
    name: "General Consultation",
    duration: 6,
    description: "Quick guidance, document checks, and standard assistance.",
  },
  {
    id: "priority-support",
    name: "Priority Support",
    duration: 10,
    description: "Complex requests that need more desk time and validation.",
  },
  {
    id: "payments-and-billing",
    name: "Payments & Billing",
    duration: 8,
    description: "Invoices, payment clarifications, and settlement support.",
  },
];

module.exports = {
  DEFAULT_AVG_SERVICE_TIME,
  SERVICE_CATALOG,
  TOKEN_STATUSES,
};
