const Check = require('../models/check');

// Начало проверки задания
exports.startCheck = async (req, res, next) => {
    try {
        const check = new Check({
            taskId: req.body.taskId,
            userId: req.user._id,
            startTime: new Date()
        });
        await check.save();
        res.status(201).json(check);
    } catch (err) {
        next(err);
    }
};

// Завершение проверки задания
exports.finishCheck = async (req, res, next) => {
    try {
        const check = await Check.findOneAndUpdate(
            {
                taskId: req.params.taskId,
                userId: req.user._id,
                endTime: null
            },
            {
                endTime: new Date()
            }
        );
        if (!check) {
            return res.status(404).send('Check not found');
        }
        res.status(200).json(check);
    } catch (err) {
        next(err);
    }
};
