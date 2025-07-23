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
        finished: { type: Boolean, default: false },
        winner:  { type: Types.ObjectId, ref: "User", default: null },
    },
    { timestamps: true }
);

export default models.Game ?? model("Game", GameSchema);
