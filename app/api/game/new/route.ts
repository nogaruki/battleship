import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongo";
import Game from "@/models/Game";

export async function POST(req: NextRequest) {
    await dbConnect();
    const { userId, board } = await req.json();
    if (!Array.isArray(board) || board.length !== 10 || board.some(r => r.length !== 10))
        return NextResponse.json({ error: "Plateau invalide" }, { status: 400 });

    const shipCells = board.flat().filter((c: number) => c === 1).length;
    if (shipCells !== 17)
        return NextResponse.json({ error: "Il faut exactement 17 cases navire" }, { status: 400 });

    const game = await Game.create({
        players: [userId],
        boards: [board, Array(10).fill(Array(10).fill(0))],
        shots: [[], []],
    });
    return NextResponse.json({ gameId: game._id });
}
