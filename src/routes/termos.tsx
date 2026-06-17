import { createFileRoute } from "@tanstack/react-router";
import { StoreLayout } from "@/components/StoreLayout";

export const Route = createFileRoute("/termos")({
  component: Termos,
});

function Termos() {
  return (
    <StoreLayout>
      <div className="max-w-4xl mx-auto px-4 py-8 md:py-12 animate-fade-in">
        <h1 className="text-3xl font-bold text-foreground mb-8">Privacidade e Termos de Uso</h1>
        
        <div className="prose prose-pink max-w-none text-muted-foreground space-y-6">
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">1. Coleta de Dados</h2>
            <p>
              A Princesa de Laços coleta dados pessoais (nome, e-mail, telefone, endereço, CPF) necessários apenas para a conclusão de sua compra, emissão de nota fiscal, entrega dos produtos e para melhoria contínua dos nossos serviços e atendimento.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">2. Privacidade e Segurança</h2>
            <p>
              Temos um compromisso absoluto com a sua segurança e privacidade. Seus dados cadastrais jamais serão vendidos, trocados ou divulgados para terceiros, exceto quando essas informações forem essenciais para o processo de entrega e cobrança.
            </p>
            <p className="mt-2">
              Utilizamos a plataforma Mercado Pago para o processamento de pagamentos. Nenhuma informação de cartão de crédito é armazenada em nossos servidores, sendo processada diretamente em ambiente seguro pelo gateway de pagamento.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">3. Uso de Cookies</h2>
            <p>
              Utilizamos cookies e tecnologias similares para personalizar sua experiência, reconhecer você em visitas futuras, manter os itens no carrinho de compras e analisar o tráfego em nosso site. Você pode desabilitar os cookies no seu navegador, porém algumas funcionalidades da loja poderão parar de funcionar.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">4. Direitos Autorais</h2>
            <p>
              Todo o conteúdo deste site (textos, imagens, logos, fotos dos produtos e design gráfico) é de propriedade exclusiva da Princesa de Laços. É expressamente proibida a cópia, reprodução ou uso indevido dessas informações sem autorização prévia por escrito.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">5. Alterações nos Termos</h2>
            <p>
              Reservamo-nos o direito de alterar estas políticas a qualquer momento para adaptar a novas normas legais ou mudanças nas operações da loja. As alterações entrarão em vigor assim que publicadas no site.
            </p>
          </section>
        </div>
      </div>
    </StoreLayout>
  );
}
