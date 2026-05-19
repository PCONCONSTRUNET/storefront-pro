CREATE TABLE public.affiliate_consignments (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  affiliate_id uuid NOT NULL,
  quantity integer NOT NULL DEFAULT 0,
  total_value numeric NOT NULL DEFAULT 0,
  picked_up_at timestamp with time zone NOT NULL DEFAULT now(),
  notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.affiliate_consignments ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_aff_consignments_affiliate ON public.affiliate_consignments(affiliate_id, picked_up_at DESC);