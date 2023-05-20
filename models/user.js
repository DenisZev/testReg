const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const userSchema = new mongoose.Schema({
    role: {
        type: String,
        enum: ['Admin', 'User'],
        default: 'User'
    },
    firstName: {
        type: String,
        required: true,
    },
    lastName: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
    },
    password: {
        type: String,
        required: true,
    },
    specialization: {
        type: String,
        default: 'other',
    },
    profilePicture: String,
    hackathonIds: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Hackathon',
    }],

});






// hash user password before saving to database
userSchema.pre('save', function(next) {
    const user = this;
    if (!user.isModified('password')) {
        return next();
    }
    bcrypt.genSalt(10, (err, salt) => {
        if (err) {
            return next(err);
        }
        bcrypt.hash(user.password, salt, (err, hash) => {
            if (err) {
                return next(err);
            }
            user.password = hash;
            next();
        });
    });
});

// compare user password with the given password
userSchema.methods.comparePassword = function(candidatePassword, callback) {
    bcrypt.compare(candidatePassword, this.password, (err, isMatch) => {
        if (err) {
            return callback(err);
        }
        callback(null, isMatch);
    });
};

userSchema.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.password);
};


exports.getUsersRanking = async (req, res, next) => {
    try {
        const users = await user.find();
        const ranking = users.map((user) => {
            return {
                user: user.name,
                score: user.answers.reduce((totalScore, answer) => totalScore + answer.score, 0),
            };
        });

        ranking.sort((a, b) => b.score - a.score);

        res.status(200).json({ ranking });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Failed to get users ranking", error: err });
    }
};


module.exports = mongoose.model('User', userSchema);
