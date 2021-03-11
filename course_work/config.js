module.exports = 
{
    ServerPort: process.env["PORT"] || 3002,
    DataBaseUrl: 'mongodb+srv://ivan_ilinskyi:Ilyinsky02@cluster0.rsd4l.mongodb.net/myFirstDatabase?retryWrites=true&w=majority' || 'mongodb+srv://ivan_ilinskyi:Ilyinsky02@cluster0.rsd4l.mongodb.net/myFirstDatabase?retryWrites=true&w=majority',
    SessionSecret: 'secret_here',
    ServerSalt: 'S$%KLAiMM+_'
};