const mongoose = require('mongoose');

const hackathonSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    location: {
        type: String,
        required: true
    },
    organizer: {
        type: String,
        required: true
    },
    participants: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    answers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Answer'
    }],
    taskTitle: {
        type: String,

    },
    tasks: [
        {
            contentType: String,
            data: Buffer,
            title: String,

        }
    ],
    thumbnailImage: {
        data: Buffer,
        contentType: String
    },
    mainImage: {
        data: Buffer,
        contentType: String
    },
    taskImages: [{
        data: Buffer,
        contentType: String
    }],

    isParticipant: {
        type: Boolean,
        default: false
    },

});

const Hackathon = mongoose.model('Hackathon', hackathonSchema);

module.exports = Hackathon;
