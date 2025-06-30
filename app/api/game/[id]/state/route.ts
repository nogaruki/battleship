import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongo";
import Game from "@/models/Game";

export async function GET(
    _: Request,
    { params }: { params: { id: string } }
) {
    await dbConnect();
    const game = await Game.findById(params.id).lean();
    if (!game) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(game);
}
