const mongoose = require('mongoose');

const ListSchema = new mongoose.Schema(
{
    title: {type: String, required: true},
    notes:
    [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Note'
    }],
    createdAt: {type: Date, default: Date.now()},
    listAva: String,
    author:
    {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
});

const ListModel = mongoose.model('List', ListSchema);

class List
{
    constructor(title, listAva, author)
    {
        this.title = title;
        this.listAva = listAva;
        this.author = author;
    }

    static getAll()
    {
        return ListModel.find()
        .populate('notes')
        .populate('author');
    }

    static getByAuthor(author)
    {
        return ListModel.find({author: author})
        .populate('notes')
        .populate('author');
    }

    static getById(id)
    {
        return ListModel.findById(id)
        .populate('notes')
        .populate('author');
    }

    static insert(list)
    {
        const model = new ListModel(list);
        return model.save()
        .then(saved => {return saved.id;});
    }

    static update(list)
    {
        return ListModel.findOneAndUpdate({_id: list.id}, list, { new: true });
    }

    static delete(id)
    {
        return ListModel.findOne({ _id: id })
        .then(() =>
        {
            return ListModel.deleteOne({ _id: id })
        });
    }

    static addNote(id, noteId)
    {
        return ListModel.findOne({ _id: id })
        .then(list =>
        {
            list.notes.push(noteId);
            return ListModel.findOneAndUpdate({ _id: list._id }, list, { new: true });
        });
    }

    static removeNote(id, noteId)
    {
        return ListModel.findOne({ _id: id })
        .then(list =>
        {
            list.notes.splice(list.notes.indexOf(noteId), 1);
            return ListModel.findOneAndUpdate({ _id: list._id }, list, { new: true });
        });
    }
}

module.exports = List;