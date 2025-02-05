import mongoose from "mongoose";

const AnnouncementSchema = new mongoose.Schema({
    title: String,
    description: String,
    date: Date,
    author: String || {type: mongoose.Schema.Types.ObjectId, ref : 'User'},
    image: String,
    category: String
}, {
    timestamps: true
})

export const Announcement = mongoose.model('Announcement', AnnouncementSchema);