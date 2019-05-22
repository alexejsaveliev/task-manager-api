const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const User = require('../../src/models/user')
const Task = require('../../src/models/task')

const userOneId = new mongoose.Types.ObjectId()
const userOne = {
    _id: userOneId,
    name: 'Max',
    age: 22,
    email: 'max@example.com',
    password: 'pa$$word!23',
    tokens: [
        {
            token: jwt.sign({ _id: userOneId }, process.env.JWT_SECRET)
        }
    ]
}

const userTwoId = new mongoose.Types.ObjectId()
const userTwo = {
    _id: userTwoId,
    name: 'Alex',
    age: 29,
    email: 'alex@example.com',
    password: 'AlexPa$$word!23',
    tokens: [
        {
            token: jwt.sign({ _id: userTwoId }, process.env.JWT_SECRET)
        }
    ]
}

const taskOne = {
    _id: new mongoose.Types.ObjectId(),
    description: 'Test task 1',
    completed: false,
    userId: userOneId
}

const taskTwo = {
    _id: new mongoose.Types.ObjectId(),
    description: 'Test task 2',
    completed: true,
    userId: userOneId
}

const taskThree = {
    _id: new mongoose.Types.ObjectId(),
    description: 'Test task 3',
    completed: true,
    userId: userTwoId
}

const setupDataBase = async () => {
    await User.deleteMany()
    await Task.deleteMany()

    await new User(userOne).save()
    await new User(userTwo).save()

    await new Task(taskOne).save()
    await new Task(taskTwo).save()
    await new Task(taskThree).save()
}

module.exports = {
    userOne,
    userTwo,
    userOneId,
    userTwoId,
    setupDataBase,
    taskOne
}