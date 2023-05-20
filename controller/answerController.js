const Answer = require('../models/answer');
const multer = require("multer");
const path = require("path");
const express = require('express');
const router = express.Router();

// Загрузка изображений и файлов заданий в папку "answer"
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, 'public/answer');
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
}).fields([{ name: 'fileAnswer', maxCount: 2 }]);


exports.createAnswer = async (req, res, next) => {

    const file = upload;
    upload(req, res, async (err) => {
        try {
            if (err instanceof multer.MulterError) {
                return res.status(400).send("Ошибка при загрузке файла");
            } else if (err) {
                return res.status(500).send("Ошибка при загрузке файла");
            }
            const taskId = req.body.task;
            const userId = req.user.id;
            const hackathonId = req.body.hackathon;
            const teamId = req.body.team;
            const answer = new Answer({
                user: userId,
                task: taskId,
                hackathonId: hackathonId,
                team: teamId,


            });
            if (req.files && req.files['fileAnswer']) {
                const file = req.files['fileAnswer'][0];
                answer.file = {
                    data: file.filename,
                    contentType: file.mimetype,
                };
            }
            console.log(req.body);
            await answer.save();
            res.status(201).send(`<script>alert('Answer created successfully'); window.history.back()</script>`);
        } catch (err) {
            console.log(err);
            res.status(500).json({ message: "Failed to create answer", error: err });
        }
    });
};

exports.updateAnswer = async (req, res, next) => {
    try {
        const answerId = req.params.answerId;
        const status = req.body.status; // получаем новый статус из запроса
        const score = req.body.score; // получаем новую оценку из запроса

        const answer = await Answer.findById(answerId);
        if (!answer) {
            return res.status(404).json({ message: "Answer not found" });
        }

        answer.status = status; // обновляем статус
        answer.score = score; // обновляем оценку
        await answer.save();

        res.status(200).json({ message: "Answer updated successfully", answer: answer });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Failed to update answer", error: err });
    }
};

exports.getAnswerReview = async (req, res, next) => {
    try {
        const answerId = req.params.answerId;
        const answer = await Answer.findById(answerId).populate('user', 'firstName lastName').populate('task', 'title');
        if (!answer) {
            return res.status(404).json({ message: "Answer not found" });
        }
        res.render('answer-review', { answer: answer });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Failed to get answer for review", error: err });
    }
};

exports.postAnswerReview = async (req, res, next) => {
    try {
        // код для обработки запроса

        res.render("review-answer", { successMessage: "Ответ успешно оценен" });
    } catch (err) {
        console.log(err);
        res.render("review-answer", { errorMessage: "Ошибка при оценке ответа" });
    }
};

exports.deleteAnswer = async (req, res) => {
    try {
        const answerId = req.params.id;
        const userId = req.user._id;

        // Проверяем, принадлежит ли ответ пользователю
        const answer = await Answer.findOne({ _id: answerId, user: userId });
        if (!answer) {
            return res.status(404).json({ message: 'Answer not found or user is not the owner.' });
        }

        // Удаляем ответ
        await Answer.findByIdAndDelete(answerId);

        res.status(200).json({ message: 'Answer deleted successfully.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to delete answer.', error: error });
    }
};







