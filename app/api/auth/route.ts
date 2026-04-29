import { NextResponse } from "next/server";
export async function POST() { return NextResponse.json({ error: "Usa /api/auth/[slug]" }, { status: 410 }); }
export async function DELETE() { return NextResponse.json({ error: "Usa /api/auth/[slug]" }, { status: 410 }); }
