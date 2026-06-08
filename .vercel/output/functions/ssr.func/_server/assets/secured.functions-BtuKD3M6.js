import { c as createServerRpc } from "./createServerRpc-DU8qnOlg.js";
import { o as objectType, s as stringType, c as supabaseAdmin } from "./client.server-C7GAOqxY.js";
import { a0 as createServerFn } from "../server.js";
import "node:async_hooks";
import "node:stream";
import "node:stream/web";
import "util";
import "crypto";
import "async_hooks";
import "stream";
const consumeResetTokenFn_createServerFn_handler = createServerRpc({
  id: "fe3995ac40f4577ef294d2b39e9ce3c63a650a0628ddb6d656c14dfffd8346fa",
  name: "consumeResetTokenFn",
  filename: "src/lib/secured.functions.ts"
}, (opts) => consumeResetTokenFn.__executeServer(opts));
const consumeResetTokenFn = createServerFn({
  method: "POST"
}).inputValidator((input) => objectType({
  token: stringType().min(8).max(200)
}).parse(input)).handler(consumeResetTokenFn_createServerFn_handler, async ({
  data
}) => {
  const {
    data: rows,
    error
  } = await supabaseAdmin.rpc("consume_password_reset_token", {
    _token: data.token
  });
  if (error || !rows || rows.length === 0) return null;
  const row = rows[0];
  return {
    subjectType: row.subject_type,
    subjectEmail: row.subject_email
  };
});
const applyOrderStockDecrementFn_createServerFn_handler = createServerRpc({
  id: "2b97ff0ea7e04343d6546e1660ee009ead04fcb67d2354c05f80da40a4497993",
  name: "applyOrderStockDecrementFn",
  filename: "src/lib/secured.functions.ts"
}, (opts) => applyOrderStockDecrementFn.__executeServer(opts));
const applyOrderStockDecrementFn = createServerFn({
  method: "POST"
}).inputValidator((input) => objectType({
  orderId: stringType().uuid()
}).parse(input)).handler(applyOrderStockDecrementFn_createServerFn_handler, async ({
  data
}) => {
  const {
    error
  } = await supabaseAdmin.rpc("apply_order_stock_decrement", {
    _order_id: data.orderId
  });
  if (error) return {
    ok: false,
    message: error.message
  };
  return {
    ok: true
  };
});
export {
  applyOrderStockDecrementFn_createServerFn_handler,
  consumeResetTokenFn_createServerFn_handler
};
