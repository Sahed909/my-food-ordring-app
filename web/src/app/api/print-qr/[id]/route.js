import sql from "@/app/api/utils/sql";

export async function GET(request, { params }) {
  try {
    const id = params.id;
    const qrResult = await sql`SELECT * FROM qr_codes WHERE id = ${id}`;
    const qr = qrResult[0];
    if (!qr) return new Response("QR code not found", { status: 404 });

    const restaurantResult =
      await sql`SELECT * FROM restaurants WHERE id = ${qr.restaurant_id}`;
    const restaurant = restaurantResult[0];

    const appUrl = process.env.NEXT_PUBLIC_CREATE_APP_URL || "";
    const orderUrl = `${appUrl}/order/${id}`;
    const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&margin=10&data=${encodeURIComponent(orderUrl)}`;

    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <title>QR Code — ${restaurant?.name || ""}</title>
  <style>
    body { font-family: sans-serif; text-align: center; padding: 40px; }
    h1 { font-size: 28px; margin-bottom: 8px; }
    p { color: #666; margin-bottom: 24px; }
    img { display: block; margin: 0 auto; border: 1px solid #eee; border-radius: 12px; }
    .label { margin-top: 16px; font-size: 18px; font-weight: 600; }
    .type { color: #888; font-size: 14px; margin-top: 4px; }
    @media print { button { display: none; } }
  </style>
</head>
<body>
  <h1>${restaurant?.name || "Our Menu"}</h1>
  <p>Scan to view menu &amp; order</p>
  <img src="${qrImageUrl}" width="300" height="300" alt="QR Code" />
  <div class="label">${qr.label}</div>
  <div class="type">${qr.type === "permanent" ? "Permanent QR" : "Temporary QR"}</div>
  <br />
  <button onclick="window.print()">🖨 Print</button>
</body>
</html>`;

    return new Response(html, {
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  } catch (error) {
    console.error(error);
    return new Response("Failed to generate QR print page", { status: 500 });
  }
}
