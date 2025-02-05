import mongoose from "mongoose";

const ClassSchema = new mongoose.Schema({
    name: String,
    description: String,
    cover: String,
    code: String,    
    teacher: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    time: String,
    weekDays: {
        type: [String],
        enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    }
})

export default mongoose.model('Class', ClassSchema)