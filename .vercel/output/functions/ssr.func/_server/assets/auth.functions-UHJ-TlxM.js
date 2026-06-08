import { c as createServerRpc } from "./createServerRpc-DU8qnOlg.js";
import { b as bcrypt } from "./index-BIzZcEw4.js";
import { s as stringType, o as objectType, c as supabaseAdmin } from "./client.server-C7GAOqxY.js";
import { a0 as createServerFn } from "../server.js";
import "crypto";
import "node:async_hooks";
import "node:stream";
import "node:stream/web";
import "util";
import "async_hooks";
import "stream";
const emailSchema = stringType().trim().toLowerCase().email().max(255);
const passwordSchema = stringType().min(4).max(200);
function toStringArray(value) {
  return Array.isArray(value) ? value.filter((item) => typeof item === "string") : [];
}
const registerCustomerFn_createServerFn_handler = createServerRpc({
  id: "174d847d55767cfb0d892cff8e85ce14b3d79f59b30a3e291c98c582d2414603",
  name: "registerCustomerFn",
  filename: "src/lib/auth.functions.ts"
}, (opts) => registerCustomerFn.__executeServer(opts));
const registerCustomerFn = createServerFn({
  method: "POST"
}).inputValidator((input) => objectType({
  name: stringType().trim().min(1).max(255),
  email: emailSchema,
  phone: stringType().trim().max(50).default(""),
  password: passwordSchema,
  address: stringType().trim().max(500).optional()
}).parse(input)).handler(registerCustomerFn_createServerFn_handler, async ({
  data
}) => {
  const password_hash = await bcrypt.hash(data.password, 10);
  const {
    data: created,
    error
  } = await supabaseAdmin.rpc("create_customer_with_password_hash", {
    _name: data.name,
    _email: data.email,
    _phone: data.phone,
    _address: data.address ?? "",
    _password_hash: password_hash
  }).maybeSingle();
  if (error || !created) {
    return {
      ok: false,
      message: error?.message || "Erro ao criar conta"
    };
  }
  if (!created.ok) return {
    ok: false,
    message: created.message
  };
  return {
    ok: true,
    message: created.message,
    customer: {
      id: created.id,
      name: created.name,
      email: created.email,
      phone: created.phone || "",
      address: created.address || null,
      addresses: toStringArray(created.addresses),
      favorites: toStringArray(created.favorites),
      createdAt: created.created_at
    }
  };
});
const loginCustomerFn_createServerFn_handler = createServerRpc({
  id: "8604b5cecd71f15457357c699dd09ad90b64f100d37df64230d3bc2189fd84ac",
  name: "loginCustomerFn",
  filename: "src/lib/auth.functions.ts"
}, (opts) => loginCustomerFn.__executeServer(opts));
const loginCustomerFn = createServerFn({
  method: "POST"
}).inputValidator((input) => objectType({
  email: emailSchema,
  password: passwordSchema
}).parse(input)).handler(loginCustomerFn_createServerFn_handler, async ({
  data
}) => {
  const {
    data: cust,
    error
  } = await supabaseAdmin.rpc("get_customer_auth_record", {
    _email: data.email
  }).maybeSingle();
  if (error) return {
    ok: false,
    message: error.message
  };
  if (!cust?.password_hash) return {
    ok: false,
    message: "Credenciais inválidas"
  };
  const ok = await bcrypt.compare(data.password, cust.password_hash);
  if (!ok) return {
    ok: false,
    message: "Credenciais inválidas"
  };
  return {
    ok: true,
    message: "Bem-vinda!",
    customer: {
      id: cust.id,
      name: cust.name,
      email: cust.email,
      phone: cust.phone || "",
      address: cust.address || null,
      addresses: toStringArray(cust.addresses),
      favorites: toStringArray(cust.favorites),
      createdAt: cust.created_at
    }
  };
});
const updateCustomerPasswordFn_createServerFn_handler = createServerRpc({
  id: "c1c95c518bfe5af322b5e90e2a0138419fb97cbe0ffd727b89b6df943c0efffe",
  name: "updateCustomerPasswordFn",
  filename: "src/lib/auth.functions.ts"
}, (opts) => updateCustomerPasswordFn.__executeServer(opts));
const updateCustomerPasswordFn = createServerFn({
  method: "POST"
}).inputValidator((input) => objectType({
  customerId: stringType().uuid(),
  newPassword: passwordSchema
}).parse(input)).handler(updateCustomerPasswordFn_createServerFn_handler, async ({
  data
}) => {
  const password_hash = await bcrypt.hash(data.newPassword, 10);
  const {
    data: result,
    error
  } = await supabaseAdmin.rpc("update_customer_password_hash", {
    _customer_id: data.customerId,
    _password_hash: password_hash
  }).maybeSingle();
  if (error || !result) {
    return {
      ok: false,
      message: error?.message || "Erro ao atualizar senha"
    };
  }
  return {
    ok: Boolean(result.ok),
    message: result.message
  };
});
const registerAffiliateFn_createServerFn_handler = createServerRpc({
  id: "43b15be3692b942479d3eddde98ba7a1cd4c46dcf77ca7fe37b622c0a718c2f0",
  name: "registerAffiliateFn",
  filename: "src/lib/auth.functions.ts"
}, (opts) => registerAffiliateFn.__executeServer(opts));
const registerAffiliateFn = createServerFn({
  method: "POST"
}).inputValidator((input) => objectType({
  name: stringType().trim().min(1).max(255),
  email: emailSchema,
  phone: stringType().trim().max(50).default(""),
  password: passwordSchema
}).parse(input)).handler(registerAffiliateFn_createServerFn_handler, async ({
  data
}) => {
  const {
    data: existing
  } = await supabaseAdmin.from("affiliates").select("id").ilike("email", data.email).maybeSingle();
  if (existing) return {
    ok: false,
    message: "E-mail já cadastrado"
  };
  const id = crypto.randomUUID();
  const {
    error: aErr
  } = await supabaseAdmin.from("affiliates").insert({
    id,
    name: data.name,
    email: data.email,
    phone: data.phone,
    commission_type: "percent",
    commission_value: 10,
    active: true
  });
  if (aErr) return {
    ok: false,
    message: aErr.message
  };
  const password_hash = await bcrypt.hash(data.password, 10);
  const {
    error: credErr
  } = await supabaseAdmin.from("affiliate_credentials").insert({
    affiliate_id: id,
    password_hash
  });
  if (credErr) {
    await supabaseAdmin.from("affiliates").delete().eq("id", id);
    return {
      ok: false,
      message: credErr.message
    };
  }
  return {
    ok: true,
    message: "Cadastro realizado! Aguarde aprovação.",
    affiliate: {
      id,
      name: data.name,
      email: data.email,
      phone: data.phone,
      commissionType: "percent",
      commissionValue: 10,
      active: true,
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    }
  };
});
const loginAffiliateFn_createServerFn_handler = createServerRpc({
  id: "c3eafd934224d4d365e321f607272e3f3de0665d8c2496f50f20dcbf3e5da7d2",
  name: "loginAffiliateFn",
  filename: "src/lib/auth.functions.ts"
}, (opts) => loginAffiliateFn.__executeServer(opts));
const loginAffiliateFn = createServerFn({
  method: "POST"
}).inputValidator((input) => objectType({
  email: emailSchema,
  password: passwordSchema
}).parse(input)).handler(loginAffiliateFn_createServerFn_handler, async ({
  data
}) => {
  const {
    data: aff
  } = await supabaseAdmin.from("affiliates").select("*").ilike("email", data.email).maybeSingle();
  if (!aff) return {
    ok: false,
    message: "Credenciais inválidas"
  };
  const {
    data: cred
  } = await supabaseAdmin.from("affiliate_credentials").select("password_hash").eq("affiliate_id", aff.id).maybeSingle();
  if (!cred) return {
    ok: false,
    message: "Credenciais inválidas"
  };
  const ok = await bcrypt.compare(data.password, cred.password_hash);
  if (!ok) return {
    ok: false,
    message: "Credenciais inválidas"
  };
  if (!aff.active) return {
    ok: false,
    message: "Conta desativada. Contate a administradora."
  };
  return {
    ok: true,
    message: `Bem-vinda, ${aff.name}!`,
    affiliate: {
      id: aff.id,
      name: aff.name,
      email: aff.email,
      phone: aff.phone || "",
      commissionType: aff.commission_type === "fixed" ? "fixed" : "percent",
      commissionValue: Number(aff.commission_value) || 0,
      active: true,
      createdAt: aff.created_at
    }
  };
});
export {
  loginAffiliateFn_createServerFn_handler,
  loginCustomerFn_createServerFn_handler,
  registerAffiliateFn_createServerFn_handler,
  registerCustomerFn_createServerFn_handler,
  updateCustomerPasswordFn_createServerFn_handler
};
