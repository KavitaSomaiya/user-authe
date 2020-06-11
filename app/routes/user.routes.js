
module.exports = (app) => {
    const users = require('../controllers/user.controllers')
    app.post('/register', users.create)
    app.get('/users', users.findAll)
    app.post('/users/login', users.findOne)
    app.get('/users/:userId', users.findByUserId)
    app.put('/users/:userId', users.update)
    app.delete('/users/:userId', users.delete)
}