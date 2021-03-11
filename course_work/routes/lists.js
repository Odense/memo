const express = require('express');
const List = require("../models/list");
const Note = require("../models/note");
const User = require("../models/user");
const additional = require("./additional");

const router = express.Router();

router.get(`/`, additional.checkAuth, function(req, res)
{
    res.render(`lists`, {currentuser: req.user});
});

router.get(`/new`, additional.checkAuth, function (req, res)
{
    let data = {};
    data.userId = req.user.id;
    data.action = '/lists/new';
    res.render(`lists/new`, {data: data, currentuser: req.user});
});

router.post(`/new`, additional.checkAuth, function (req, res)
{
    const userId = req.user.id;
    let list = new List(req.body.title, 'https://redcrescent.kz/wp-content/plugins/ecommerce-product-catalog/img/no-default-thumbnail.png', userId);
    const fileObject = req.files.ava;
    if (fileObject !== undefined)
    {
        additional.uploadToCloudinary(fileObject.data)
        .then(url => 
        {
            list.listAva = url;
            return List.insert(list);
        })
        .then(listId =>
        {
            return Promise.all([listId, User.addList(userId, listId)]);
        })
        .then(([listId]) => res.redirect(`/lists/` + `${listId}`))
        .catch(err => res.render(`500`));
    }
    else
    {
        List.insert(list)
        .then(listId =>
        {
            return Promise.all([listId, User.addList(userId, listId)]);
        })
        .then(([listId]) => res.redirect(`/lists/` + `${listId}`))
        .catch(err => res.render(`500`));
    }
});

router.get(`/update/:id`, additional.checkAuth, function (req, res)
{
    List.getById(req.params.id)
    .then(list =>
    {
        res.render(`lists/new`, {list: list, currentuser: req.user, action: "/lists/update/" + req.params.id});
    })
    .catch (err => res.render(`500`));
});

router.post(`/update/:id`, additional.checkAuth, function (req, res)
{
    List.getById(req.params.id)
    .then(list =>
    {
        list.title = req.body.title;
        const fileObject = req.files.ava;
        if (fileObject !== undefined)
        {
            return Promise.all([list, additional.uploadToCloudinary(fileObject.data)]);
        }
        return Promise.all([list, null]);
    })
    .then(([list, url]) =>
    {
        if(url) list.listAva = url;
        return Promise.all([list, List.update(list)]);
    })
    .then(([list]) => res.redirect(`/lists/` + `${list._id}`))
    .catch(err => res.render(`500`));
});

router.get(`/:id`, additional.checkAuth, function (req, res)
{
    const listId = req.params.id;
    if (listId.length !== 24)
    {
        res.render(`404`);
        return;
    }
    List.getById(listId)
    .then(list =>
    {
        if (list === null)
        {
            res.render(`404`);
        }
        else
        {
            res.render(`list`, {list : list, currentuser: req.user});
        }
    })
    .catch (err => res.render(`500`));
});

router.post(`/:id`, additional.checkAuth, function (req, res)
{
    const listId = req.params.id;
    List.getById(listId)
    .then(list => 
    {
        for(let note of list.notes)
        {
            Note.delete(note._id);
        }
        return list.author._id;
    })
    .then(userId =>
    {
        User.removeList(userId, listId);
    })
    .then(() => List.delete(listId))
    .then(() => res.redirect(`/lists`))
    .catch(err => res.render(`500`));
});

module.exports = router;