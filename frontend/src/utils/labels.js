const ROLE_MAP = {
  swe: "SWE",
  ml_engineer: "ML Engineer",
  frontend: "Frontend",
  backend: "Backend",
  full_stack: "Full Stack",
};

const TYPE_MAP = {
  technical: "Technical",
  behavioral: "Behavioral",
  mixed: "Mixed",
};

export function formatRole(role) {
  if (!role) return "";
  const key = String(role).toLowerCase();
  return ROLE_MAP[key] ?? String(role).replaceAll("_", " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export function formatInterviewType(t) {
  if (!t) return "";
  const key = String(t).toLowerCase();
  return TYPE_MAP[key] ?? String(t).replace(/\b\w/g, (c) => c.toUpperCase());
}
