ALTER TABLE "public"."store_settings"
ADD COLUMN "superfrete_address_street" text,
ADD COLUMN "superfrete_address_number" text,
ADD COLUMN "superfrete_address_neighborhood" text,
ADD COLUMN "superfrete_address_city" text,
ADD COLUMN "superfrete_address_state" text;

ALTER TABLE "public"."orders"
ADD COLUMN "superfrete_order_id" text,
ADD COLUMN "superfrete_label_url" text;
