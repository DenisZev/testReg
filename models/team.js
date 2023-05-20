const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String },
    userFirst: {  type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    hackathonId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Hackathon",

    },
});

const Team = mongoose.model('Team', teamSchema);

module.exports = Team;
