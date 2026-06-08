import { c as createServerRpc } from "./createServerRpc-DU8qnOlg.js";
import { b as bcrypt } from "./index-BIzZcEw4.js";
import { e as emailSchema, a as audit, n as newToken, s as supabase } from "./adminHelpers.server-BhLg7GIA.js";
import { c as supabaseAdmin, o as objectType, s as stringType, n as numberType, r as recordType, b as anyType, e as enumType, a as arrayType } from "./client.server-C7GAOqxY.js";
import { a2 as setCookie$1, a3 as getCookie, a4 as deleteCookie$1, a0 as createServerFn } from "../server.js";
import "crypto";
import "node:async_hooks";
import "node:stream";
import "node:stream/web";
import "util";
import "async_hooks";
import "stream";
const ADMIN_COOKIE = "princesa_admin_session";
const ONE_DAY_SECONDS = 60 * 60 * 24;
const ROTATE_AFTER_MS = 30 * 60 * 1e3;
function setAdminSessionCookie(token) {
  setCookie$1(ADMIN_COOKIE, token, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    path: "/",
    maxAge: ONE_DAY_SECONDS
  });
}
function clearAdminSessionCookie() {
  deleteCookie$1(ADMIN_COOKIE, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    path: "/"
  });
}
function getAdminSessionCookie() {
  return getCookie(ADMIN_COOKIE);
}
function newAdminToken() {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join("");
}
async function requireAdminAuth() {
  const token = getAdminSessionCookie();
  if (!token) {
    throw new Error("Unauthorized: sessão admin ausente (cookie não enviado)");
  }
  const { data, error } = await supabaseAdmin.rpc("get_admin_session_record", { _token: token }).maybeSingle();
  if (error || !data) {
    clearAdminSessionCookie();
    throw new Error(
      `Unauthorized: sessão admin inválida${error ? ` (${error.message})` : ""}`
    );
  }
  if (new Date(data.expires_at).getTime() < Date.now()) {
    await supabaseAdmin.rpc("delete_admin_session", { _token: token }).then(() => {
    }).catch(() => {
    });
    clearAdminSessionCookie();
    throw new Error("Unauthorized: sessão admin expirada");
  }
  let activeToken = token;
  const lastRotated = data.last_rotated_at ? new Date(data.last_rotated_at).getTime() : 0;
  if (Date.now() - lastRotated > ROTATE_AFTER_MS) {
    const newTok = newAdminToken();
    const { data: rotated } = await supabaseAdmin.rpc("rotate_admin_session", { _old_token: token, _new_token: newTok }).maybeSingle();
    if (rotated) activeToken = newTok;
  } else {
    supabaseAdmin.rpc("refresh_admin_session", { _token: token }).then(() => {
    }).catch(() => {
    });
  }
  setAdminSessionCookie(activeToken);
  return { adminToken: activeToken, adminEmail: data.email };
}
const loginAdminFn_createServerFn_handler = createServerRpc({
  id: "4cd1137d4a9547e649b153ae4582f66cf4b4502333e787c042bd2d77cbe36e07",
  name: "loginAdminFn",
  filename: "src/lib/admin.functions.ts"
}, (opts) => loginAdminFn.__executeServer(opts));
const loginAdminFn = createServerFn({
  method: "POST"
}).inputValidator((input) => objectType({
  email: emailSchema,
  password: stringType().min(1).max(200)
}).parse(input)).handler(loginAdminFn_createServerFn_handler, async ({
  data
}) => {
  const {
    data: rl
  } = await supabaseAdmin.rpc("check_rate_limit", {
    _bucket: "admin_login",
    _identifier: data.email,
    _max_requests: 5,
    _window_seconds: 300
  });
  const rlRow = Array.isArray(rl) ? rl[0] : rl;
  if (rlRow && rlRow.allowed === false) {
    await audit(data.email, "admin.login.rate_limited", "Login admin bloqueado por rate limit", {
      retry_after_seconds: rlRow.retry_after_seconds
    });
    return {
      ok: false,
      message: `Muitas tentativas. Tente novamente em ${rlRow.retry_after_seconds}s.`
    };
  }
  const {
    data: cred
  } = await supabaseAdmin.rpc("get_admin_auth_record", {
    _email: data.email
  }).maybeSingle();
  if (!cred) {
    await audit(data.email, "admin.login.failed", "Tentativa de login admin com email inexistente");
    return {
      ok: false,
      message: "Credenciais inválidas"
    };
  }
  const ok = await bcrypt.compare(data.password, cred.password_hash);
  if (!ok) {
    await audit(data.email, "admin.login.failed", "Senha incorreta no login admin");
    return {
      ok: false,
      message: "Credenciais inválidas"
    };
  }
  const token = newToken();
  const {
    error
  } = await supabaseAdmin.rpc("create_admin_session", {
    _email: data.email,
    _token: token
  });
  if (error) return {
    ok: false,
    message: error.message
  };
  await setAdminSessionCookie(token);
  await audit(data.email, "admin.login.success", "Login admin realizado");
  return {
    ok: true,
    message: "Bem-vindo!",
    email: data.email
  };
});
const logoutAdminFn_createServerFn_handler = createServerRpc({
  id: "8cd101c8bfdc1c73f5d751a7c552865b745589d09d322b0f09940956378255a8",
  name: "logoutAdminFn",
  filename: "src/lib/admin.functions.ts"
}, (opts) => logoutAdminFn.__executeServer(opts));
const logoutAdminFn = createServerFn({
  method: "POST"
}).handler(logoutAdminFn_createServerFn_handler, async () => {
  const token = await getAdminSessionCookie();
  if (token) {
    await supabaseAdmin.rpc("delete_admin_session", {
      _token: token
    }).then(() => {
    }).catch(() => {
    });
  }
  await clearAdminSessionCookie();
  return {
    ok: true
  };
});
const getAdminSessionFn_createServerFn_handler = createServerRpc({
  id: "da169f2845db285175ef90650fd40bf97a73acd58c7683f00218e21c0fb36972",
  name: "getAdminSessionFn",
  filename: "src/lib/admin.functions.ts"
}, (opts) => getAdminSessionFn.__executeServer(opts));
const getAdminSessionFn = createServerFn({
  method: "GET"
}).handler(getAdminSessionFn_createServerFn_handler, async () => {
  const token = await getAdminSessionCookie();
  if (!token) return {
    email: null
  };
  const {
    data
  } = await supabaseAdmin.rpc("get_admin_session_record", {
    _token: token
  }).maybeSingle();
  if (!data || new Date(data.expires_at).getTime() < Date.now()) {
    await clearAdminSessionCookie();
    return {
      email: null
    };
  }
  return {
    email: data.email
  };
});
const updateAdminPasswordFn_createServerFn_handler = createServerRpc({
  id: "f0d4ba22cc43b4cf3748f32a7bc429d40a75034d0645217947d551c1f6396b95",
  name: "updateAdminPasswordFn",
  filename: "src/lib/admin.functions.ts"
}, (opts) => updateAdminPasswordFn.__executeServer(opts));
const updateAdminPasswordFn = createServerFn({
  method: "POST"
}).inputValidator((i) => objectType({
  newPassword: stringType().min(6).max(200)
}).parse(i)).handler(updateAdminPasswordFn_createServerFn_handler, async ({
  data
}) => {
  const ctx = await requireAdminAuth();
  const password_hash = await bcrypt.hash(data.newPassword, 10);
  const {
    error
  } = await supabaseAdmin.from("admin_credentials").update({
    password_hash,
    updated_at: (/* @__PURE__ */ new Date()).toISOString()
  }).eq("email", ctx.adminEmail);
  if (error) return {
    ok: false,
    message: error.message
  };
  return {
    ok: true,
    message: "Senha atualizada"
  };
});
const listConsignmentsFn_createServerFn_handler = createServerRpc({
  id: "56f0053b0fd1a9cbe6e0b50d8437832033f8707ac0648eb9d31cf26a4b453f98",
  name: "listConsignmentsFn",
  filename: "src/lib/admin.functions.ts"
}, (opts) => listConsignmentsFn.__executeServer(opts));
const listConsignmentsFn = createServerFn({
  method: "POST"
}).handler(listConsignmentsFn_createServerFn_handler, async () => {
  await requireAdminAuth();
  const {
    data: rows
  } = await supabaseAdmin.from("affiliate_consignments").select("*").order("picked_up_at", {
    ascending: false
  });
  return {
    consignments: rows || []
  };
});
const createConsignmentFn_createServerFn_handler = createServerRpc({
  id: "de47b526321169d7670ec9c27e4cbeb805da9f61f8f50dc452ac798f44217685",
  name: "createConsignmentFn",
  filename: "src/lib/admin.functions.ts"
}, (opts) => createConsignmentFn.__executeServer(opts));
const createConsignmentFn = createServerFn({
  method: "POST"
}).inputValidator((i) => objectType({
  affiliate_id: stringType().uuid(),
  quantity: numberType().int().min(0).max(1e5),
  total_value: numberType().min(0).max(1e6),
  picked_up_at: stringType().datetime().optional(),
  notes: stringType().trim().max(1e3).optional()
}).parse(i)).handler(createConsignmentFn_createServerFn_handler, async ({
  data
}) => {
  await requireAdminAuth();
  const {
    data: row,
    error
  } = await supabaseAdmin.from("affiliate_consignments").insert({
    affiliate_id: data.affiliate_id,
    quantity: data.quantity,
    total_value: data.total_value,
    picked_up_at: data.picked_up_at ?? (/* @__PURE__ */ new Date()).toISOString(),
    notes: data.notes ?? null
  }).select("*").single();
  if (error) return {
    ok: false,
    message: error.message
  };
  return {
    ok: true,
    row
  };
});
const deleteConsignmentFn_createServerFn_handler = createServerRpc({
  id: "61831abf388d29380b8e2c9b2d159d91f51d7f4405d094e225af5784f6128ed4",
  name: "deleteConsignmentFn",
  filename: "src/lib/admin.functions.ts"
}, (opts) => deleteConsignmentFn.__executeServer(opts));
const deleteConsignmentFn = createServerFn({
  method: "POST"
}).inputValidator((i) => objectType({
  id: stringType().uuid()
}).parse(i)).handler(deleteConsignmentFn_createServerFn_handler, async ({
  data
}) => {
  await requireAdminAuth();
  const {
    error
  } = await supabaseAdmin.from("affiliate_consignments").delete().eq("id", data.id);
  if (error) return {
    ok: false,
    message: error.message
  };
  return {
    ok: true
  };
});
const WRITE_TABLES = ["customers", "products", "categories", "coupons", "affiliates", "affiliate_sales", "affiliate_consignments", "transactions", "reviews", "store_settings", "faq_items", "orders", "activity_logs", "product_waitlist"];
const adminUpsertFn_createServerFn_handler = createServerRpc({
  id: "c76b670af0495621df1ce9096d88e3fcdb4049094b1e4b4a4c639ebbc4e2d16e",
  name: "adminUpsertFn",
  filename: "src/lib/admin.functions.ts"
}, (opts) => adminUpsertFn.__executeServer(opts));
const adminUpsertFn = createServerFn({
  method: "POST"
}).inputValidator((i) => objectType({
  table: enumType(WRITE_TABLES),
  row: recordType(stringType(), anyType()),
  onConflict: stringType().optional()
}).parse(i)).handler(adminUpsertFn_createServerFn_handler, async ({
  data
}) => {
  const ctx = await requireAdminAuth();
  const {
    error
  } = await supabaseAdmin.rpc("admin_db_write", {
    _token: ctx.adminToken,
    _op: "upsert",
    _table: data.table,
    _row: data.row,
    _on_conflict: data.onConflict ?? null,
    _match: null,
    _patch: null
  });
  if (error) return {
    ok: false,
    message: error.message
  };
  return {
    ok: true
  };
});
const adminUpdateFn_createServerFn_handler = createServerRpc({
  id: "dec5d397510dfd42d4eba8191abaf4d96952804816e3079352354af055d153b3",
  name: "adminUpdateFn",
  filename: "src/lib/admin.functions.ts"
}, (opts) => adminUpdateFn.__executeServer(opts));
const adminUpdateFn = createServerFn({
  method: "POST"
}).inputValidator((i) => objectType({
  table: enumType(WRITE_TABLES),
  match: recordType(stringType(), anyType()),
  patch: recordType(stringType(), anyType())
}).parse(i)).handler(adminUpdateFn_createServerFn_handler, async ({
  data
}) => {
  const ctx = await requireAdminAuth();
  const {
    error
  } = await supabaseAdmin.rpc("admin_db_write", {
    _token: ctx.adminToken,
    _op: "update",
    _table: data.table,
    _row: null,
    _on_conflict: null,
    _match: data.match,
    _patch: data.patch
  });
  if (error) return {
    ok: false,
    message: error.message
  };
  return {
    ok: true
  };
});
const adminDeleteFn_createServerFn_handler = createServerRpc({
  id: "681c4da494dfcab2c0336b1e290da6aff240b78fc06f4f1b9f7f0e6997f91b44",
  name: "adminDeleteFn",
  filename: "src/lib/admin.functions.ts"
}, (opts) => adminDeleteFn.__executeServer(opts));
const adminDeleteFn = createServerFn({
  method: "POST"
}).inputValidator((i) => objectType({
  table: enumType(WRITE_TABLES),
  match: recordType(stringType(), anyType())
}).parse(i)).handler(adminDeleteFn_createServerFn_handler, async ({
  data
}) => {
  const ctx = await requireAdminAuth();
  const {
    error
  } = await supabaseAdmin.rpc("admin_db_write", {
    _token: ctx.adminToken,
    _op: "delete",
    _table: data.table,
    _row: null,
    _on_conflict: null,
    _match: data.match,
    _patch: null
  });
  if (error) return {
    ok: false,
    message: error.message
  };
  await audit(ctx.adminEmail, "admin.delete", `Exclusão em ${data.table}`, {
    table: data.table,
    match: data.match
  });
  return {
    ok: true
  };
});
const READ_TABLES = ["customers", "affiliates", "affiliate_sales", "affiliate_consignments", "transactions", "orders", "product_waitlist", "activity_logs"];
const adminReadTableFn_createServerFn_handler = createServerRpc({
  id: "6007c43c8f3d27d336ce59ced25cf9181e9fa99c88ed9fcfadc8c352b7690370",
  name: "adminReadTableFn",
  filename: "src/lib/admin.functions.ts"
}, (opts) => adminReadTableFn.__executeServer(opts));
const adminReadTableFn = createServerFn({
  method: "POST"
}).inputValidator((i) => objectType({
  table: enumType(READ_TABLES),
  limit: numberType().int().min(1).max(2e3).default(1e3),
  orderBy: stringType().max(64).nullable().optional(),
  orderDir: enumType(["asc", "desc"]).default("desc")
}).parse(i)).handler(adminReadTableFn_createServerFn_handler, async ({
  data
}) => {
  const ctx = await requireAdminAuth();
  const {
    data: rows,
    error
  } = await supabaseAdmin.rpc("admin_db_read", {
    _token: ctx.adminToken,
    _table: data.table,
    _limit: data.limit,
    _order_by: data.orderBy ?? null,
    _order_dir: data.orderDir
  });
  if (error) return {
    ok: false,
    message: error.message,
    rows: []
  };
  return {
    ok: true,
    rows: rows || []
  };
});
const getCustomerOrdersFn_createServerFn_handler = createServerRpc({
  id: "101449e6e43aa2778ac33990b55916cad71277d2e761d7f3475cc6a185596381",
  name: "getCustomerOrdersFn",
  filename: "src/lib/admin.functions.ts"
}, (opts) => getCustomerOrdersFn.__executeServer(opts));
const getCustomerOrdersFn = createServerFn({
  method: "POST"
}).inputValidator((i) => objectType({
  customerId: stringType().uuid().optional(),
  email: emailSchema.optional()
}).parse(i)).handler(getCustomerOrdersFn_createServerFn_handler, async ({
  data
}) => {
  if (!data.customerId && !data.email) return {
    orders: []
  };
  let q = supabaseAdmin.from("orders").select("*").order("created_at", {
    ascending: false
  }).limit(100);
  if (data.email) q = q.ilike("customer_email", data.email);
  const {
    data: rows
  } = await q;
  return {
    orders: rows || []
  };
});
const getAffiliateSalesFn_createServerFn_handler = createServerRpc({
  id: "cb9695bbfe8c9facb52acc4c57e391af26654c9ac5255d50fefef628a5b914af",
  name: "getAffiliateSalesFn",
  filename: "src/lib/admin.functions.ts"
}, (opts) => getAffiliateSalesFn.__executeServer(opts));
const getAffiliateSalesFn = createServerFn({
  method: "POST"
}).inputValidator((i) => objectType({
  affiliateId: stringType().uuid()
}).parse(i)).handler(getAffiliateSalesFn_createServerFn_handler, async ({
  data
}) => {
  const {
    data: rows
  } = await supabaseAdmin.from("affiliate_sales").select("*").eq("affiliate_id", data.affiliateId).order("created_at", {
    ascending: false
  });
  return {
    sales: rows || []
  };
});
const updateCustomerFn_createServerFn_handler = createServerRpc({
  id: "f05367ec6ac4781a99a167046b0e5551266ead16297da18f1ebdd27da951b505",
  name: "updateCustomerFn",
  filename: "src/lib/admin.functions.ts"
}, (opts) => updateCustomerFn.__executeServer(opts));
const updateCustomerFn = createServerFn({
  method: "POST"
}).inputValidator((i) => objectType({
  customerId: stringType().uuid(),
  patch: objectType({
    name: stringType().trim().min(1).max(255).optional(),
    phone: stringType().trim().max(50).optional(),
    address: stringType().trim().max(500).nullable().optional(),
    addresses: arrayType(anyType()).optional(),
    favorites: arrayType(stringType()).optional()
  }).strict()
}).parse(i)).handler(updateCustomerFn_createServerFn_handler, async ({
  data
}) => {
  const {
    error
  } = await supabaseAdmin.from("customers").update(data.patch).eq("id", data.customerId);
  if (error) return {
    ok: false,
    message: error.message
  };
  return {
    ok: true
  };
});
const getGatewayConfigFn_createServerFn_handler = createServerRpc({
  id: "b88d6db9944f9ac9c1da3f54caa183718683f53d405b448ae1eab266127982e4",
  name: "getGatewayConfigFn",
  filename: "src/lib/admin.functions.ts"
}, (opts) => getGatewayConfigFn.__executeServer(opts));
const getGatewayConfigFn = createServerFn({
  method: "POST"
}).handler(getGatewayConfigFn_createServerFn_handler, async () => {
  await requireAdminAuth();
  const {
    data: rows
  } = await supabase.rpc("get_payment_gateway");
  const row = Array.isArray(rows) ? rows[0] : rows;
  return {
    mp_access_token: row?.mp_access_token ?? "",
    mp_public_key: row?.mp_public_key ?? "",
    environment: "production",
    max_installments: Number(row?.max_installments ?? 3),
    installment_fees: row?.installment_fees ?? {}
  };
});
const saveGatewayConfigFn_createServerFn_handler = createServerRpc({
  id: "8ea26b377af4d41862a014aa8a8f36574a2b4a771de46093a59cbb52f0c13c31",
  name: "saveGatewayConfigFn",
  filename: "src/lib/admin.functions.ts"
}, (opts) => saveGatewayConfigFn.__executeServer(opts));
const saveGatewayConfigFn = createServerFn({
  method: "POST"
}).inputValidator((i) => objectType({
  mp_access_token: stringType().trim().max(500).default(""),
  mp_public_key: stringType().trim().max(500).default(""),
  environment: enumType(["sandbox", "production"]).default("production"),
  max_installments: numberType().int().min(1).max(12),
  installment_fees: recordType(stringType(), numberType().min(0).max(100))
}).parse(i)).handler(saveGatewayConfigFn_createServerFn_handler, async ({
  data
}) => {
  const ctx = await requireAdminAuth();
  try {
    const {
      error
    } = await supabaseAdmin.rpc("save_payment_gateway", {
      _mp_access_token: data.mp_access_token || "",
      _mp_public_key: data.mp_public_key || "",
      _environment: data.environment,
      _max_installments: data.max_installments,
      _installment_fees: data.installment_fees
    });
    if (error) return {
      ok: false,
      message: `DB: ${error.message}`
    };
    await audit(ctx.adminEmail, "admin.gateway.save", "Configuração do gateway de pagamento alterada", {
      environment: data.environment,
      max_installments: data.max_installments,
      has_access_token: Boolean(data.mp_access_token),
      has_public_key: Boolean(data.mp_public_key)
    });
    return {
      ok: true,
      message: "Configuração salva!"
    };
  } catch (e) {
    return {
      ok: false,
      message: e instanceof Error ? `RPC: ${e.message}` : "Erro RPC"
    };
  }
});
const getSyncStatusFn_createServerFn_handler = createServerRpc({
  id: "653b1d3b26214e4c9698b4606868138a9d3cb9f754d723ff79bf1ae1662e8bbc",
  name: "getSyncStatusFn",
  filename: "src/lib/admin.functions.ts"
}, (opts) => getSyncStatusFn.__executeServer(opts));
const getSyncStatusFn = createServerFn({
  method: "POST"
}).handler(getSyncStatusFn_createServerFn_handler, async () => {
  await requireAdminAuth();
  try {
    async function tableStats(table, tsCol = "updated_at") {
      const client = supabaseAdmin;
      const [{
        count
      }, latest] = await Promise.all([client.from(table).select("*", {
        count: "exact",
        head: true
      }), client.from(table).select(tsCol).order(tsCol, {
        ascending: false
      }).limit(1).maybeSingle()]);
      return {
        count: count ?? 0,
        lastAt: latest.data?.[tsCol] ?? null
      };
    }
    const [orders, paidOrders, transactions, activityLogs, paymentEvents, lastWebhook] = await Promise.all([tableStats("orders", "updated_at"), supabaseAdmin.from("orders").select("paid_at", {
      count: "exact"
    }).eq("payment_status", "paid").order("paid_at", {
      ascending: false
    }).limit(1).then((r) => ({
      count: r.count ?? 0,
      lastAt: r.data?.[0]?.paid_at ?? null
    })), tableStats("transactions", "created_at"), tableStats("activity_logs", "created_at"), tableStats("payment_events", "processed_at"), supabaseAdmin.from("payment_events").select("mp_event_id, mp_payment_id, order_id, event_type, processed_at, raw_payload").order("processed_at", {
      ascending: false
    }).limit(1).maybeSingle().then((r) => r.data)]);
    let lastWebhookStatus = null;
    if (lastWebhook?.order_id) {
      const {
        data: o
      } = await supabaseAdmin.from("orders").select("payment_status").eq("id", lastWebhook.order_id).maybeSingle();
      lastWebhookStatus = o?.payment_status ?? null;
    }
    return {
      ok: true,
      serverTime: (/* @__PURE__ */ new Date()).toISOString(),
      tables: {
        orders,
        paidOrders,
        transactions,
        activityLogs,
        paymentEvents
      },
      lastWebhook: lastWebhook ? {
        mpEventId: lastWebhook.mp_event_id,
        mpPaymentId: lastWebhook.mp_payment_id,
        orderId: lastWebhook.order_id,
        eventType: lastWebhook.event_type,
        processedAt: lastWebhook.processed_at,
        orderStatus: lastWebhookStatus
      } : null
    };
  } catch (e) {
    console.error("[getSyncStatusFn] failed:", e);
    const msg = e instanceof Error ? `${e.name}: ${e.message}` : String(e);
    return {
      ok: true,
      serverTime: (/* @__PURE__ */ new Date()).toISOString(),
      tables: {
        orders: {
          count: 0,
          lastAt: null
        },
        paidOrders: {
          count: 0,
          lastAt: null
        },
        transactions: {
          count: 0,
          lastAt: null
        },
        activityLogs: {
          count: 0,
          lastAt: null
        },
        paymentEvents: {
          count: 0,
          lastAt: null
        }
      },
      lastWebhook: null,
      error: msg
    };
  }
});
export {
  adminDeleteFn_createServerFn_handler,
  adminReadTableFn_createServerFn_handler,
  adminUpdateFn_createServerFn_handler,
  adminUpsertFn_createServerFn_handler,
  createConsignmentFn_createServerFn_handler,
  deleteConsignmentFn_createServerFn_handler,
  getAdminSessionFn_createServerFn_handler,
  getAffiliateSalesFn_createServerFn_handler,
  getCustomerOrdersFn_createServerFn_handler,
  getGatewayConfigFn_createServerFn_handler,
  getSyncStatusFn_createServerFn_handler,
  listConsignmentsFn_createServerFn_handler,
  loginAdminFn_createServerFn_handler,
  logoutAdminFn_createServerFn_handler,
  saveGatewayConfigFn_createServerFn_handler,
  updateAdminPasswordFn_createServerFn_handler,
  updateCustomerFn_createServerFn_handler
};
