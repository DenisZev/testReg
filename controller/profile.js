const User = require('../models/user');
const Answer = require('../models/answer');
exports.profile_get = async (req, res, next) => {
    Answer.find({ user: req.user._id })
        .populate('user')
        .exec((err, answers) => {
            if (err) return next(err);
            res.render('profile', { answers: answers });
        });


};

