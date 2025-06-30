import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongo";
import Game from "@/models/Game";

export async function POST(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    await dbConnect();
    const { userId, board } = await req.json();
    const game = await Game.findById(params.id);

    if (!game) return NextResponse.json({ error: "Game not found" }, { status: 404 });
    if (game.players.length > 1)
        return NextResponse.json({ error: "Game full" }, { status: 400 });
~
    game.players.push(userId);
    game.boards[1] = board;     // seconde grille
    await game.save();

    return NextResponse.json({ ok: true });
}
