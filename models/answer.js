const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const answerSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    task: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Task",
        required: true,
    },
    hackathonId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Hackathon",
        // required: true,
    },
    file: {
        data: Buffer,
        contentType: String,
    },
    score: {
        type: Number,
        min: 0,
        max: 10
    },
    status: {
        type: String,
        enum: ["Отправлен", "Принят", "Отклонен", "Оценено", "На проверке"],
        default: "Отправлен",
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    comment: {
        type: String,
    },
    checkedBy: {
        type: String,
    },
    team: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Team",

    }
});


module.exports = mongoose.model('Answer', answerSchema);
