import express from 'express';
import { engine } from "express-handlebars";
import bcrypt from 'bcrypt';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

import cookieParser from 'cookie-parser';
import { grantAuthToken, lookUpUserFromAuthToken } from './authorize';
import res from 'express/lib/response';

export const dbPromise = open({
    filename: "data.db",
    driver: sqlite3.Database,
})

const app = express();

app.engine("handlebars", engine());
app.set('view engine', 'handlebars');

app.use(cookieParser());
app.use(express.urlencoded({ extended: false}));
app.use('/static', express.static(__dirname + '/static'));

app.use(async (req, res, next) =>{
    const {authToken} = req.cookies;
    if(!authToken){
        //console.log('request from user not logged in');
        return next();
    }
    try {
        const user = await lookUpUserFromAuthToken(authToken);
        //console.log('request from user', user.username);
        req.user = user;
    } catch (e) {
        next(e);
    }
    next();
})

app.get("/", async (req, res) => {
    //read messages from database
    //console.log('request user', req.user);
    const db = await dbPromise;
    const eventList = await db.all(
        `SELECT * FROM Events ORDER BY startDate, startTime;`
    );
    console.log("eventList");
    res.render("home", { eventList, user: req.user });
});

app.get('/register', (req, res) =>{
    if(req.user){
        return res.redirect('/')
    }
    res.render('register')
})

app.get('/login', (req, res) =>{
    if(req.user){
        return res.redirect('/')
    }
    res.render('login')
})

//logs out the user when they are logged in
app.get('/logout', (req, res) =>{
    res.clearCookie('authToken');
    res.redirect('/');
})

app.get('/create_conference', (req, res)=>{
    res.render("create_conference", { user: req.user });
})

// Retrieves events and posts them on home page - Rishab
app.get("/event", async (req, res) =>{
    console.log("Testing 2 ", eventID);
    const db = await dbPromise;
    const events = await db.get(
        `SELECT 
            title,
            eventDescription,
            zoomLink,
            businessLink,
            startDate,
            startTime,
            endDate,
            endTime
        FROM Events WHERE id = ?;`, eventID.id
    );
    console.log("Testing 3 ", events);
    res.render("event", {events});
});

// Survey for users to register
app.get("/event/registrations", async (req, res) =>{
    res.render("registrations", {user: req.user});
})

// Users can upload abstracts
app.get("/event/abstracts", async (req, res) =>{
    res.render("abstract", {user: req.user});
})

var eventID;

app.post('/', async(req, res)=>{
    const db = await dbPromise;
    console.log(req.body.test)
    try {
        eventID = await db.get(
            `SELECT id
            FROM Events WHERE id = ?`, req.body.test
        );
        console.log("Testing ", eventID);
        res.redirect("/event")
    } catch (e){
        console.log({error: e});
    }
})

app.post('/register', async (req, res)=>{
    const db = await dbPromise;
    const {
        firstName,
        lastName,
        username,
        email,
        password
    } = req.body;
    const passwordHash = await bcrypt.hash(password, 10);
    try {
        if(password == password2){
            await db.run('INSERT INTO Users (firstName, lastName, username, email, password) VALUES (?,?,?,?,?);',
            firstName,
            lastName,
            username,
            email,
            passwordHash
        )}
        const user = await db.get('SELECT id FROM Users WHERE email=?;', email);
        const token = await grantAuthToken(user.id);
        res.cookie('authToken', token);
        res.redirect('/');
    } catch (e) {
        return res.render('register', { error: e})
    }
})

app.post('/login', async (req, res) =>{
    const db = await dbPromise;
    const {
        email,
        password
    } = req.body;
    try {
        const existingUser = await db.get("SELECT * FROM Users WHERE email=?", email);
        if(!existingUser){
            throw 'Incorrect login';
        }
        const passwordMatch = await bcrypt.compare(password, existingUser.password);
        if(!passwordMatch){
            throw 'Incorrect login'
        }
        const token = await grantAuthToken(existingUser.id);
        res.cookie('authToken', token);
        res.redirect('/');
    } catch (e){
        return res.render('login', {error: e});
    }
})

// Added code for post conference details to DB - Rishab 
app.post('/create_conference', async(req, res) =>{
    //Write event details to db
    const db = await dbPromise;
    const {
        event_title,
        event_description,
        zoom_link,
        business_link,
        start_date,
        start_time,
        end_date,
        end_time
    } = req.body;

    console.log(req.body);
    try{
        await db.run('INSERT or REPLACE INTO Events ( title, eventDescription, zoomLink, businessLink, startDate, startTime, endDate, endTime) VALUES ( ?, ?, ?, ?, ?, ?, ?, ?);', 
        event_title, event_description, zoom_link, business_link, start_date, start_time, end_date, end_time);
        console.log('Data inserted successfully');
    }
    catch (e){
        console.log('Data was not inserted successfully', e);
        return res.render('create_conference', {error: e})

    }
    res.redirect('/')
});

app.post("/event/registrations", async (req, res) =>{
    res.redirect('/event')
})

app.get('/profile', async (req, res)=>{
    const db = await dbPromise;
    try{
        const profile = await db.get(
            `SELECT * FROM Users WHERE id = ?`, req.user.id
        )
        console.log(profile);
        res.render('profile', { profile, user: req.user })
    } catch (e){
        console.log({error: e});
        res.redirect('login');
    }
})

app.get('/network',async (req, res)=>{
    const db = await dbPromise;
    const message = await db.all(
        `SELECT
        Messages.id,
        Messages.content,
        Users.username as authorName
        FROM Messages LEFT JOIN Users WHERE Messages.authorId = Users.id`
    );
    res.render("network", {message , user: req.user  });
})

app.post('/message', async (req, res) =>{
    //insert messages into the messages table in database.
    const db = await dbPromise;
    console.log(req.body.message);
    await db.run('INSERT INTO Messages (content, authorId) VALUES (?, ?);', req.body.message, req.user.id);
    res.redirect('/network');
})

const setup = async () => {
    const db = await dbPromise;
    await db.migrate();

    const port = process.env.port || 8080;
    app.listen(port, () =>{
        console.log("listening on http://localhost:8000"); //this line does not matter. just informative.
    });
}

setup();
