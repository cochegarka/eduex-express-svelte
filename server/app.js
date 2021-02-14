const mysql = require('mysql2');
const express = require('express');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors');

require('dotenv').config();

const app = express();

/**
 * Пул подключений MySQL.
 */
const pool = mysql.createPool({
    connectionLimit: 5,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASS
});

/**
 * Middlewares.
 */
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(cors());

/**
 * Регулируемые параметры маршрутов.
 */
const params = {
    /**
     * Количество записей на странице списка.
     */
    PAGE_CAPACITY: 10
};

/**
 * Маршрут GET /list/:page
 * 
 * Список объектов на странице page списка объектов.
 * 
 * Отправляет JSON по схеме {count: *, list: [{id:, pay: {start:, end:}, title:, age:, seniority:, short_name:, phone_number:, description:}]}
 */
app.get('/list/:page', (req, res) => {
    const page = req.params.page;
    const start = (page - 1) * params.PAGE_CAPACITY;

    pool.query("SELECT COUNT(*) from vacancy", (err, data) => {
        if (err) return console.log(err);
        const count = data[0]['COUNT(*)'];
        pool.query("SELECT * from vacancy, teacher WHERE vacancy.teacher_teacher_id=teacher.teacher_id LIMIT ?, ?", [start, params.PAGE_CAPACITY], (err, data) => {
            if (err) return console.log(err);
            const year = new Date().getFullYear();
            const vacancies = data.map(function (v) {
                return {
                    id: v.vacancy_id,
                    pay: { start: v.fork_start, end: v.fork_end },
                    title: v.title,
                    age: year - new Date(v.date_of_birth).getFullYear(),
                    seniority: year - v.career_start,
                    short_name: v.short_name,
                    phone_number: v.phone_number,
                    description: v.description
                }
            });
            res.json({ count: count, list: vacancies });
        });
    });
});

/**
 * Маршрут GET /read/:id
 * 
 * Объект под номером id.
 */
app.get('/read/:id', (req, res) => {
    const id = req.params.id;

    pool.query("SELECT * from vacancy, teacher WHERE vacancy_id=? AND vacancy.teacher_teacher_id=teacher.teacher_id", [id], (err, data) => {
        if (err) return console.log(err);
        const vacancy = data[0];
        pool.query("SELECT s.speciality_id, s.name from speciality AS s, teacher_has_speciality AS ths WHERE ths.teacher_teacher_id=? AND s.speciality_id = ths.speciality_speciality_id", [vacancy.teacher_id], (err, data) => {
            if (err) return console.log(err);
            const specialities = data.map(v => [v.speciality_id, v.name]);
            pool.query("SELECT s.speciality_id, s.name from speciality AS s", (err, data) => {
                if (err) return console.log(err);
                const allSpecialities = data.map(v => [v.speciality_id, v.name]);
                const date = new Date(vacancy.date_of_birth);
                res.json({
                    title: vacancy.title,
                    pay: { start: vacancy.fork_start, end: vacancy.fork_end },
                    seniority: new Date().getFullYear() - vacancy.career_start,
                    career_start: vacancy.career_start,
                    description: vacancy.description,
                    phone_number: vacancy.phone_number,
                    email: vacancy.email,
                    telegram: vacancy.telegram,
                    full_name: vacancy.full_name,
                    short_name: vacancy.short_name,
                    age: new Date().getFullYear() - date.getFullYear(),
                    date_of_birth: `${date.getFullYear()}-${date.getMonth()}-${date.getDay()}`,
                    about: vacancy.about,
                    specialities: specialities,
                    all_specialities: allSpecialities,
                    teacher_id: vacancy.teacher_id
                });
            });
        });
    });
});

/**
 * Маршрут GET /specialities
 * 
 * Возвращает список специальностей в виде пар "индекс-имя", доступный по полю all_specialities.
 */
app.get('/specialities', (req, res) => {
    pool.query("SELECT s.speciality_id, s.name from speciality AS s", (err, data) => {
        if (err) return console.log(err);
        const allSpecialities = data.map(v => [v.speciality_id, v.name]);
        res.json({all_specialities: allSpecialities});
    });
});

/**
 * Маршрут DELETE /delete/:id
 * 
 * Удаляет объект с индексом id из списка вакансий.
 */
app.delete('/delete/:id', (req, res) => {
    const id = req.params.id;

    pool.query("DELETE FROM vacancy WHERE vacancy_id=?", [id], (err, data) => {
        if (err) return console.log(err);
        res.status(200).send('Success');
    })
});

/**
 * Маршрут POST /create
 * 
 * Создает вакансию и учителя.
 * 
 * Данные передаются в теле запроса в формате JSON (см. SPA).
 */
app.post('/create', (req, res) => {
    const data = req.body;
    const teacherTuple = [data.full_name, data.short_name, data.date_of_birth, data.about, data.career_start, data.phone_number, data.email, data.telegram];
    const specialityId = data.speciality_id;

    console.log(data);

    pool.query("INSERT INTO teacher VALUES (DEFAULT, ?, ?, ?, ?, ?, ?, ?, ?)", teacherTuple, (err, rows, _) => {
        if (err) return console.log(err);
        const teacherId = rows.insertId;
        const vacancyTuple = [data.pay.start === '' ? null : data.pay.start, data.pay.end === '' ? null : data.pay.end, data.title, data.description, specialityId, teacherId];
        pool.query("INSERT INTO vacancy VALUES (DEFAULT, ?, ?, ?, ?, ?, ?)", vacancyTuple, (err, rows, _) => {
            const vacancyId = rows.insertId;
            if (err) return console.log(err);
            pool.query("INSERT INTO teacher_has_speciality VALUES (?, ?)", [teacherId, specialityId], (err, _) => {
                if (err) return console.log(err);
                res.json({ id: vacancyId });
            });
        });
    });
});

/**
 * Маршрут PUT /update/:id
 * 
 * Обновляет вакансию с индексом id
 * 
 * Данные передаются в теле запроса в формате JSON.
 */
app.put('/update/:id', (req, res) => {
    const vacancyId = req.params.id;
    const data = req.body;
    const teacherTuple = [data.full_name, data.short_name, data.date_of_birth, data.about, data.career_start, data.phone_number, data.email, data.telegram, data.teacher_id];

    console.log(data);

    pool.query("UPDATE teacher SET full_name=?, short_name=?, date_of_birth=?, about=?, career_start=?, phone_number=?, email=?, telegram=? WHERE teacher_id=?", teacherTuple, (err, _) => {
        if (err) return console.log(err);
        const vacancyTuple = [data.pay.start === '' ? null : data.pay.start, data.pay.end === '' ? null : data.pay.end, data.title, data.description, data.speciality_id, vacancyId];
        pool.query("UPDATE vacancy SET fork_start=?, fork_end=?, title=?, description=?, speciality_speciality_id=? WHERE vacancy_id=?", vacancyTuple, (err, _) => {
            if (err) return console.log(err);
            pool.query("UPDATE teacher_has_speciality SET speciality_speciality_id=? WHERE teacher_teacher_id=?", [data.speciality_id, data.teacher_id], (err, _) => {
                if (err) return console.log(err);
                res.json({ id: vacancyId });
            });
        });
    });
});

module.exports = app;
