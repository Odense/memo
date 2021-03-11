const express = require('express');
const Note = require("../models/note");
const List = require("../models/list");
const additional = require("./additional");

const router = express.Router();

/*router.get(`/`, additional.checkAuth, function (req, res)
{
    const pageNumberStr = req.query.page;
    const pageNumber = parseInt(pageNumberStr);
    let onSearch = req.query.search;
    if (onSearch === undefined)
    {
        onSearch = "";
    }
    if (!pageNumber)
    {
        res.redirect(`/notes?page=1&search=` + `${onSearch}`);
        return;
    }
    else
    {
        Note.getAll()
        .then(items => additional.searchByTitle(items, onSearch))
        .then(searchedNote => additional.pagination(searchedNote, pageNumber))
        .then(data =>
        {
            if (data.currPage < 1 || data.currPage > data.maxPage) 
            {
                res.redirect(`/notes?page=1`);
                return;
            }
            data.title = onSearch;
            res.render(`notes`, {data: data, currentuser: req.user});
        })
        .catch(err =>
        {
            res.setHeader('Content-Type', 'text/plain');
            res.status(404).send(err.toString());
        });
    }
});*/

router.get(`/new`, additional.checkAuth, function (req, res)
{
    res.render(`notes/new`, {listId: req.query.listId, actions: `/notes/new`, currentuser: req.user});
});

router.get(`/update/:id`, additional.checkAuth, function (req, res)
{
    Note.getById(req.params.id)
    .then(note =>
    {
        res.render(`notes/new`, {note: note, currentuser: req.user, action: "/notes/update/" + req.params.id});
    })
    .catch (err => res.render(`500`));
    /*let data = {};
    data.listId = req.query.listId;
    data.author = req.user.id;
    data.action = `/notes/update`;
    data.noteId = req.query.noteId;
    Note.getById(data.noteId)
    .then(note => 
    {
        data.note = note;
        res.render(`notes/new`, {data: data, currentuser: req.user});
    })
    .catch (err => res.status(500).send(err.toString()));*/
});

router.post(`/update/:id`, additional.checkAuth, function (req, res)
{
    Note.getById(req.params.id)
    .then(note =>
    {
        note.title = req.body.title;
        note.priority = +req.body.priority;
        note.amounofCoAuthors = +req.body.amounofCoAuthors;
        note.description = req.body.description;
        const fileObject = req.files.ava;

        if (fileObject !== undefined)
        {
            return Promise.all([note, additional.uploadToCloudinary(fileObject.data)]);
        }
        return Promise.all([note, null]);
    })
    .then(([note, url]) =>
    {
        if(url) note.noteFilesUrl = url;
        return Promise.all([note, Note.update(note)]);
    })
    .then(([note]) => res.redirect(`/notes/` + `${note._id}`))
    .catch(err => res.render(`500`));
    /*const noteId = req.params.id;
    const title = req.body.title;
    const priority = +req.body.priority;
    const amounofCoAuthors = +req.body.amounofCoAuthors;
    const description = req.body.description;

    if (!req.files.ava)
    {
        const newNote = new Note(title, priority, amounofCoAuthors, description);
        Note.update(noteId, newNote)
        .then(() => res.redirect(`/notes/` + `${noteId}`))
        .catch(err  => res.status(500).send(err.toString()));

        return;
    }
    else
    {
        additional.uploadToCloudinary(req.files.ava.data, (err, avaUrl) =>
        {
            const newNote = new Note(title, priority, amounofCoAuthors, description, avaUrl);
            Note.update(noteId, newNote).then(() =>
            res.redirect(`/notes/` + `${noteId}`))
            .catch(err => res.status(500).send(err.toString()));
        });
    }*/
});

router.post(`/new`, additional.checkAuth, function (req, res)
{
    const userId = req.user.id;
    const title = req.body.title;
    const priority = +req.body.priority;
    const amounofCoAuthors = +req.body.amounofCoAuthors;
    const description = req.body.description;
    const fileObject = req.files.ava;

    let note = new Note(title, priority, amounofCoAuthors, description, 'https://redcrescent.kz/wp-content/plugins/ecommerce-product-catalog/img/no-default-thumbnail.png', userId);

    if(fileObject !== undefined) 
    {
        additional.uploadToCloudinary(fileObject.data)
        .then(url => 
        {
            note.noteFilesUrl = url;
            return Note.insert(note);
        })
        .then(noteId =>
        {
            return Promise.all([noteId, List.addNote(req.body.listId, noteId)]);
        })
        .then(([noteId]) => res.redirect(`/notes/` + `${noteId}`))
        .catch(err => res.render(`500`));
    }
    else
    {
        Note.insert(note)
        .then(noteId =>
        {
            return Promise.all([noteId, List.addNote(req.body.listId, noteId)]);
        })
        .then(([noteId]) => res.redirect(`/notes/` + `${noteId}`))
        .catch(err => res.render(`500`));
    }
    /*if (req.files.ava === undefined)
    {
        const author = req.body.author;
        const title = req.body.title;
        const priority = +req.body.priority;
        const amounofCoAuthors = +req.body.amounofCoAuthors;
        const description = req.body.description;

        let note = new Note(title, priority, amounofCoAuthors, description, 'https://redcrescent.kz/wp-content/plugins/ecommerce-product-catalog/img/no-default-thumbnail.png', author);

        Note.insert(note)
        .then(id => 
        {
            List.addNote(req.body.listId, id);
            return id;
        })
        .then(id => res.redirect(`/notes/` + `${id}`))
        .catch(err => res.status(500).send(err.toString()));
    }
    else
    {
        const fileBuffer = req.files.ava.data;

        additional.uploadToCloudinary(fileBuffer, (err, avaUrl) =>
        {
            const author = req.body.author;
            const title = req.body.title;
            const priority = +req.body.priority;
            const amounofCoAuthors = +req.body.amounofCoAuthors;
            const description = req.body.description;

            let note = new Note(title, priority, amounofCoAuthors, description, avaUrl, author);

            Note.insert(note)
            .then(id => 
            {
                List.addNote(req.body.listId, id);
                return id;
            })
            .then(id => res.redirect(`/notes/` + `${id}`))
            .catch(err => res.status(500).send(err.toString()));
        });
    }*/
});

router.post(`/:id`, additional.checkAuth, function (req, res)
{
    const noteId = req.params.id;
    const listId = req.body.listId;
    Note.delete(noteId)
    .then(() => List.removeNote(listId, noteId))
    .then(() => res.redirect(`/lists/${listId}`))
    .catch(err => res.status(500).send(err.toString()));
});

router.get(`/:id`, additional.checkAuth, function (req, res)
{
    if (req.params.id.length !== 24)
    {
        res.render(`404`);
        return;
    }
    let data = {};
    let id = req.params.id;
    Note.getById(id)
    .then(note =>
    {
        if (note === null)
        {
            res.render(`404`);
        }
        else
        {
            res.render(`note`, {note: note, listId: req.query.listId, currentuser: req.user});
        }
    })
    .catch (err => res.status(500).send(err.toString()));
});

module.exports = router;