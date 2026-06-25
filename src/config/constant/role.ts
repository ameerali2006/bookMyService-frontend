export const Role = {
  USER: "user",
  WORKER: "worker",
  ADMIN: "admin",
} as const;

export type Role = (typeof Role)[keyof typeof Role];

export const CapitalRole = {
  USER: "User",
  WORKER: "Worker",
  ADMIN: "Admin",
} as const;

export type CapitalRole = (typeof CapitalRole)[keyof typeof CapitalRole];