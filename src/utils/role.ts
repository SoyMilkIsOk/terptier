import { Role } from "@prisma/client";

export function getRoleForEmail(email: string): Role {
  const adminEmail = process.env.ADMIN_EMAIL;
  console.log("[getRoleForEmail] adminEmail", adminEmail, "input email", email);
  return email === adminEmail ? Role.ADMIN : Role.USER;
}
