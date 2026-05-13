// Server functions de autenticação — substitui o login/cadastro client-side.
// Usa supabaseAdmin (service_role) para ler/escrever credenciais privadas.
// Senhas armazenadas com bcrypt na tabela customer_credentials/affiliate_credentials.

import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const emailSchema = z.string().trim().toLowerCase().email().max(255);
const passwordSchema = z.string().min(4).max(200);

// ---------- CUSTOMERS ----------

export const registerCustomerFn = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z
      .object({
        name: z.string().trim().min(1).max(255),
        email: emailSchema,
        phone: z.string().trim().max(50).default(""),
        password: passwordSchema,
        address: z.string().trim().max(500).optional(),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    // Email já cadastrado?
    const { data: existing } = await supabaseAdmin
      .from("customers")
      .select("id")
      .ilike("email", data.email)
      .maybeSingle();
    if (existing) return { ok: false as const, message: "E-mail já cadastrado" };

    const id = crypto.randomUUID();
    const { error: cErr } = await supabaseAdmin.from("customers").insert({
      id,
      name: data.name,
      email: data.email,
      phone: data.phone,
      address: data.address ?? null,
      addresses: [],
      favorites: [],
    });
    if (cErr) return { ok: false as const, message: cErr.message };

    const password_hash = await bcrypt.hash(data.password, 10);
    const { error: credErr } = await supabaseAdmin
      .from("customer_credentials")
      .insert({ customer_id: id, password_hash });
    if (credErr) {
      await supabaseAdmin.from("customers").delete().eq("id", id);
      return { ok: false as const, message: credErr.message };
    }

    return {
      ok: true as const,
      message: "Cadastro realizado!",
      customer: {
        id,
        name: data.name,
        email: data.email,
        phone: data.phone,
        address: data.address ?? null,
        addresses: [] as string[],
        favorites: [] as string[],
        createdAt: new Date().toISOString(),
      },
    };
  });

export const loginCustomerFn = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z.object({ email: emailSchema, password: passwordSchema }).parse(input),
  )
  .handler(async ({ data }) => {
    const { data: cust } = await supabaseAdmin
      .from("customers")
      .select("*")
      .ilike("email", data.email)
      .maybeSingle();
    if (!cust) return { ok: false as const, message: "Credenciais inválidas" };

    const { data: cred } = await supabaseAdmin
      .from("customer_credentials")
      .select("password_hash")
      .eq("customer_id", cust.id)
      .maybeSingle();
    if (!cred) return { ok: false as const, message: "Credenciais inválidas" };

    const ok = await bcrypt.compare(data.password, cred.password_hash);
    if (!ok) return { ok: false as const, message: "Credenciais inválidas" };

    return {
      ok: true as const,
      message: "Bem-vinda!",
      customer: {
        id: cust.id,
        name: cust.name,
        email: cust.email,
        phone: cust.phone || "",
        address: cust.address || null,
        addresses: Array.isArray(cust.addresses) ? cust.addresses : [],
        favorites: Array.isArray(cust.favorites) ? cust.favorites : [],
        createdAt: cust.created_at,
      },
    };
  });

export const updateCustomerPasswordFn = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z
      .object({
        customerId: z.string().uuid(),
        newPassword: passwordSchema,
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const password_hash = await bcrypt.hash(data.newPassword, 10);
    const { error } = await supabaseAdmin
      .from("customer_credentials")
      .upsert(
        { customer_id: data.customerId, password_hash },
        { onConflict: "customer_id" },
      );
    if (error) return { ok: false as const, message: error.message };
    return { ok: true as const, message: "Senha atualizada" };
  });

// ---------- AFFILIATES ----------

export const registerAffiliateFn = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z
      .object({
        name: z.string().trim().min(1).max(255),
        email: emailSchema,
        phone: z.string().trim().max(50).default(""),
        password: passwordSchema,
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const { data: existing } = await supabaseAdmin
      .from("affiliates")
      .select("id")
      .ilike("email", data.email)
      .maybeSingle();
    if (existing) return { ok: false as const, message: "E-mail já cadastrado" };

    const id = crypto.randomUUID();
    const { error: aErr } = await supabaseAdmin.from("affiliates").insert({
      id,
      name: data.name,
      email: data.email,
      phone: data.phone,
      commission_type: "percent",
      commission_value: 10,
      active: true,
    });
    if (aErr) return { ok: false as const, message: aErr.message };

    const password_hash = await bcrypt.hash(data.password, 10);
    const { error: credErr } = await supabaseAdmin
      .from("affiliate_credentials")
      .insert({ affiliate_id: id, password_hash });
    if (credErr) {
      await supabaseAdmin.from("affiliates").delete().eq("id", id);
      return { ok: false as const, message: credErr.message };
    }

    return {
      ok: true as const,
      message: "Cadastro realizado! Aguarde aprovação.",
      affiliate: {
        id,
        name: data.name,
        email: data.email,
        phone: data.phone,
        commissionType: "percent" as const,
        commissionValue: 10,
        active: true,
        createdAt: new Date().toISOString(),
      },
    };
  });

export const loginAffiliateFn = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z.object({ email: emailSchema, password: passwordSchema }).parse(input),
  )
  .handler(async ({ data }) => {
    const { data: aff } = await supabaseAdmin
      .from("affiliates")
      .select("*")
      .ilike("email", data.email)
      .maybeSingle();
    if (!aff) return { ok: false as const, message: "Credenciais inválidas" };

    const { data: cred } = await supabaseAdmin
      .from("affiliate_credentials")
      .select("password_hash")
      .eq("affiliate_id", aff.id)
      .maybeSingle();
    if (!cred) return { ok: false as const, message: "Credenciais inválidas" };

    const ok = await bcrypt.compare(data.password, cred.password_hash);
    if (!ok) return { ok: false as const, message: "Credenciais inválidas" };

    if (!aff.active)
      return {
        ok: false as const,
        message: "Conta desativada. Contate a administradora.",
      };

    return {
      ok: true as const,
      message: `Bem-vinda, ${aff.name}!`,
      affiliate: {
        id: aff.id,
        name: aff.name,
        email: aff.email,
        phone: aff.phone || "",
        commissionType:
          aff.commission_type === "fixed"
            ? ("fixed" as const)
            : ("percent" as const),
        commissionValue: Number(aff.commission_value) || 0,
        active: true,
        createdAt: aff.created_at,
      },
    };
  });
