import { type NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongo";
import Game from "@/models/Game";

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }   // ← ✔︎ Promise
) {
    const { id } = await params;                      // ← on await
    await dbConnect();

    const { userId, x, y } = await req.json();

    const game = await Game.findById(id);
    if (!game)
        return NextResponse.json({ error: "Game not found" }, { status: 404 });

    const playerIdx = game.players.findIndex(
        (p: any) => p.toString() === userId
    );
    if (playerIdx !== game.turn)
        return NextResponse.json({ error: "Not your turn" }, { status: 400 });

    const enemyIdx = 1 - playerIdx;
    const hit = game.boards[enemyIdx][y][x] === 1;

    // 0 = mer, 1 = navire, 2 = touché / -1 = raté
    game.boards[enemyIdx][y][x] = hit ? 2 : -1;
    game.shots[playerIdx].push({ x, y, hit });
    game.turn = enemyIdx;

    await game.save();

    return NextResponse.json({ hit });
}
