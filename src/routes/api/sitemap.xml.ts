import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export const Route = createFileRoute("/api/sitemap/xml")({
  server: {
    handlers: {
      GET: async () => {
        try {
          const { data: categories } = await supabaseAdmin.from("categories").select("slug");
          const { data: products } = await supabaseAdmin.from("products").select("id").eq("active", true);

          const baseUrl = "https://princesadelacos.com.br";
          const now = new Date().toISOString();

          const staticUrls = [
            "",
            "/categorias",
            "/buscar",
            "/sobre",
            "/login",
            "/cadastro"
          ];

          let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
          xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

          for (const url of staticUrls) {
            xml += `  <url>\n    <loc>${baseUrl}${url}</loc>\n    <lastmod>${now}</lastmod>\n    <changefreq>daily</changefreq>\n    <priority>1.0</priority>\n  </url>\n`;
          }

          if (categories) {
            for (const cat of categories) {
              if (cat.slug) {
                xml += `  <url>\n    <loc>${baseUrl}/categoria/${cat.slug}</loc>\n    <lastmod>${now}</lastmod>\n    <changefreq>daily</changefreq>\n    <priority>0.8</priority>\n  </url>\n`;
              }
            }
          }

          if (products) {
            for (const prod of products) {
              xml += `  <url>\n    <loc>${baseUrl}/produto/${prod.id}</loc>\n    <lastmod>${now}</lastmod>\n    <changefreq>daily</changefreq>\n    <priority>0.6</priority>\n  </url>\n`;
            }
          }

          xml += `</urlset>`;

          return new Response(xml, {
            headers: {
              "Content-Type": "application/xml",
              "Cache-Control": "public, max-age=3600, s-maxage=86400",
            },
          });
        } catch (e) {
          console.error("Sitemap error:", e);
          return new Response("Error generating sitemap", { status: 500 });
        }
      },
    },
  },
});
