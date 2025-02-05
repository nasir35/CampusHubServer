import mongoose from "mongoose";

const BatchSchema = new mongoose.Schema({
    batch: String,
    session: String,
    department: String,
    thumbnail: String,
    title: String,
    members : [{type: mongoose.Schema.Types.ObjectId, ref : 'User'}]
}, {
    timestamps: true,
})

export const Batch = mongoose.model("Batch", BatchSchema);