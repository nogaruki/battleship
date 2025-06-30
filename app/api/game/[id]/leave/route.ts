import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongo";
import Game from "@/models/Game";

export async function POST(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    await dbConnect();
    const { userId } = await req.json();
    const game = await Game.findById(params.id);
    if (!game) return NextResponse.json({ error: "Not found" }, { status: 404 });

    game.players = game.players.filter((p: any) => p.toString() !== userId);
    if (game.players.length === 0) await game.deleteOne();
    else await game.save();

    return NextResponse.json({ ok: true });
}
