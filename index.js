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
        `SELECT * FROM Events;`
    );
    /*await db.run("SELECT * FROM Events", async(err, res)=>{
        if (err) throw err;
        else{
            console.log('success')
            res.send(res)
        }
    });
    console.log('Query ran successfully');*/
    /*const messages = await db.all(`SELECT 
        Messages.id,
        Messages.content,
        Users.username as authorName
    FROM Messages LEFT JOIN Users WHERE Messages.authorId = Users.id`);
    console.log('messages', messages)*/
    console.log(eventList);
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
    const db = await dbPromise;
    const events = await db.all(
        `SELECT
        Events.id,
        Events.title,
        Events.eventDescription,
        Events.zoomLink,
        Events.startDate,
        Events.startTime,
        Events.endDate,
        Events.endTime
        FROM Events;`
    );
    res.render("event", {events});
});

app.post('/register', async (req, res)=>{
    const db = await dbPromise;
    const {
        username,
        email,
        password
    } = req.body;
    const passwordHash = await bcrypt.hash(password, 10);
    try {
        await db.run('INSERT INTO Users (username, email, password) VALUES (?,?,?);',
            username,
            email,
            passwordHash
        )
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

/*app.post('/create_conference', async (req, res) =>{
    //write messages to database
    //messages.push(req.body.message);
    if(!req.user){
        res.status(401);
        return res.send("must be logged in to post messages");
    }
    const db = await dbPromise;
    await db.run('INSERT INTO Messages (content, authorId) VALUES (?, ?);', req.body.message, req.user.id);
    res.redirect('/');
});*/

// Added code for post conference details to DB - Rishab 
app.post('/create_conference', async(req, res) =>{
    //Write event details to db
    const db = await dbPromise;
    const {
        event_title,
        event_description,
        zoom_link,
        start_date,
        start_time,
        end_date,
        end_time
    } = req.body;

    console.log(req.body);
    try{
        await db.run('INSERT or REPLACE INTO Events (id, title, eventDescription, zoomLink, startDate, startTime, endDate, endTime) VALUES (?, ?, ?, ?, ?, ?, ?, ?);', 
        req.user.id, event_title, event_description, zoom_link, start_date, start_time, end_date, end_time);
        console.log('Data inserted successfully');
    }
    catch (e){
        console.log('Data was not inserted successfully', e);
        return res.render('create_conference', {error: e})

    }
    res.redirect('/')
});

function cancel(){
    res.render('create_conference');
}

const setup = async () => {
    const db = await dbPromise;
    await db.migrate();

    app.listen(8080, () =>{
        console.log("listening on http://localhost:8080"); //this line does not matter. just informative.
    });
}

setup();
