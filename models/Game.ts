// models/Game.ts
import { Schema, model, models, Types } from "mongoose";

const Shot = new Schema({
    x: Number,
    y: Number,
    hit: Boolean,
});

const GameSchema = new Schema(
    {
        players: [{ type: Types.ObjectId, ref: "User" }],
        boards: { type: [[[Number]]], required: true },
        turn: { type: Number, default: 0 },
        shots: [[Shot]],
    },
    { timestamps: true }
);

export default models.Game ?? model("Game", GameSchema);
