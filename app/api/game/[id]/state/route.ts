import { type NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongo";
import Game from "@/models/Game";
import User from "@/models/User";
void User;

export async function GET(
    _req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    await dbConnect();

    const game = await Game.findById(id).populate("players", "pseudo").lean();
    if (!game)
        return NextResponse.json({ error: "Not found" }, { status: 404 });

    return NextResponse.json(game);
}
