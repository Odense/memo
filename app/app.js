const express = require(`express`);
const path = require(`path`);
const mustacheExp = require(`mustache-express`);
const bodyParser = require('body-parser');
const fileUpload = require('express-fileupload');
const mongoose = require(`mongoose`);
const config = require(`./config`);
const busBoyBodyParser = require(`busboy-body-parser`);
const passport = require('passport');
const cookieParser = require(`cookie-parser`);
const session = require('express-session');

const app = express();

const viewsDir = path.join(__dirname, 'views');

app.engine('mst', mustacheExp(path.join(viewsDir, 'partials')));

app.set(`views`, path.join(__dirname, `views`));

app.set('view engine', 'mst');

app.use(fileUpload());

app.use(bodyParser.urlencoded(
{
    extended: false
}));

const port = config.ServerPort;

const dataBaseUrl = config.DataBaseUrl;
const connectOptions = {useNewUrlParser: true};

mongoose.connect(dataBaseUrl, connectOptions)
.then(() => console.log(`Database conected: ${dataBaseUrl}`))
.then(() => app.listen(port, onListen))
.catch(err => console.log(`Error: ${err}`));

app.use(bodyParser.json());

app.use(express.static(path.join(__dirname, 'data/fs')));

app.use(express.static('public'));

app.use(busBoyBodyParser({}));
app.use(cookieParser());

app.use(session({
    secret: config.SessionSecret,
    resave: false,
    saveUninitialized: true
}));

app.use(passport.initialize());
app.use(passport.session());

function onListen()
{
    console.log(`Server started on port: ${port}`);
}

app.use("/auth", require("./routes/auth"));
app.use("/notes", require("./routes/notes"));
app.use("/lists", require("./routes/lists"));
app.use('/users', require("./routes/users"));
app.use('/developer/v1', require("./routes/developer"));
app.use('/api/v1', require("./routes/api"));

app.get(`/`, function(req, res)
{
    res.render(`index`, {currentuser: req.user, error: req.query.error, notunique: req.query.notunique});
});

app.get(`/about`, function(req, res)
{
    res.render(`about`, {currentuser: req.user});
});

app.get(`*`, function(req, res)
{
    res.render(`404`);
});