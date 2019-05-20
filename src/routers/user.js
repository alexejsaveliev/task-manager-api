const express = require('express')
const multer = require('multer')
const sharp = require('sharp');
const User = require('../models/user')
const { sendWelcomeEmail, sendCancelEmail } = require('../emails/account')
const router = express.Router()
const auth = require('../middleware/auth')


const avatarUpload = multer({
    limits:{
        fileSize: 1000000
    },
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
            return cb(new Error('Please upload picture in supported formats jpg,jpeg,png'))
        }

        cb(undefined, true)
    }
})

router.post('/users', async (req, res) => {
    const user = new User(req.body)

    try {
        await user.save()
        const token = await user.generateAuthToken()
        sendWelcomeEmail(user.email, user.name)
        res.status(201).send({user, token})
    } catch (e) {
        res.status(400).send(e.message)
    }
    
})

router.post('/users/login', async (req,res) => {
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password)

        const token = await user.generateAuthToken();
        res.send({user, token})
    } catch (e) {
        res.status(400).send()
    }
})

router.get('/users/me', auth, async (req, res) => {
    res.send(req.user)  
})

router.post('/users/me/avatar', auth, avatarUpload.single('upload'), async (req, res) => {
    const buffer = await sharp(req.file.buffer).resize(250, 250).png().toBuffer()
    req.user.avatar = buffer
    await req.user.save()
    
    res.send()
},(error, req, res, next) => {
    res.status(400).send({error: error.message})
})

router.delete('/users/me/avatar', auth, async (req, res) => {
    try {
        req.user.avatar = undefined
        await req.user.save()

        res.send()
    } catch (e) {
        res.status(500).send()
    }
    
})

router.get('/users/:id/avatar', async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
        if ( !user || !user.avatar ) {
            throw new Error()
        }

        res.set('Content-Type', 'image/png')
        res.send(user.avatar)
    } catch (e) {
        res.status(404).send(e.message)
    }
})

router.post('/users/logout', auth, async (req, res) => {
    console.log(req.token);
    try {
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token !== req.token
        })

        await req.user.save()

        res.send()
    } catch (e) {
        res.status(500).send()
    }
})

router.post('/users/logoutAll', auth, async (req, res) => {
    try {
        req.user.tokens = []
        await req.user.save()

        res.send()
    } catch (e) {
        res.status(500).send()
    }
})

router.patch('/users/me', auth, async (req, res) => {

    const updates = Object.keys(req.body)
    const allowedUpdates = ['name','age','password','email']
    const isAllowedUpdate = updates.every((update) => allowedUpdates.includes(update))

    if (!isAllowedUpdate) {
        return res.status(400).send({error: 'Invalid updates!'})
    }

    try {

        const user = req.user
        updates.forEach((update) => user[update] = req.body[update])

        await user.save()

        if (!user) {
            res.status(404).send()
        } else {
            res.send(user)
        }
    } catch (e) {
        res.status(400).send()
    }
})

router.delete('/users/me', auth, async (req, res) => {
    
    try {
        await req.user.remove()
        sendCancelEmail(req.user.email, req.user.name)
        res.send(req.user)
    } catch (e) {
        res.status(500).send()
    }

})

module.exports = router