import { type NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongo";
import Game from "@/models/Game";

export async function GET(
    _req: NextRequest,
    { params }: { params: Promise<{ id: string }> }   // ← params est UNE Promise
) {
    const { id } = await params;                      // ← on l’attend
    await dbConnect();

    const game = await Game.findById(id).lean();
    if (!game)
        return NextResponse.json({ error: "Not found" }, { status: 404 });

    return NextResponse.json(game);
}
