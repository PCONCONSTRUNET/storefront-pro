import { createFileRoute } from "@tanstack/react-router";
import { StoreLayout } from "@/components/StoreLayout";

export const Route = createFileRoute("/trocas")({
  component: Trocas,
});

function Trocas() {
  return (
    <StoreLayout>
      <div className="max-w-4xl mx-auto px-4 py-8 md:py-12 animate-fade-in">
        <h1 className="text-3xl font-bold text-foreground mb-8">Trocas e Devoluções</h1>
        
        <div className="prose prose-pink max-w-none text-muted-foreground space-y-6">
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">1. Política de Troca e Devolução</h2>
            <p>
              Na Princesa de Laços, nossa maior prioridade é a sua satisfação. Caso a peça não tenha servido, você não tenha gostado ou haja algum defeito de fabricação, você tem o direito de solicitar a troca ou devolução.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">2. Prazos</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Desistência ou Arrependimento:</strong> Você tem até 7 (sete) dias corridos após o recebimento do produto para solicitar a devolução, conforme o Código de Defesa do Consumidor.</li>
              <li><strong>Defeito de Fabricação:</strong> O prazo é de até 30 (trinta) dias corridos após o recebimento para acionar a garantia contra defeitos.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">3. Condições para Troca</h2>
            <p>Para que a troca ou devolução seja aceita, o produto deve seguir as seguintes regras:</p>
            <ul className="list-disc pl-5 space-y-2 mt-2">
              <li>Não pode apresentar sinais de uso, lavagem ou modificações.</li>
              <li>Deve estar na embalagem original ou similar, sem danos.</li>
              <li>Todas as etiquetas e tags devem estar fixadas à peça.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">4. Como Solicitar</h2>
            <p>
              Entre em contato conosco através do nosso WhatsApp ou formulário de suporte informando o número do seu pedido e o motivo da troca. Nossa equipe responderá em até 48 horas úteis com as instruções para envio.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">5. Restituição de Valores</h2>
            <p>
              Em caso de devolução definitiva, o estorno será realizado na mesma forma de pagamento escolhida no momento da compra:
            </p>
            <ul className="list-disc pl-5 space-y-2 mt-2">
              <li><strong>Pix:</strong> Transferência em até 3 dias úteis após a chegada e análise do produto.</li>
              <li><strong>Cartão de Crédito:</strong> O estorno poderá ocorrer em até 2 faturas subsequentes, dependendo da administradora do cartão.</li>
            </ul>
          </section>
        </div>
      </div>
    </StoreLayout>
  );
}
