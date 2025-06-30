import { Schema, model, models, Types } from "mongoose";

const Shot = new Schema({
    x: Number,
    y: Number,
    hit: Boolean,
});

const GameSchema = new Schema({
    players: [{ type: Types.ObjectId, ref: "User" }],
    boards: { type: [[Number]], required: true },     // 0 = sea, 1 = ship, 2 = sunk
    turn: { type: Number, default: 0 },               // index of `players`
    shots: [[Shot]],                                  // parallel to players
}, { timestamps: true });

export default models.Game ?? model("Game", GameSchema);
