const express = require('express');
const mongoose = require('mongoose');
const app = express();
const userRoutes = require('./controller/regcontroller');
const passport = require('passport');
const User = require('./models/user');
const flash = require('connect-flash');
const LocalStrategy = require('passport-local').Strategy;
const config = require('./config/db');
const session = require('express-session');
const path = require('path');
const mime = require('mime');
const profileController = require('./controller/profile');
const Hackathon = require('./models/Hackathon');
const hackathonController = require('./controller/hackathonController');
const check = require('./controller/checkController');
const hackathonRoutes = require('./routes/hackathonRoutes');
const Answer = require('./models/answer');
const methodOverride = require('method-override');
const Team = require("./models/team");
const Task = require("./models/task");
app.use('/public/css', express.static(path.join(__dirname, 'public', 'css'), { 'Content-Type': 'text/css' }));

// app.use('/public/images/hackathons', express.static(path.join(__dirname, 'public', 'images', 'hackathons'), { 'Content-Type': 'text/css' }));

app.use(express.static(path.join(__dirname, 'public')));

app.use(methodOverride('_method'));



app.use('/', hackathonRoutes);
app.use(express.static(path.join(__dirname, 'public'), {
    setHeaders: function(res, path) {
        res.setHeader('Content-Type', mime.getType(path));
    }
}));


mongoose.connect(config.db, { useNewUrlParser: true, useUnifiedTopology: true});

// Настройка сессий
app.use(session({
    secret: 'my-secret-key',
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

// Установка промежуточного программного обеспечения для флеш-сообщений
app.use(flash());

app.use(express.urlencoded({ extended: true }));

app.set('view engine', 'ejs');

app.use('/', userRoutes);





passport.use(new LocalStrategy({
        usernameField: 'email',
        passwordField: 'password'
    },
    function(email, password, done) {
        User.findOne({ email: email }, function(err, user) {
            if (err) { return done(err); }
            if (!user) {
                return done(null, false, { message: 'Incorrect email.' });
            }
            if (!user.validPassword(password)) {
                return done(null, false, { message: 'Incorrect password.' });
            }

            return done(null, user, err);

        });
    }
));
app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    next();
});
passport.serializeUser(function(user, done) {
    done(null, user.id);
});

passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
        done(err, user);
    });
});


app.use(function(err, req, res, next) {
    console.error(err);
    res.status(500).send('Internal Server Error');
});

app.listen(80, () => {
    console.log('Server is listening on port 3000.');
});
//Маршруты для упправления хакатонами

app.get('/hackathons', hackathonController.getHackathons);
app.get('/hackathons/:id', hackathonController.getHackathonById);
app.post('/hackathons', hackathonController.createHackathon);
app.post('/hackathons/:id/update', hackathonController.updateHackathon);
app.post('/hackathons/:id/delete', hackathonController.deleteHackathon);

app.post('/hackathons/:id/join', async (req, res) => {
    try {

        const hackathon = await Hackathon.findById(req.params.id);
        if (!hackathon) {
            return res.status(404).send('Хакатон не найден');
        }

        const participant = new Participant({
            name: req.user.firstName,
            email: req.user.email,
            hackathon: hackathon._id
        });
        await participant.save();
        res.status(200).send('OK');

    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});


app.post('/answer/:id/check', (req, res) => {
    const answerId = req.params.id;
    const newStatus = 'На проверке';
    const UserId = req.user.id;
    // Обновление статуса в базе данных
    Answer.findByIdAndUpdate(answerId, { status: newStatus, checkedBy: UserId }, (err, answer) => {
        if (err) {
            console.error(err);
            res.sendStatus(500);
        } else if (!answer) {
            res.sendStatus(404);
        } else {
            res.sendStatus(200);
        }
    });
});

app.post('/answer/:id/score', function(req, res) {
    var answerId = req.params.id;
    var score = req.body.score;
    var comment = req.body.comment;
    var status = req.body.status;
    console.log(answerId, score, comment)



    // Найдем ответ по его id
    Answer.findById(answerId, function(err, answer) {
        if (err) {
            console.error(err);
            return res.status(500).send('Ошибка сервера');
        }
        if (!answer) {
            return res.status(404).send('Ответ не найден');
        }

        // Обновим оценку, комментарий и статус ответа
        answer.score = score;
        answer.comment = comment;
        answer.status = status;
        // answer.hackathonId = answer.hackathonId;
        // Сохраняем изменения
        answer.save(function(err) {
            if (err) {
                console.error(err);
                return res.status(500).send('Ошибка сервера');
            }
            res.redirect('/answers');
        });
    });
});

// Маршрут для получения заданий выбранного хакатона
app.get('/tasks', async (req, res) => {
    try {
        const hackathonId = req.query.hackathon;

        // Выполняем запрос к базе данных, чтобы получить задания выбранного хакатона
        const tasks = await Hackathon.find({ _id: hackathonId }, {'tasks._id': 1});
        const taskIds = tasks[0].tasks.map(task => task._id);

        res.json(taskIds);
    } catch (error) {
        console.error('Ошибка при получении заданий:', error);
        res.status(500).json({ error: 'Ошибка при получении заданий' });
    }
});
