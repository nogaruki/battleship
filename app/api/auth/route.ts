import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongo";
import User from "@/models/User";

export async function POST(req: NextRequest) {
    await dbConnect();
    const { pseudo } = await req.json();
    if (!pseudo) return NextResponse.json({ error: "Pseudo missing" }, { status: 400 });

    const user = await User.findOneAndUpdate(
        { pseudo },
        { $setOnInsert: { pseudo } },
        { upsert: true, new: true }
    );

    return NextResponse.json({ _id: user._id, pseudo });
}
