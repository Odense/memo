const express = require('express');
const User = require("../models/user");
const List = require("../models/list");
const Note = require("../models/note");
const additional = require('./additional');
const passport = require('passport');
const BasicStrategy = require('passport-http').BasicStrategy;

const router = express.Router();

passport.use(new BasicStrategy(
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

function auth(req, res, next)
{
    if (!req.user) passport.authenticate('basic', {session: false});
    next();
}

function JsonCheckAuth(req, res, next)
{
    if (!req.user) return res.json(401, 'Not authorized!');
    next();
};

function JsonCheckAdmin(req, res, next)
{
    if (!req.user) res.sendStatus(401).json();
    else if (req.user.role !== 1) res.json(403, 'Access denied!');
    else next();
}

router.get(`/`, function (req, res)
{
    res.json({});
});

router.get(`/users`, 
    auth, 
    JsonCheckAdmin, 
    function (req, res)
    {
        User.getAll()
        .then(users => res.json(users))
        .catch(err => {res.status(404).send(err.toString()).json()});
});

router.get(`/users/:id`,
    auth, 
    JsonCheckAdmin, 
    function (req, res)
    {
        const userId = req.params.id;
        User.getById(userId)
        .then(user =>
        {
            if (user === undefined)
            {
                res.json(404, `User with id ${userId} not found`);
            }
            else
            {
                res.json(user);
            }
        })
        .catch (err => {
            res.json(500, err.toString());
        });
});

router.post(`/register`,
    function (req, res)
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
                    return User.insert(new User(username, password, fullname, "https://pngimage.net/wp-content/uploads/2018/06/logo-user-png-6.png", null));
                }
                else
                {
                    res.json(500, 'Passwords do not match');
                    return;
                }
            }
            else
            {
                res.json(500, 'Username already exists');
                return;
            }
        })
        .then(user => res.json(201, user))
        .catch(err => res.json(500, err.toString()));
});

router.get(`/users/getByUsername/:username`,
    function (req, res)
    {
        const username = req.params.username;
        User.getByUsername(username)
        .then(user => 
        {
            if(!user)
            {
                res.json(null);
            }
            else
            {
                res.json(user.username);
            }
        })
        .catch(err => res.json(500, err.toString()));
});

router.put(`/users/:id`,
    auth, 
    JsonCheckAuth, 
    function (req, res)
    {
        const userId = req.params.id;
        User.getById(userId)
        .then(user =>
        {
            if (parseInt(user.role) === 0) user.role = 1;
            else user.role = 0;
            return User.update(user);
        })
        .then(user => res.json(user))
        .catch(err => res.json(500, err.toString()));
});

router.delete(`/users/:id`,
    auth, 
    JsonCheckAdmin, 
    function (req, res)
    {
        const id = req.params.id;
        User.delete(id)
        .then(() => res.json(204, 'User deleted!'))
        .catch (err => res.status(500).send(err.toString()));
});

router.get(`/me`, 
    auth,
    function (req, res)
    {
        res.json(req.user);
});

router.get(`/notes`,
    auth,
    JsonCheckAuth,
    function (req, res)
    {
        let pageNumber = parseInt(req.query.page);
        let onSearch = req.query.title;
        if (onSearch === undefined)
        {
            onSearch = "";
        }
        if (!pageNumber || pageNumber < 1)
        {
            pageNumber = 1;
        }
        Note.getAll()
        .then(notes => additional.searchByTitle(notes, onSearch))
        .then(searchedNotes => additional.pagination(searchedNotes, pageNumber))
        .then(data =>
        {
            if (data.currPage > data.maxPage)
            {
                res.json(404, "Page not found!");
                return;
            }
            data.title = onSearch;
            res.json(data);
        })
        .catch(err =>
        {
            res.status(404, err.toString());
        });
});

router.get(`/notes/:id`,
    auth,
    JsonCheckAuth,
    function(req, res)
    {
        const noteId = req.params.id;
        Note.getById(noteId)
        .then(note =>
        {
            if (note === undefined)
            {
                res.json(404, `Note with id ${noteId} not found`);
            }
            else
            {
                res.json(note);
            }
        })
        .catch (err => res.json(500, err.toString()));
});

router.post(`/notes`,
    auth,
    JsonCheckAuth,
    function(req, res)
    {
        const fileBuffer = req.files.ava.data;
        additional.uploadToCloudinary(fileBuffer, (err, avaUrl) =>
        {
            const title = req.body.title;
            const priority = +req.body.priority;
            const author = req.body.author;
            const amounofCoAuthors = +req.body.amounofCoAuthors;
            const description = req.body.description;

            let note = new Note(title, priority, amounofCoAuthors, description, avaUrl, author);

            Note.insert(note)
            .then(id => 
            {
                List.addNote(req.body.listId, id);
                return id;
            })
            .then(() => res.status(201).json(note))
            .catch(err => res.json(500, err.toString()));
        });
});

router.put(`/notes/:id`,
    auth,
    JsonCheckAuth,
    function(req, res)
    {
        const noteId = req.body.noteId;
        const title = req.body.title;
        const priority = +req.body.priority;
        const amounofCoAuthors = +req.body.amounofCoAuthors;
        const description = req.body.description;

        if (!req.files.ava)
        {
            const newNote = new Note(title, priority, amounofCoAuthors, description);
            Note.update(noteId, newNote)
            .then(updatedNote => res.status(201).json(updatedNote))
            .catch(err  => res.json(500, err.toString()));

            return;
        }
        else
        {
            additional.uploadToCloudinary(req.files.ava.data, (err, avaUrl) =>
            {
                const newNote = new Note(title, priority, amounofCoAuthors, description, avaUrl);
                Note.update(noteId, newNote)
                .then(updatedNote => res.status(201).json(updatedNote))
                .catch(err => res.json(500, err.toString()));
            });
        }
});

router.delete(`/notes/:id`,
    auth, 
    JsonCheckAuth,
    function(req, res)
    {
        const noteId = req.params.id;
        const listId = req.body.listId;
        Note.delete(noteId)
        .then(() => List.removeNote(listId, noteId))
        .then(() => res.json(204, "Note deleted!"))
        .catch(err => res.json(500, err.toString()));
});

router.get(`/lists`,
    auth,
    JsonCheckAuth,
    function (req, res)
    {
        List.getByAuthor(req.user._id)
        .then(lists => res.json(lists))
        .catch(err => {res.status(404).send(err.toString()).json()});
        // let pageNumber = parseInt(req.query.page);
        // let onSearch = req.query.title;
        // if (onSearch === undefined)
        // {
        //     onSearch = "";
        // }
        // if (!pageNumber || pageNumber < 1)
        // {
        //     pageNumber = 1;
        // }
        // List.getAll()
        // .then(lists => additional.searchByTitle(lists, onSearch))
        // .then(searchedLists => additional.pagination(searchedLists, pageNumber))
        // .then(data =>
        // {
        //     if (data.currPage > data.maxPage)
        //     {
        //         res.json(404, "Page not found!");
        //         return;
        //     }
        //     data.title = onSearch;
        //     res.json(data);
        // })
        // .catch(err =>
        // {
        //     res.json(500, err.toString());
});

router.get(`/lists/:id`,
    auth,
    JsonCheckAuth,
    function(req, res)
    {
        const listId = req.params.id;
        List.getById(listId)
        .then(list =>
        {
            if (list === undefined)
            {
                res.json(404, `List with id ${listId} not found`);
            }
            else
            {
                res.json(list);
            }
        })
        .catch (err => res.staus(500).json(err.toString()));
});

router.post(`/lists`,
    auth,
    JsonCheckAuth,
    function(req, res)
    {
        const fileBuffer = req.files.ava.data;
        additional.uploadToCloudinary(fileBuffer, (err, avaUrl) => 
        {
            const author = req.user.id;
            const title = req.body.title;
            const list = new List(title, avaUrl, author);
            List.insert(list)
            .then(model =>  Promise.all([User.addList(author, model._id), model]))
            .then(result => res.status(201).json(result[1]))
            .catch(err => res.json(500, err.toString()));
            
            
            // List.insert(list)
            // .then((id) =>
            // {
            //     User.addList(author, id)
            //     .then(() => res.status(201).json(list))
            //     .catch(err => res.json(500, err.toString()));
            // })
            // .catch(err => res.json(500, err.toString()));
        });
});

router.delete(`/lists/:id`,
    auth, 
    JsonCheckAuth,
    function(req, res)
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
        .then(() => res.json(204, "List deleted"))
        .catch(err => res.json(500, err.toString()));
});

router.put(`/lists/:id`,
    auth,
    JsonCheckAuth,
    function(req, res)
    {
        const listId = req.body.listId;
        const title = req.body.title;

        if (!req.files.ava)
        {
            const newList = new List(title);
            List.update(listId, newList)
            .then(updatedList => res.status(201).json(updatedList))
            .catch(err  => res.json(500, err.toString()));

            return;
        }
        else
        {
            additional.uploadToCloudinary(req.files.ava.data, (err, avaUrl) =>
            {
                const newList = new List(title, avaUrl);
                List.update(listId, newList)
                .then(updatedList => res.status(201).json(updatedList))
                .catch(err => res.json(500, err.toString()));
            });
        }
    
});

module.exports = router;