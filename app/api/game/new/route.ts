import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongo";
import Game from "@/models/Game";

export async function POST(req: NextRequest) {
    await dbConnect();
    const { userId, board } = await req.json(); // board = 10×10 array with 0/1
    const game = await Game.create({
        players: [userId],
        boards: [board, Array(10).fill(Array(10).fill(0))],
        shots: [[], []],
    });
    return NextResponse.json({ gameId: game._id });
}
