import logoUrl from "@/assets/logo-princesa.png";
import type { Order, StoreSettings } from "@/lib/store";
import { getOrderStatusLabel, normalizeOrderStatus } from "@/lib/store";

const brl = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const fmt = (d: string) =>
  new Date(d).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });

const esc = (s: unknown) =>
  String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

export function printOrderReceipt(order: Order, settings: StoreSettings) {
  const status = normalizeOrderStatus(order.status);
  const logoSrc = new URL(logoUrl, window.location.origin).href;
  const shortId = String(order.id).slice(0, 8).toUpperCase();
  const itemsHtml = order.items
    .map(
      (it) => `
      <tr>
        <td>${esc(it.name)}</td>
        <td class="num">${it.quantity}</td>
        <td class="num">${brl(it.price)}</td>
        <td class="num">${brl(it.price * it.quantity)}</td>
      </tr>`,
    )
    .join("");

  const html = `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8" />
<title>Recibo Pedido #${shortId} — ${esc(settings.storeName)}</title>
<style>
  * { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; background: #f4f4f5; color: #111; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; }
  .sheet { width: 210mm; min-height: 297mm; margin: 16px auto; padding: 22mm 18mm; background: #fff; box-shadow: 0 4px 24px rgba(0,0,0,.08); }
  header { display: flex; justify-content: space-between; align-items: flex-start; gap: 16px; border-bottom: 2px solid #ec4899; padding-bottom: 14px; margin-bottom: 18px; }
  .brand { display: flex; align-items: center; gap: 12px; }
  .brand img { width: 56px; height: 56px; object-fit: contain; }
  .brand h1 { margin: 0; font-size: 18px; color: #ec4899; }
  .brand .meta { font-size: 11px; color: #555; line-height: 1.5; }
  .doc-info { text-align: right; font-size: 11px; color: #444; }
  .doc-info .num { font-size: 16px; font-weight: 700; color: #111; }
  .doc-info .badge { display: inline-block; margin-top: 4px; padding: 2px 8px; border-radius: 999px; background: #fef3c7; color: #92400e; font-weight: 600; font-size: 10px; text-transform: uppercase; letter-spacing: .04em; }
  .badge.pago { background: #d1fae5; color: #065f46; }
  .badge.cancelado { background: #fee2e2; color: #991b1b; }
  h2 { margin: 18px 0 8px; font-size: 12px; text-transform: uppercase; letter-spacing: .08em; color: #ec4899; border-bottom: 1px solid #eee; padding-bottom: 4px; }
  .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; font-size: 12px; line-height: 1.6; }
  .grid p { margin: 0; }
  .grid strong { color: #555; font-weight: 600; }
  table { width: 100%; border-collapse: collapse; font-size: 12px; margin-top: 4px; }
  th, td { padding: 8px 6px; border-bottom: 1px solid #eee; text-align: left; vertical-align: top; }
  th { background: #fafafa; font-size: 10px; text-transform: uppercase; letter-spacing: .06em; color: #555; }
  td.num, th.num { text-align: right; white-space: nowrap; }
  .totals { margin-top: 10px; margin-left: auto; width: 260px; font-size: 12px; }
  .totals .row { display: flex; justify-content: space-between; padding: 4px 0; }
  .totals .total { border-top: 2px solid #111; margin-top: 6px; padding-top: 8px; font-size: 16px; font-weight: 700; color: #ec4899; }
  .notes { margin-top: 14px; padding: 10px 12px; border-left: 3px solid #f59e0b; background: #fffbeb; font-size: 12px; }
  footer { margin-top: 28px; text-align: center; font-size: 10px; color: #777; border-top: 1px dashed #ddd; padding-top: 10px; }
  .actions { position: fixed; top: 12px; right: 12px; display: flex; gap: 8px; }
  .actions button { padding: 8px 14px; border-radius: 999px; border: 0; background: #ec4899; color: #fff; font-weight: 600; cursor: pointer; box-shadow: 0 4px 12px rgba(236,72,153,.3); }
  .actions button.secondary { background: #fff; color: #111; border: 1px solid #ddd; box-shadow: none; }
  @media print {
    body { background: #fff; }
    .sheet { margin: 0; box-shadow: none; padding: 14mm; }
    .actions { display: none; }
    @page { size: A4; margin: 10mm; }
  }
</style>
</head>
<body>
  <div class="actions">
    <button class="secondary" onclick="window.close()">Fechar</button>
    <button onclick="window.print()">Imprimir</button>
  </div>
  <div class="sheet">
    <header>
      <div class="brand">
        <img src="${esc(logoSrc)}" alt="logo" onerror="this.style.display='none'" />
        <div>
          <h1>${esc(settings.storeName)}</h1>
          <div class="meta">
            ${esc(settings.address)}<br/>
            ${esc(settings.whatsapp)} ${settings.instagram ? "· " + esc(settings.instagram) : ""}
          </div>
        </div>
      </div>
      <div class="doc-info">
        <div>RECIBO DE PEDIDO</div>
        <div class="num">#${shortId}</div>
        <div>Emitido em ${fmt(new Date().toISOString())}</div>
        <div class="badge ${status === "pago" || status === "concluido" ? "pago" : ""} ${status === "cancelado" || status === "reembolsado" ? "cancelado" : ""}">
          ${esc(getOrderStatusLabel(status))}
        </div>
      </div>
    </header>

    <div class="grid">
      <div>
        <h2>Cliente</h2>
        <p><strong>Nome:</strong> ${esc(order.customerName)}</p>
        <p><strong>E-mail:</strong> ${esc(order.customerEmail)}</p>
        <p><strong>Telefone:</strong> ${esc(order.customerPhone)}</p>
      </div>
      <div>
        <h2>${order.deliveryMethod === "retirada" ? "Retirada no ateliê" : "Entrega"}</h2>
        <p>${esc(order.address || "—")}</p>
        <p style="margin-top:6px"><strong>Pagamento:</strong> ${esc(order.paymentMethod.toUpperCase())}</p>
        ${order.paidAt ? `<p><strong>Pago em:</strong> ${fmt(order.paidAt)}</p>` : ""}
        ${order.mpPaymentId ? `<p><strong>ID Pagamento:</strong> ${esc(order.mpPaymentId)}</p>` : ""}
        <p><strong>Pedido criado:</strong> ${fmt(order.createdAt)}</p>
      </div>
    </div>

    <h2>Itens</h2>
    <table>
      <thead>
        <tr>
          <th>Produto</th>
          <th class="num">Qtd</th>
          <th class="num">Unitário</th>
          <th class="num">Subtotal</th>
        </tr>
      </thead>
      <tbody>${itemsHtml}</tbody>
    </table>

    <div class="totals">
      <div class="row"><span>Subtotal</span><span>${brl(order.subtotal)}</span></div>
      ${order.discount > 0 ? `<div class="row"><span>Desconto</span><span>- ${brl(order.discount)}</span></div>` : ""}
      ${order.shipping > 0 ? `<div class="row"><span>Frete</span><span>${brl(order.shipping)}</span></div>` : ""}
      <div class="row total"><span>Total</span><span>${brl(order.total)}</span></div>
    </div>

    ${order.notes ? `<div class="notes"><strong>Observações do cliente:</strong><br/>${esc(order.notes).replace(/\n/g, "<br/>")}</div>` : ""}

    <footer>
      Obrigado por comprar com a ${esc(settings.storeName)} 💖<br/>
      Em caso de dúvidas, fale conosco no WhatsApp ${esc(settings.whatsapp)}.
    </footer>
  </div>
  <script>setTimeout(function(){ try { window.focus(); window.print(); } catch(e){} }, 400);</script>
</body>
</html>`;

  const w = window.open("", "_blank", "width=820,height=900");
  if (!w) {
    alert("Permita pop-ups para abrir o recibo.");
    return;
  }
  w.document.open();
  w.document.write(html);
  w.document.close();
}
