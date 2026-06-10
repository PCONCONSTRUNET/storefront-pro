import logoUrl from "@/assets/logo-princesa.png";
import type { Order, StoreSettings } from "@/lib/store";

const brl = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const esc = (s: unknown) =>
  String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

export function printShippingLabel(order: Order, settings: StoreSettings) {
  const logoSrc = new URL(logoUrl, window.location.origin).href;
  
  const itemsHtml = order.items
    .map(
      (it) => `
      <tr>
        <td class="desc">${esc(it.name)}</td>
        <td class="center">${it.quantity}</td>
        <td class="right">${brl(it.price * it.quantity)}</td>
      </tr>`,
    )
    .join("");

  const totalValue = order.items.reduce((a, b) => a + (b.price * b.quantity), 0);
  
  const html = `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8" />
<title>Declaração de Conteúdo - Pedido #${esc(order.id)}</title>
<style>
  * { box-sizing: border-box; }
  @page { size: A4; margin: 0; }
  body { margin: 0; padding: 0; font-family: Arial, sans-serif; background: #555; color: #000; font-size: 11px; }
  .sheet { width: 210mm; min-height: 297mm; margin: 0 auto; background: #fff; padding: 15mm 15mm; position: relative; }
  
  .title { text-align: center; font-size: 18px; font-weight: bold; text-transform: uppercase; margin-bottom: 20px; text-decoration: underline; }
  
  .box { border: 1px solid #000; margin-bottom: 10px; }
  .box-header { background: #eee; border-bottom: 1px solid #000; padding: 4px 6px; font-weight: bold; text-transform: uppercase; font-size: 10px; }
  .box-content { padding: 8px 6px; }
  
  .row { display: flex; gap: 10px; margin-bottom: 6px; }
  .col { flex: 1; }
  
  .label { font-size: 9px; color: #333; margin-bottom: 2px; }
  .value { font-weight: bold; font-size: 12px; }
  
  table.items { width: 100%; border-collapse: collapse; margin-top: 10px; border: 1px solid #000; }
  table.items th, table.items td { border: 1px solid #000; padding: 5px; }
  table.items th { background: #eee; text-align: center; font-size: 10px; }
  table.items td.desc { width: 60%; }
  table.items td.center { text-align: center; }
  table.items td.right { text-align: right; }
  
  .total-row { font-weight: bold; }
  
  .signature-box { border: 1px dashed #000; padding: 15px; margin-top: 20px; text-align: justify; font-size: 10px; line-height: 1.4; }
  .sign-line { margin-top: 30px; border-top: 1px solid #000; width: 60%; margin-left: auto; margin-right: auto; text-align: center; padding-top: 5px; }

  .actions { position: fixed; top: 12px; right: 12px; display: flex; gap: 8px; z-index: 10; }
  .actions button { padding: 8px 14px; border-radius: 4px; border: 1px solid #000; background: #fff; color: #000; font-weight: bold; cursor: pointer; }
  .actions button.primary { background: #000; color: #fff; }
  
  .scissors { text-align: center; margin: 30px 0; border-bottom: 1px dashed #999; line-height: 0.1em; color: #999; }
  .scissors span { background: #fff; padding: 0 10px; font-size: 16px; }

  @media print {
    body { background: #fff; }
    .sheet { margin: 0; padding: 10mm; box-shadow: none; }
    .actions { display: none; }
  }
</style>
</head>
<body>
  <div class="actions">
    <button onclick="window.close()">Fechar</button>
    <button class="primary" onclick="window.print()">Imprimir Etiqueta</button>
  </div>
  
  <div class="sheet">
    <div class="title">Declaração de Conteúdo</div>
    
    <div class="box">
      <div class="box-header">Remetente</div>
      <div class="box-content">
        <div class="row">
          <div class="col" style="flex: 2">
            <div class="label">NOME/RAZÃO SOCIAL:</div>
            <div class="value">${esc(settings.storeName)}</div>
          </div>
          <div class="col">
            <div class="label">CPF/CNPJ:</div>
            <div class="value">${esc(settings.cpfCnpj || "_______________________")}</div>
          </div>
        </div>
        <div class="row">
          <div class="col">
            <div class="label">ENDEREÇO:</div>
            <div class="value">${esc(settings.address)}</div>
          </div>
        </div>
      </div>
    </div>
    
    <div class="box">
      <div class="box-header">Destinatário</div>
      <div class="box-content">
        <div class="row">
          <div class="col" style="flex: 2">
            <div class="label">NOME/RAZÃO SOCIAL:</div>
            <div class="value">${esc(order.customerName)}</div>
          </div>
          <div class="col">
            <div class="label">CPF/CNPJ:</div>
            <div class="value">${esc(order.customerCpf || "_______________________")}</div>
          </div>
        </div>
        <div class="row">
          <div class="col">
            <div class="label">ENDEREÇO:</div>
            <div class="value">${esc(order.address)}</div>
          </div>
        </div>
      </div>
    </div>
    
    <table class="items">
      <thead>
        <tr>
          <th>Item</th>
          <th>Conteúdo</th>
          <th>Quant.</th>
          <th>Valor (R$)</th>
        </tr>
      </thead>
      <tbody>
        ${order.items.map((it, idx) => `
        <tr>
          <td class="center">${idx + 1}</td>
          <td class="desc">${esc(it.name)}</td>
          <td class="center">${it.quantity}</td>
          <td class="right">${brl(it.price * it.quantity)}</td>
        </tr>
        `).join("")}
        <tr class="total-row">
          <td colspan="3" class="right">TOTAIS</td>
          <td class="right">${brl(totalValue)}</td>
        </tr>
      </tbody>
    </table>
    
    <div class="signature-box">
      Declaro que não me enquadro no conceito de contribuinte previsto no art. 4º da Lei Complementar nº 87/1996, uma vez que não realizo, com habitualidade ou em volume que caracterize intuito comercial, operações de circulação de mercadoria, ainda que se iniciem no exterior, ou estou dispensado da emissão da nota fiscal por força da legislação tributária vigente, responsabilizando-me, nos termos da lei e a quem de direito, por informações inverídicas.
      
      <div style="margin-top: 20px; display: flex; justify-content: space-between;">
        <div>Local e Data:<br/><br/>________________________, ____/____/________</div>
        <div style="flex-grow: 1; margin-left: 40px;">
          <div class="sign-line">Assinatura do Remetente / Declarante</div>
        </div>
      </div>
    </div>
    
    <div class="scissors"><span>✂</span></div>
    
    <!-- Etiqueta de Envio (Pequena) -->
    <div style="border: 2px solid #000; padding: 15px; width: 50%; margin: 0 auto; text-align: center; border-radius: 8px;">
      <h3 style="margin: 0 0 10px 0; font-size: 16px; text-transform: uppercase;">Para</h3>
      <div style="font-size: 14px; font-weight: bold; margin-bottom: 5px;">${esc(order.customerName)}</div>
      <div style="font-size: 12px; margin-bottom: 10px;">${esc(order.address)}</div>
      
      <div style="border-top: 1px dashed #ccc; padding-top: 10px; font-size: 10px; color: #555;">
        <strong>Remetente:</strong> ${esc(settings.storeName)}<br/>
        ${esc(settings.address)}
      </div>
    </div>
    
  </div>
  <script>setTimeout(function(){ try { window.focus(); window.print(); } catch(e){} }, 400);</script>
</body>
</html>`;

  const w = window.open("", "_blank", "width=820,height=900");
  if (!w) {
    alert("Permita pop-ups para abrir a etiqueta.");
    return;
  }
  w.document.open();
  w.document.write(html);
  w.document.close();
}
