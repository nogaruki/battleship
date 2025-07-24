import { dbConnect } from "@/lib/mongo";
import Game from "@/models/Game";
import User from "@/models/User";
void User;
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    await dbConnect();
    const userId = req.nextUrl.searchParams.get("userId");
    const finished = req.nextUrl.searchParams.get("finished") === "true";

    if (!userId) return NextResponse.json({ error: "userId manquant" }, { status: 400 });

    const games = await Game.find({
        players: userId,
        finished,
    })
        .populate("players", "pseudo")
        .select("_id players finished winner updatedAt")
        .sort({ updatedAt: -1 })
        .lean();

    return NextResponse.json(games);
}
