import sql from "@/app/api/utils/sql";

export async function DELETE(request, { params }) {
  try {
    const id = params.id;
    if (!id) {
      return Response.json({ error: "ID is required" }, { status: 400 });
    }

    await sql`DELETE FROM qr_codes WHERE id = ${id}`;
    return Response.json({ success: true });
  } catch (error) {
    console.error(error);
    return Response.json(
      { error: "Failed to delete QR code" },
      { status: 500 },
    );
  }
}
