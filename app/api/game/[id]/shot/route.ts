import { type NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongo";
import Game from "@/models/Game";

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
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

    /* -------- maj du plateau -------- */
    const enemyIdx = 1 - playerIdx;
    const hit = game.boards[enemyIdx][y][x] === 1;
    if (game.boards[enemyIdx][y][x] === 2 || game.boards[enemyIdx][y][x] === -1) {
        return NextResponse.json({ error: "Already shot here" }, { status: 400 });
    }
    game.boards[enemyIdx][y][x] = hit ? 2 : -1;

    game.shots[playerIdx].push({ x, y, hit });
    game.turn = enemyIdx;

    const enemyShipsLeft = game.boards[enemyIdx].some((row: number[]) => row.includes(1));
    if (!enemyShipsLeft) {
        game.finished = true;
        game.winner   = userId;
        game.finished = true;
        game.winner = game.players[playerIdx];
    }

    game.markModified("boards");

    await game.save();

    return NextResponse.json({ hit });
}
