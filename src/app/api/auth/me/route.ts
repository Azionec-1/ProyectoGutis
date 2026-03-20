import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth-server";

export async function GET() {
  try {
    const user = await getCurrentUser();
    return NextResponse.json({ user });
  } catch (error) {
    console.error("Error al obtener la sesión actual:", error);
    return NextResponse.json({ user: null }, { status: 500 });
  }
}
