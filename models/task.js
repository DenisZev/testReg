const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    hackathon: { type: mongoose.Schema.Types.ObjectId, ref: 'Hackathon' },
    file: {
        data: Buffer,
        contentType: String,
    },
});

const Task = mongoose.model('Task', taskSchema);

module.exports = Task;
