const crypto = require('crypto');
const cloudinary = require('cloudinary');
const config = require(`../config`);
const notesPerPage = 4;
const serverSalt = config.ServerSalt;

cloudinary.config({
    cloud_name: 'kpi',
    api_key: 773477995948939,
    api_secret: '-VUTcTOUsDPdrp3iKTiGl_cC3VQ'
});

module.exports =
{
    pagination: function(array, currPage)
    {
        let data = {};
        let startIndex = (currPage - 1) * notesPerPage;
        let maxPage = parseInt(array.length / notesPerPage);
        if (array.length % notesPerPage !== 0 || maxPage === 0)
        {
            maxPage += 1;
        }
        data.items = array.slice(startIndex, startIndex + notesPerPage);
        data.currPage = currPage;
        data.maxPage = maxPage;
        data.prevPage = currPage - 1;
        data.nextPage = currPage + 1;

        return data;
    },

    searchByTitle: function(notes, searchedTitle)
    {
        let searchedNote = [];
        for (let note of notes)
        {
            let title = note.title;
            if (title.includes(searchedTitle))
            {
                searchedNote.push(note);
            }
        }
        return searchedNote;
    },

    uploadToCloudinary: function(fileBuffer)
    {
        return new Promise(function(resolve, reject)
        {
            cloudinary.v2.uploader
            .upload_stream({ resource_type: "image" }, function(error, result)
            {
                if (error)
                {
                    reject(error);
                }
                else
                {
                    resolve(result.url);
                }
            })
            .end(fileBuffer);
        });
    },

    sha512: function(password)
    {
        const hash = crypto.createHmac('sha512', serverSalt);
        hash.update(password);
        const value = hash.digest('hex');
        return {
            salt: serverSalt,
            passwordHash: value
        };
    },

    checkAuth: function(req, res, next)
    {
        if (!req.user) return res.render(`401`);
        next();
    },

    checkUnauth: function(req, res, next)
    {
        if (req.user) return res.render(`401`);
        next();
    },
    
    checkAdmin: function(req, res, next)
    {
        if (!req.user) res.render(`401`);
        else if (req.user.role !== 1) res.render(`403`);
        else next();
    }
};