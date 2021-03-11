const mongoose = require('mongoose');

var NoteSchema = new mongoose.Schema(
{
    title: String,
    priority: Number,
    author:
    {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    amountOfCoAuthors: Number,
    createdAt:
    {
        type: Date,
        default: Date.now()
    },
    description: String,
    noteFilesUrl: String,
});

const NoteModel = mongoose.model(`Note`, NoteSchema);

class Note
{
    constructor(title, priority, amountOfCoAuthors, description, noteFilesUrl, author)
    {
        this.title = title;
        this.priority = priority;
        this.amountOfCoAuthors = amountOfCoAuthors;
        this.description = description;
        this.noteFilesUrl = noteFilesUrl;
        this.author = author;
    }
    
    static getAll()
    {
        return NoteModel.find()
        .populate('author');
    }

    static getById(id)
    {
        return NoteModel.findById(id)
        .populate('author');
    }

    static insert(note)
    {
        const model = new NoteModel(note);
        return model.save()
        .then(saved => {return saved.id;});
    }

    static update(note)
    {
        return NoteModel.findOneAndUpdate({_id: note.id}, note, { new: true });
    }

    static delete(id)
    {
        return NoteModel.findOne({ _id: id })
        .then(() =>
        {
            return NoteModel.deleteOne({_id: id});
        });
    }
}

module.exports = Note;