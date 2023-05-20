const express = require('express');
const router = express.Router();
const Team = require('../models/team');






// Получение команды по ID
router.get('/team/:id', async (req, res) => {
    try {
        const team = await Team.findById(req.params.id);
        if (!team) {
            return res.status(404).json({ msg: 'Team not found' });
        }
        res.json(team);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

// Обновление команды по ID
router.put('/team/add/:id', async (req, res) => {
    try {
        const team = await Team.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!team) {
            return res.status(404).json({ msg: 'Team not found' });
        }
        res.json(team);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

// Удаление команды по ID
router.delete('/team/delete/:id', async (req, res) => {
    try {
        const team = await Team.findByIdAndDelete(req.params.id);
        if (!team) {
            return res.status(404).json({ msg: 'Team not found' });
        }
        res.json({ msg: 'Team deleted' });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});
exports.createTeam = function(req, res, next) {
    // получаем данные из формы
    const name = req.body.name;
    const description = req.body.description;

    // создаем новую команду в базе данных
    const team = new Team({
        name: name,
        description: description,
        members: [],
        projects: []
    });

    team.save(function(err) {
        if (err) {
            return next(err);
        }
        // перенаправляем на страницу списка команд
        res.redirect('/profile');
    });
};



module.exports = router;
