import { dbConnect } from "@/lib/mongo";
import Game from "@/models/Game";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    await dbConnect();
    const { userId } = await req.json();

    const game = await Game.findById(id);
    if (!game)   return NextResponse.json({ error: "Introuvable" }, { status: 404 });
    if (game.finished)
        return NextResponse.json({ error: "Partie terminée — pas de delete" }, { status: 400 });
    if (game.players[0].toString() !== userId)
        return NextResponse.json({ error: "Seul le créateur peut supprimer" }, { status: 403 });

    await game.deleteOne();
    return NextResponse.json({ ok: true });
}
