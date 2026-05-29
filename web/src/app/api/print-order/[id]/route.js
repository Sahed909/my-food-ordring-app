import sql from "@/app/api/utils/sql";

export async function GET(request, { params }) {
  try {
    const id = params.id;
    const orderResult = await sql`SELECT * FROM orders WHERE id = ${id}`;
    const order = orderResult[0];
    if (!order) return new Response("Order not found", { status: 404 });

    const items = await sql`SELECT * FROM order_items WHERE order_id = ${id}`;
    const restaurantResult =
      await sql`SELECT * FROM restaurants WHERE id = ${order.restaurant_id}`;
    const restaurant = restaurantResult[0];

    const itemRows = items
      .map(
        (item) => `
        <tr>
          <td style="padding:6px 0;">${item.item_name}</td>
          <td style="padding:6px 0;text-align:center;">${item.quantity}</td>
          <td style="padding:6px 0;text-align:right;">৳${Number(item.item_price).toFixed(0)}</td>
          <td style="padding:6px 0;text-align:right;">৳${Number(item.subtotal).toFixed(0)}</td>
        </tr>
      `,
      )
      .join("");

    const time = new Date(order.created_at).toLocaleString("en-BD", {
      dateStyle: "medium",
      timeStyle: "short",
    });

    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <title>Order #${order.id} — ${restaurant?.name || ""}</title>
  <style>
    body { font-family: monospace; max-width: 400px; margin: 20px auto; padding: 20px; }
    h1 { font-size: 20px; margin-bottom: 4px; }
    table { width: 100%; border-collapse: collapse; margin-top: 16px; }
    th { text-align: left; border-bottom: 1px solid #000; padding-bottom: 4px; }
    tfoot td { border-top: 1px solid #000; font-weight: bold; padding-top: 6px; }
    @media print { button { display: none; } }
  </style>
</head>
<body>
  <h1>${restaurant?.name || "Restaurant"}</h1>
  <p>Order #${order.id} &nbsp;·&nbsp; ${time}</p>
  <p><strong>Customer:</strong> ${order.customer_name}</p>
  ${order.notes ? `<p><strong>Note:</strong> ${order.notes}</p>` : ""}
  <table>
    <thead>
      <tr>
        <th>Item</th>
        <th style="text-align:center;">Qty</th>
        <th style="text-align:right;">Price</th>
        <th style="text-align:right;">Subtotal</th>
      </tr>
    </thead>
    <tbody>${itemRows}</tbody>
    <tfoot>
      <tr>
        <td colspan="3">Total</td>
        <td style="text-align:right;">৳${Number(order.total).toFixed(0)}</td>
      </tr>
    </tfoot>
  </table>
  <br />
  <button onclick="window.print()">🖨 Print</button>
</body>
</html>`;

    return new Response(html, {
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  } catch (error) {
    console.error(error);
    return new Response("Failed to generate print page", { status: 500 });
  }
}
