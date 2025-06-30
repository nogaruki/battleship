import { type NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongo";
import Game from "@/models/Game";

export async function POST(
    req: NextRequest,                                 // 1️⃣
    { params }: { params: Promise<{ id: string }> }   // 2️⃣
) {
    const { id } = await params;                      // <- on attend la Promise
    await dbConnect();

    const { userId, board } = await req.json();
    const game = await Game.findById(id);
    if (!game) return NextResponse.json({ error: "Game not found" }, { status: 404 });
    if (!Array.isArray(board) || board.flat().every((n) => n !== 1))
        return NextResponse.json({ error: "Board invalid / empty" }, { status: 400 });
    if (game.players.length > 1)
        return NextResponse.json({ error: "Game full" }, { status: 400 });

    game.players.push(userId);
    game.boards[1] = board;
    await game.save();

    return NextResponse.json({ ok: true });
}
