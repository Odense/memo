const express = require('express');
const User = require('../models/user');
const Note = require("../models/note");
const List = require("../models/list");
const additional = require("./additional");

const router = express.Router();

router.get(`/`, additional.checkAdmin, function(req, res)
{
    User.getAll()
    .then(users => res.render(`users`, {users: users, currentuser: req.user}))
    .catch(err => res.status(500).send(err.toString()));
});

router.get(`/me`, additional.checkAuth, function(req, res)
{
    res.render(`user`, {user: req.user, currentuser: req.user});
});

router.get(`/:id`, additional.checkAdmin,  function(req, res)
{
    const userId = req.params.id;
    if (userId.length !== 24)
    {
        res.render(`404`);
        return;
    }
    User.getById(userId)
    .then(user =>
    {
        if (user === null)
        {
            res.render(`404`);
        }
        else
        {
            res.render(`user`, {user:user, currentuser: req.user});
        }
    })
    .catch (err => res.status(500).send(err.toString()));
});

router.post(`/`, additional.checkAdmin, function(req, res)
{
    const userId = req.body.userId;
    const oldRole = req.body.oldRole;
    User.getById(userId)
    .then(user =>
    {
        if (parseInt(oldRole) === 0) user.role = 1;
        return User.update(user);
    })
    .then(user => res.redirect(`/users/${user.id}`))
    .catch(err => res.status(500).send(err.toString()));
});

router.post(`/:id`, additional.checkAdmin, function(req, res)
{
    const id = req.body.userId;
    User.getById(id)
    .then(user =>
    {
        for (let list of user.lists)
        {
            for (let note of list.notes)
            {
                Note.delete(note._id);
            }
            List.delete(list._id);
        }
    })
    .catch (err => res.status(500).send(err.toString()));
    User.delete(id)
    .then(() => res.redirect(`/users`))
    .catch (err => res.status(500).send(err.toString()));
});

router.get(`/update/:id`, additional.checkAuth, function (req, res)
{
    User.getById(req.user._id)
    .then(user =>
    {
        res.render(`useredit`, {currentuser: req.user, user: user, action: "/users/update/" + req.user._id});
    })
    .catch (err => res.render(`500`));
});

router.post(`/update/:id`, additional.checkAuth, function (req, res)
{
    User.getById(req.user._id)
    .then(user =>
    {
        user.fullname = req.body.fullname;
        user.userBio = req.body.userBio;

        const fileObject = req.files.ava;
        if(fileObject !== undefined)
        {
            return Promise.all([user, additional.uploadToCloudinary(fileObject.data)]);
        }
        return Promise.all([user, null]);
    })
    .then(([user, url]) =>
    {
        if(url) user.avaUrl = url;
        return Promise.all([user, User.update(user)]);
    })
    .then(([user]) => res.redirect(`/users/` + `${user._id}`))
    .catch(err => res.render(`500`));
});

module.exports = router;