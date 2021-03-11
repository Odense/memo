const mongoose = require(`mongoose`);
const additional = require(`../routes/additional`);

const UserSchema = new mongoose.Schema(
{
    username:
    {
        type: String, required: true
    },
    passwordHash:
    {
        type: String, required: true
    },
    role: 
    {
        type: Number, default: 0
    },
    fullname: {type: String},
    registeredAt: {type: Date, default: Date.now()},
    avaUrl: {type: String},
    userBio: String,
    isDisabled:
    {
        type: Boolean, default: false
    },
    lists:
    [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'List'
    }],
});

const UserModel = mongoose.model('User', UserSchema);

class User 
{
    constructor(username, password, fullname, avaUrl, userBio, lists)
    {
        this.username = username;
        this.passwordHash = additional.sha512(password).passwordHash;
        this.fullname = fullname;
        this.avaUrl = avaUrl;
        this.userBio = userBio;
        this.lists = lists;
    }

    static getAll()
    {
        return UserModel.find()
        .populate('lists');
    }

    static getById(id)
    {
        return UserModel.findById(id)
        .populate('lists');
    }

    static getByUsername(userName)
    {
        return UserModel.findOne({username: userName});
    }

    /*static getByUsernameAndPasswordHash(userName, passwordhash)
    {
        return UserModel.findOne({username: userName, passwordHash: passwordhash})
        .populate('lists');
    }

    static isUniqueUsername(enteredUsername) 
    {
        return UserModel.findOne({username: enteredUsername})
        .then(user =>
        {
            if (user)
            {
                return false;
            }
            else return true;
        });
    }*/

    static insert(user)
    {
        const model = new UserModel(user);
        return model.save()
        .then(saved => {return saved.id;});
    }

    static delete(id)
    {
        return UserModel.findOne({ _id: id })
        .then(() =>
        {
            return UserModel.deleteOne({ _id: id })
        });
    }

    static addList(id, listId)
    {
        return UserModel.findOne({ _id: id })
        .then(user =>
        {
            user.lists.push(listId);
            return UserModel.findOneAndUpdate({ _id: user._id }, user, { new: true });
        });
    }

    static update(user)
    {
        return UserModel.findOneAndUpdate({_id: user.id}, user, { new: true });
    }

    static removeList(id, listId)
    {
        return UserModel.findOne({ _id: id })
        .then(user =>
        {
            user.lists.splice(user.lists.indexOf(listId), 1);
            return UserModel.findOneAndUpdate({ _id: user._id }, user, { new: true });
        });
    }
}

module.exports = User;