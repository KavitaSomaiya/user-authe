
const express = require('express')
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const passport = require('passport')
const cors = require('cors')

const users = require('./app/routes/user.routes.js')

const app = express()

app.use(cors())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

const db = require('./config/keys')

mongoose.connect(
    db.mongoURL,
    { useNewUrlParser: true }
).then(() => console.log("mongoDB successfully connected."))
 .catch(err => console.log(err))

app.get('/', (req, res) => {
    console.log(req)
    res.json({"message": "Welcome to the User authentication application."})
})

require('./app/routes/user.routes.js')(app)

// Passport middleware
app.use(passport.initialize())
// Passport config
require("./config/passport")(passport)

// Routes
// app.use("/api/users", users)

const port = process.env.PORT || 777

app.listen(port, () => console.log(`Server up & connected at ${port}`))