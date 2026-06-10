import type { Order, StoreSettings } from "@/lib/store";

const esc = (s: unknown) =>
  String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

export function printShippingLabel(order: Order, settings: StoreSettings) {

  const trackingCodeMatch = order.notes?.match(/\[RASTREIO:\s*(.*?)\]/);
  const trackingCode = trackingCodeMatch ? trackingCodeMatch[1] : "________________________";

  const now = new Date();
  const day = String(now.getDate()).padStart(2, "0");
  const monthNames = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
  const month = monthNames[now.getMonth()];
  const year = now.getFullYear();
  const formattedDate = `${day} de ${month} de ${year}`;

  const totalValue = order.items.reduce((a, b) => a + (b.price * b.quantity), 0);
  const totalQtd = order.items.reduce((a, b) => a + b.quantity, 0);

  // Attempt to parse city, state, cep from order address
  const addrStr = order.address || "";
  const cepMatch = addrStr.match(/CEP:\s*([\d-]+)/i);
  const orderCep = cepMatch ? cepMatch[1] : "";
  const cityStateMatch = addrStr.match(/,\s*([^,]+)\s*-\s*([A-Z]{2})(?:,\s*CEP:|$)/i);
  const orderCity = cityStateMatch ? cityStateMatch[1] : "";
  const orderState = cityStateMatch ? cityStateMatch[2] : "";
  const orderStreet = addrStr.replace(/,\s*[^,]+\s*-\s*[A-Z]{2}(?:,\s*CEP:.*)?$/i, "").trim();

  // Attempt to parse settings address
  const sAddrStr = settings.address || "";
  const sCepMatch = sAddrStr.match(/CEP:\s*([\d-]+)/i);
  const sCep = sCepMatch ? sCepMatch[1] : "";
  const sCityStateMatch = sAddrStr.match(/,\s*([^,]+)\s*-\s*([A-Z]{2})(?:,\s*CEP:|$)/i);
  const sCity = sCityStateMatch ? sCityStateMatch[1] : "";
  const sState = sCityStateMatch ? sCityStateMatch[2] : "";
  const sStreet = sAddrStr.replace(/,\s*[^,]+\s*-\s*[A-Z]{2}(?:,\s*CEP:.*)?$/i, "").trim();

  const html = `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8" />
<title>Declaração de Conteúdo - Pedido #${esc(order.id)}</title>
<style>
  * { box-sizing: border-box; }
  @page { size: A4; margin: 0; }
  body { margin: 0; padding: 0; font-family: Arial, sans-serif; background: #555; color: #000; font-size: 11px; }
  .sheet { width: 210mm; min-height: 297mm; margin: 0 auto; background: #fff; padding: 10mm; position: relative; }
  
  .container {
    border: 2px solid #000;
  }

  .title-section {
    text-align: center;
    padding: 15px;
    border-bottom: 1px solid #000;
  }
  .title { font-size: 18px; font-weight: bold; }
  .tracking { margin-top: 15px; font-size: 13px; text-decoration: underline; }

  table { width: 100%; border-collapse: collapse; }
  table, th, td { border: 1px solid #000; }
  
  .addr-table td { padding: 4px; vertical-align: top; }
  .addr-table th { background: #e0e0e0; text-align: center; padding: 4px; font-size: 11px; font-weight: normal; }
  
  .inner-table { border: none; width: 100%; margin: -4px; }
  .inner-table td { border: none; padding: 4px; }
  .inner-table td:first-child { border-right: 1px solid #000; }

  .section-title {
    background: #e0e0e0;
    text-align: center;
    font-size: 11px;
    padding: 4px;
    border-top: 1px solid #000;
    border-bottom: 1px solid #000;
  }

  .items-table th { background: #e0e0e0; padding: 4px; font-size: 10px; font-weight: normal; }
  .items-table td { padding: 4px; font-size: 11px; }
  .items-table td.center { text-align: center; }
  .items-table td.right { text-align: right; }
  
  .declaration-box {
    padding: 8px;
    font-size: 10px;
    text-align: justify;
    line-height: 1.3;
    border-bottom: 1px solid #000;
  }
  
  .signature-area {
    margin-top: 25px;
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    padding: 0 10px;
    margin-bottom: 10px;
  }
  
  .obs-box {
    padding: 6px;
    font-size: 10px;
    text-align: center;
  }

  .actions { position: fixed; top: 12px; right: 12px; display: flex; gap: 8px; z-index: 10; }
  .actions button { padding: 8px 14px; border-radius: 4px; border: 1px solid #000; background: #fff; color: #000; font-weight: bold; cursor: pointer; }
  .actions button.primary { background: #000; color: #fff; }

  @media print {
    body { background: #fff; }
    .sheet { margin: 0; box-shadow: none; }
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
    <div class="container">
      <div class="title-section">
        <div class="title">DECLARAÇÃO DE CONTEÚDO</div>
        <div class="tracking">Código de Rastreamento: ${esc(trackingCode)}</div>
      </div>
      
      <table class="addr-table">
        <tr>
          <th style="width: 50%">REMETENTE</th>
          <th style="width: 50%">DESTINATÁRIO</th>
        </tr>
        <tr>
          <td>NOME: ${esc(settings.storeName)}</td>
          <td>NOME: ${esc(order.customerName)}</td>
        </tr>
        <tr>
          <td style="height: 40px">ENDEREÇO: ${esc(sStreet || settings.address)}</td>
          <td style="height: 40px">ENDEREÇO: ${esc(orderStreet || order.address)}</td>
        </tr>
        <tr>
          <td style="padding: 0">
            <table class="inner-table">
              <tr>
                <td style="width: 60%">MUNICÍPIO: ${esc(sCity)}</td>
                <td style="width: 40%">UF: ${esc(sState)}</td>
              </tr>
            </table>
          </td>
          <td style="padding: 0">
            <table class="inner-table">
              <tr>
                <td style="width: 60%">MUNICÍPIO: ${esc(orderCity)}</td>
                <td style="width: 40%">UF: ${esc(orderState)}</td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="padding: 0">
            <table class="inner-table">
              <tr>
                <td style="width: 60%">CEP: ${esc(sCep)}</td>
                <td style="width: 40%">CPF/CNPJ: ${esc(settings.cpfCnpj)}</td>
              </tr>
            </table>
          </td>
          <td style="padding: 0">
            <table class="inner-table">
              <tr>
                <td style="width: 60%">CEP: ${esc(orderCep)}</td>
                <td style="width: 40%">CPF/CNPJ: ${esc(order.customerCpf)}</td>
              </tr>
            </table>
          </td>
        </tr>
      </table>

      <div class="section-title">IDENTIFICAÇÃO DOS BENS</div>
      
      <table class="items-table" style="border-top: none; border-bottom: none;">
        <thead>
          <tr>
            <th style="width: 5%; border-top: none;">Nº</th>
            <th style="width: 20%; border-top: none;">CÓDIGO (SKU)</th>
            <th style="width: 45%; border-top: none;">DESCRIÇÃO DO PRODUTO</th>
            <th style="width: 10%; border-top: none;">VARIAÇÃO</th>
            <th style="width: 10%; border-top: none;">QTD</th>
            <th style="width: 10%; border-top: none;">VALOR</th>
          </tr>
        </thead>
        <tbody>
          ${order.items.map((it, idx) => `
          <tr>
            <td class="center">${idx + 1}</td>
            <td>${esc(it.productId)}</td>
            <td>${esc(it.name)}</td>
            <td></td>
            <td class="center">${it.quantity}</td>
            <td class="right">${(it.price).toFixed(2)}</td>
          </tr>
          `).join("")}
          <tr>
            <td colspan="4" class="right">Totais</td>
            <td class="center">${totalQtd}</td>
            <td class="right">${totalValue.toFixed(2)}</td>
          </tr>
          <tr>
            <td colspan="5" class="right">Peso Total (kg)</td>
            <td class="center"></td>
          </tr>
        </tbody>
      </table>

      <div class="section-title">DECLARAÇÃO</div>
      
      <div class="declaration-box">
        Declaro que não me enquadro no conceito de contribuinte previsto no art. 4º da Lei Complementar nº 87/1996, uma vez que não realizo, com habitualidade ou em volume que caracterize intuito comercial, operações de circulação de mercadoria, ainda que se iniciem no exterior, ou estou dispensado da emissão da nota fiscal por força da legislação tributária vigente, responsabilizando-me, nos termos da lei e a quem de direito, por informações inverídicas.
        <br/><br/>
        Declaro ainda que não estou postando conteúdo inflamável, explosivo, causador de combustão espontânea, tóxico, corrosivo, gás ou qualquer outro conteúdo que constitua perigo, conforme o art. 13 da Lei Postal no 6.538/78.
        
        <div class="signature-area">
          <div>${formattedDate}</div>
          <div style="text-align: center;">
            ___________________________________________________________<br/>
            Assinatura do Declarante/Remetente
          </div>
        </div>
      </div>

      <div style="text-align: center; font-size: 11px; padding: 4px; border-bottom: 1px solid #000; background: #e0e0e0;">OBSERVAÇÃO:</div>
      <div class="obs-box">
        Constitui crime contra a ordem tributária suprimir ou reduzir tributo, ou contribuição social e qualquer acessório (Lei 8.137/90 Art. 1o, V).
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
