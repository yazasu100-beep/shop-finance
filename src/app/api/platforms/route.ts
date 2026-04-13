import { NextRequest, NextResponse } from "next/server";
import {
  getPlatformSales,
  createPlatformSale,
  updatePlatformSale,
  deletePlatformSale,
} from "@/lib/notion";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const startDate = searchParams.get("startDate") ?? undefined;
  const endDate = searchParams.get("endDate") ?? undefined;

  try {
    const sales = await getPlatformSales(startDate, endDate);
    return NextResponse.json(sales);
  } catch (error) {
    console.error("GET /api/platforms error:", error);
    return NextResponse.json({ error: "조회 실패" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const sale = await createPlatformSale(body);
    return NextResponse.json(sale, { status: 201 });
  } catch (error) {
    console.error("POST /api/platforms error:", error);
    return NextResponse.json({ error: "저장 실패" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "ID가 필요합니다" }, { status: 400 });
  }

  try {
    const body = await request.json();
    await updatePlatformSale(id, body);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("PATCH /api/platforms error:", error);
    return NextResponse.json({ error: "수정 실패" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "ID가 필요합니다" }, { status: 400 });
  }

  try {
    await deletePlatformSale(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/platforms error:", error);
    return NextResponse.json({ error: "삭제 실패" }, { status: 500 });
  }
}
