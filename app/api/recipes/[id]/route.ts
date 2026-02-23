// GET /api/recipes/[id]
// Fetch a single recipe by its Firestore document ID.

import { NextRequest } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    console.debug("[recipes:get] Fetching recipe by id:", id);

    const adminDb = getAdminDb();
    const doc = await adminDb.collection("recipes").doc(id).get();
    console.debug("[recipes:get] Recipe exists:", doc.exists);

    if (!doc.exists) {
      return Response.json({ error: "Recipe not found." }, { status: 404 });
    }

    const recipe = { id: doc.id, ...doc.data() };
    return Response.json({ recipe });
  } catch (error) {
    console.error("Get recipe error:", error);
    return Response.json(
      { error: "Failed to fetch recipe." },
      { status: 500 }
    );
  }
}
