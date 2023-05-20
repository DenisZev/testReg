const Hackathon = require('../models/Hackathon');
const multer = require('multer');
const path = require('path');
const {data} = require("express-session/session/cookie");
const Team = require("../models/team");
const Answer = require("../models/answer");



// Загрузка изображений и файлов заданий в папку "public/images/hackathons"
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, 'public/images/hackathons');
    },
    filename: function(req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

// Проверка типа загружаемого файла
function checkFileType(file, cb) {
    const filetypes = /jpeg|jpg|png|gif|doc|docx|pdf|txt|zip|rar/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb('Error: Не правильный файл!');
    }
}

// Инициализация загрузки
const upload = multer({
    storage: storage,
    fileFilter: function(req, file, cb) {
        checkFileType(file, cb);
    }
}).fields([{ name: 'thumbnail', maxCount: 1 }, { name: 'mainImage', maxCount: 1 }, {name: 'tasks', maxCount: 10}]);


exports.getHackathons = async (req, res) => {

    try {
        const hackathons = await Hackathon.find();

        res.render(`hackathons`, {hackathons, user: req.user});


    } catch (err) {
        console.error(err);
    }

};

exports.getHackathonById = async (req, res) => {
    try {
        const hackathonId = req.params.id;
        const teams = await Team.find({ hackathonId: hackathonId }).populate('members').populate('userFirst');

        const hackathon = await Hackathon.findById(hackathonId).populate('participants');

        // Проверка, является ли текущий пользователь участником хакатона
        const isParticipant = req.user && hackathon.participants.some(participant => participant.id === req.user.id);

        res.render('hackathon', {
            hackathon,
            user: req.user,
            isParticipant: isParticipant || false,
            teams,

        });
    } catch (err) {
        console.error(err);
        res.redirect('/home');
    }
};


exports.createHackathon = async (req, res) => {
    upload(req, res, async (err) => {
        try {
            if (err) {
                // Ошибка при загрузке изображения
                console.log(err);
            }
            // Создание нового хакатона
            const hackathon = new Hackathon({
                title: req.body.title,
                description: req.body.description,
                organizer: req.body.organizer,
                location: req.body.location,
                startDate: req.body.startDate,
                endDate: req.body.endDate,
                participants: [],


            });
            //Если есть главное изображение
            if (req.files && req.files['mainImage']) {
                const mainImage = req.files['mainImage'][0];
                hackathon.mainImage = {
                    data: mainImage.filename,
                    contentType: mainImage.mimetype,

                };
            }
            // Если есть задание
            if (req.files && req.files['tasks']) {
                const tasks = req.files['tasks'];
                hackathon.tasks = tasks.map((task, index) => {
                    return {
                        title: `Задание ${index + 1}`,
                        data: task.filename,
                        contentType: task.mimetype,
                    };
                });
            }
            // Если есть изображение-эскиз
            if (req.files && req.files['thumbnail']) {
                const thumbnail = req.files['thumbnail'][0];
                hackathon.thumbnail = {
                    data: thumbnail.filename,
                    contentType: thumbnail.mimetype,
                };
            }
            try {
                const savedHackathon = await hackathon.save();
                res.redirect('back');

            } catch (err) {
                console.error(err);
                res.status(500).json({ error: 'Error creating hackathon' });
            }
        } catch (err) {
            console.log(err);
            res.status(400).send('Error: Unable to create hackathon');
        }
    });
};

exports.updateHackathon = async (req, res) => {
    try {
        await Hackathon.findByIdAndUpdate(req.params.id, req.body, {new: true});
        res.redirect('/hackathons');
    } catch (err) {
        console.error(err);
    }
};

exports.deleteHackathon = async (req, res) => {
    try {
        await Hackathon.findByIdAndDelete(req.params.id);
        res.redirect('/hackathons');
    } catch (err) {
        console.error(err);
    }
};

