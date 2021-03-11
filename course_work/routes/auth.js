const express = require('express');
const User = require("../models/user");
const additional = require('./additional');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

const router = express.Router();

passport.use(new LocalStrategy(
    function (username, password, done)
    {
        let hash = additional.sha512(password).passwordHash;
        User.getByUsername(username)
        .then(user =>
        {
            if (user && user.passwordHash === hash) return done(null, user);
            else return done(null, false);
        });
    })
);

passport.serializeUser(function(user, done)
{
    done(null, user._id);
});

passport.deserializeUser(function(id, done)
{
    User.getById(id)
    .then(user =>
    {
        done(user ? null : 'No user', user);
    });
});

router.post('/login', additional.checkUnauth,
    passport.authenticate('local',
    { 
		successRedirect: '/',
        failureRedirect: '/?error=Incorrect+username+or+password!'
    })
);

router.get(`/register`, additional.checkUnauth, function (req, res)
{
	let error = req.query.error;
    res.render(`register`, {error});
});

router.post(`/register`, additional.checkUnauth, function (req, res)
{
	const username = req.body.username;
    User.getByUsername(username)
    .then(user =>
    {
        if (!user)
        {
            if (req.body.password === req.body.password2)
            {
				const fullname = req.body.fullname;
				const password = req.body.password;
				User.insert(new User(username, password, fullname, "https://pngimage.net/wp-content/uploads/2018/06/logo-user-png-6.png", null))
				.then(() => res.redirect(`/`))
				.catch(err => res.render(`500`));
				return;
            }
            else
            {
                res.redirect('/?error=Passwords+do+no+match');
            }
		}
        else
        {
			res.redirect('/?notunique=Username+already+exists!');
			return;
		}
    });
});

router.get(`/login`, additional.checkUnauth, function (req, res)
{
	let error = req.query.error;
    res.render(`login`, {error: error});
});

router.get(`/logout`, additional.checkAuth, function (req, res)
{
    req.logout();
    res.redirect('/');
});

module.exports = router;