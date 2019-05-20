const express = require('express')
const Task = require('../models/task')
const auth = require('../middleware/auth')

const router = express.Router()

router.post('/tasks', auth, async (req, res) => {
    const task = new Task({
        ...req.body,
        userId: req.user._id
    })

    try {
        await task.save()
        res.status(201).send(task)
    } catch (e) {
        res.status(400).send(err)
    }

})

router.get('/tasks', auth, async (req, res) => {
    const match = {}
    const sort = {}

    if (req.query.completed) {
        match.completed = req.query.completed.toLowerCase() === 'true'
    }

    if (req.query.sortBy) {
        const sortArr = req.query.sortBy.split(':')
        sort[sortArr[0]] = sortArr[1].toLowerCase() === 'desc' ? -1 : 1
    }
    
    try {
        // const tasks = await Task.find({})
        await req.user.populate({
            path: 'tasks',
            match,
            options: {
                limit: parseInt(req.query.limit),
                skip: parseInt(req.query.skip),
                sort
            }
        }).execPopulate()
        res.send(req.user.tasks)
    } catch (e) {
        res.status(500).send()
    }
})

router.get('/tasks/:id', auth, async (req, res) => {
    const _id = req.params.id

    try {
        const task = await Task.findOne({ _id, userId: req.user._id })
        if (!task) {
            return res.status(404).send()
        }

        res.send(task)
    } catch (e) {
        res.status(500).send()
    }
})

router.patch('/tasks/:id', auth, async (req,res) => {

    //verify updates
    const updates = Object.keys(req.body)
    const allowedUpdates = ['description', 'completed']
    const isAllowedUpdate = updates.every((update) => allowedUpdates.includes(update))

    if (!isAllowedUpdate) {
        return res.status(400).send({error: 'Invalid updates!'})
    }

    try {
        // const task = await Task.findByIdAndUpdate(req.params.id, req.body, {new: true, runValidators: true})
        
        const task = await Task.findOne({ _id: req.params.id, userId: req.user._id })

        if (!task) {
            return res.status(404).send()
        }

        updates.forEach((update) => task[update] = req.body[update])
        await task.save()
        res.send(task)
    } catch (e) {
        res.status(400).send(e)
    }
})

router.delete('/tasks/:id', auth, async (req,res) => {

    try {
        const task = await Task.findOneAndDelete({ _id: req.params.id, userId: req.user._id })
        if (!task) {
            return res.status(404).send({error: 'Task not found'})
        }

        res.send(task)
    } catch (e) {
        res.status(500).send(e)
    }

})

module.exports = router