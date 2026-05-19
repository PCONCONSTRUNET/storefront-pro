type Props = {
  className?: string;
};

/**
 * Marcador lateral com gradiente usado em cards/modais de pedido.
 * Posiciona-se absolutamente — o container pai precisa ser `relative` e `overflow-hidden`.
 */
export function OrderAccentBar({ className = "top-3 bottom-3" }: Props) {
  return (
    <span
      aria-hidden
      className={`pointer-events-none absolute left-0 w-1 rounded-full bg-gradient-to-b from-primary via-accent to-primary/40 ${className}`}
    />
  );
}
