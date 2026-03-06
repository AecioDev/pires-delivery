"use server";

import { cookies } from "next/headers";

const MASTER_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";

export async function loginAdmin(password: string) {
  const today = new Date();
  const dia = today.getDate();
  const mes = today.getMonth() + 1; // getMonth() returns 0-11
  const ano = today.getFullYear();
  
  // Valida tanto a expressão matemática restrita quanto a soma dos 3 multiplicada
  const expectedPasswordStrict = String(dia + mes + (ano * 491484));
  const expectedPasswordSumGrouped = String((dia + mes + ano) * 491484);

  if (
    password === expectedPasswordStrict ||
    password === expectedPasswordSumGrouped || 
    (process.env.ADMIN_PASSWORD && password === process.env.ADMIN_PASSWORD)
  ) {
    const cookieStore = await cookies();
    cookieStore.set("admin_token", "authenticated", {
      path: "/",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 1 week
    });
    return { success: true };
  }
  
  return { success: false, message: "Senha incorreta" };
}

export async function logoutAdmin() {
  const cookieStore = await cookies();
  cookieStore.delete("admin_token");
}
