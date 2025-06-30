import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongo";
import Game from "@/models/Game";

export async function GET() {
    await dbConnect();
    const games = await Game.find({ "players.1": { $exists: false } })
        .populate("players", "pseudo")
        .select("_id players")
        .lean();
    return NextResponse.json(games);
}
