const express = require('express');
const router = express.Router();
const User = require('../models/user');
const passport = require('passport');
const authMiddleware = require('./authMiddleware');
const Hackathon = require('../models/Hackathon');
const hackathonController = require('../controller/hackathonController');
const answerController = require('../controller/answerController');
const Answer = require("../models/answer");
const multer = require('multer');
const path = require("path");

const Team = require("../models/team");


router.get('/register', (req, res) => {
    const errorMessage = req.flash('errorMessage'); // Получение сообщения об ошибке из сессии
    res.render('register', {user: res.locals.currentUser, errorMessage });
});

// конфигурация multer
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/images')
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));

    }
});

const upload = multer({ storage: storage });

router.post('/register', upload.single('profilePicture'), async (req, res) => {
    try {
        const { firstName, lastName, email, password, specialization } = req.body;

        // Проверка, существует ли пользователь с заданным логином
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.render('register', { errorMessage: 'Пользователь с таким email уже существует' });
        }

        const user = new User({
            firstName,
            lastName,
            email,
            password,
            specialization,
            profilePicture: req.file ? req.file.filename : null,
        });

        await user.save();
        res.redirect('/login');
    } catch (err) {
        res.render('register', { errorMessage: 'Произошла ошибка при сохранении пользователя' });
    }
});







// display login form
router.get('/login', (req, res) => {
    res.render('login', {user: res.locals.currentUser, message: req.flash('error') });
});

// Роут для страницы "О нас"
router.get('/about', (req, res) => {
    res.render('about', {user: res.locals.currentUser})
});
router.get('/contact', (req, res) => {
    res.render('contact', {user: res.locals.currentUser})
});
// authenticate user with email and password
router.post('/login', function(req, res, next) {
    passport.authenticate('local', function(err, user, info) {
        if (err) { return next(err); }
        if (!user) { return res.render('login', { message: 'Неверный логин или пароль!' }); }
        req.logIn(user, function(err) {
            if (err) { return next(err); }
            return res.redirect('/home');
        });
    })(req, res, next);
});

// logout current user
router.get('/logout', (req, res) => {
    req.logout(() => {
        return res.redirect('/home');
    });
});


router.get('/home', authMiddleware.requireAuth, async (req, res) => {
    try {
        const hackathons = await Hackathon.find({});
        res.render('home', {
            user: req.user,
            hackathons: hackathons
        });
    } catch (error) {
        console.log(error);
        res.render('error', { message: 'Error loading hackathons' });
    }

});

router.get('/', authMiddleware.requireAuth, async (req, res) => {
    try {
        const hackathons = await Hackathon.find({});


            res.render('home', {  hackathons });

    } catch (error) {
        console.log(error);
        res.status(500).send('Internal Server Error');
    }
});



router.get('/profile1', authMiddleware.requireAuth, async (req, res) => {
    User.findById(req.user._id).populate('hackathonIds').exec((err, user) => {

        if (err) {
            console.error(err);
            return res.status(500).send('Internal Server Error');
        }

        res.render('profile', { user });
    });



});

router.get('/profile', authMiddleware.requireAuth, async (req, res) => {
    try {
        const answers = await Answer.find({user: req.user._id}).populate('hackathonId');
        const teams = await Team.find().populate('userFirst').populate('members');
        const score = parseInt(answers.reduce((total, answer) => total + answer.score, 0));
        let totalScore = 0;

        answers.forEach(answer => {
            if (answer.score) {
                totalScore += answer.score;
            }
        });
        const user = await User.findById(req.user._id)
            .populate('hackathonIds')
            .populate({
                path: 'hackathonIds',
                populate: { path: 'tasks' }
            })

            .exec();


        res.render('profile', { user, answers, teams, totalScore });
    } catch (err) {
        console.error(err);
        res.redirect('/home');
    }
});

router.get('/portfolio', authMiddleware.requireAuth, async (req, res, next) => {
    const answers = await Answer.find({user: req.user._id}).populate('hackathonId');

    res.render('portfolio', {answers, user: req.user});
});

//Роуты для хакатов

//добавление хакатонов
router.get('/hackathons/add', authMiddleware.requireAdmin,  (req, res) => {
    res.render('add-hackathon', {
        title: 'Добавить хакатон',
        user: req.user,

    });
});



router.get('/hackathons', authMiddleware.requireAuth, hackathonController.getHackathons, (req, res) => {
    res.render('hackathons', {
        user: req.locals.currentUser,
        hackathons: req.hackathons
    })
});



router.post('/hackathons/:id/join', authMiddleware.requireAuth, (req, res) => {
    const hackathonId = req.params.id;
    const userId = req.user._id;
    User.findByIdAndUpdate(
        userId,
        {$push: {hackathonIds: hackathonId}},
        {new: true},
        (err , user) => {
            if (err) {
                return res.status(500).send(err);
            }
        }
    )
    Hackathon.findByIdAndUpdate(
        hackathonId,
        { $push: { participants: userId } },
        { new: true },
        (err, hackathon) => {
            if (err) {
                // handle error
                return res.status(500).send(err);
            }
            // redirect to the hackathon page or show a success message
            res.redirect(`/hackathons/${hackathon._id}`);
        }
    );
});

router.post('/hackathons/:id/cancel', authMiddleware.requireAuth, async (req, res) => {
    try {
        const hackathonId = req.params.id;
        const userId = req.user._id;

        // Находим хакатон
        const hackathon = await Hackathon.findById(hackathonId);

        // Удаляем пользователя из списка участников хакатона
        hackathon.participants.pull(userId);
        User.findByIdAndUpdate(
            userId,
            {$pull: {hackathonIds: hackathonId}},
            {new: true},
            (err , user) => {
                if (err) {
                    return res.status(500).send(err);
                }
            }
        )
        // Сохраняем изменения в базе данных
        await hackathon.save();

        // Перенаправляем пользователя на страницу хакатона
        res.redirect(`/hackathons/${hackathonId}`);

    } catch (err) {
        console.error(err);
        // Обработка ошибок
    }
});
// GET all answers
router.get('/answers', authMiddleware.requireAuth, async (req, res) => {
    try {
        const answers = await Answer.find({}).populate('user');


        res.render('answers', { answers,
            user: req.user,});
    } catch (error) {
        console.log(error);
        res.status(500).send('Internal Server Error');
    }
});

// GET answer file
router.get('/answers/:id', async (req, res) => {
    try {
        const answer = await Answer.findById(req.params.id);
        res.set('Content-Type', answer.file.contentType);
        res.send(answer.file.data);
    } catch (error) {
        console.log(error);
        res.status(500).send('Internal Server Error');
    }
});
router.post('/profile/answer', answerController.createAnswer);
router.put('/answers/:answerId', authMiddleware.requireAuth, answerController.updateAnswer);
router.get('/answer/:answerId/review', answerController.getAnswerReview);
router.post('/answers/:id/delete', authMiddleware.requireAuth, answerController.deleteAnswer);

router.post('/team/:id/join', async (req, res) => {
    try {
        const teamId = req.params.id;
        const userId = req.user._id;
        const team = await Team.findByIdAndUpdate(
            teamId,
            { $addToSet: { members: userId } },
            { new: true }
        ).populate('userFirst').populate('members');
        res.redirect('back');
    } catch (error) {
        console.log(error);
        res.redirect('/profile');
    }
});
router.post('/team/:id/leave', async (req, res) => {
    try {
        const teamId = req.params.id;
        const userId = req.user._id;
        const team = await Team.findByIdAndUpdate(
            teamId,
            { $pull: { members: userId } },
            { new: true }
        ).populate('userFirst').populate('members');
        res.redirect('back');
    } catch (error) {
        console.log(error);
        res.redirect('/profile');
    }
});


router.post('/teams/new', async (req, res) => {
    const { name, description, hackathonId } = req.body;
    const userFirst = req.user;

    try {
        const team = new Team({ name, description, userFirst, hackathonId });
        await team.save();
        res.redirect('/teams');
    } catch (error) {
        console.log(error);
    }
});

// export router
module.exports = router;