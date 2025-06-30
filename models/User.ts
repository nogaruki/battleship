import { Schema, model, models } from "mongoose";

const UserSchema = new Schema({
    pseudo: { type: String, required: true, unique: true },
});

export default models.User ?? model("User", UserSchema);
