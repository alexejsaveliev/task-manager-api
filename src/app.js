const express = require('express')
const userRouter = require('./routers/user')
const taskRouter = require('./routers/task')
require('./db/mongoose')

const app = express()
const port = process.env.PORT

// app.use((req, res, next) => {
//     res.status(503).send('Server temporary unavailable')
// })

app.use(express.json())
app.use(userRouter)
app.use(taskRouter)

module.exports = app