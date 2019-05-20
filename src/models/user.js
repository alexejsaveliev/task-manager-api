const validator = require('validator')
const bcrypt = require('bcryptjs')
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const Task = require('./task')

const userSchema = new mongoose.Schema({
    name: {
        type: 'String',
        required: true,
        trim: true
    },
    age: {
        type: 'Number',
        default: 0,
        validate(value) {
            if (value < 0) {
                throw new Error('Age should be a positive number')
            }
        }
    },
    email: {
        type: 'String',
        unique: true,
        required: true,
        trim: true,
        lowercase: true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error('Email is invalid')
            }
        }
    },
    password: {
        type: 'String',
        required: true,
        minlength: 7,
        trim: true,
        validate(value) {
            if (value.toLowerCase().includes('password')) {
                throw new Error('Wrong password. Try another.')
            }
        }
    },
    avatar: {
        type: Buffer
    },
    tokens: [{
        token: {type: String,
        required: true}
    }]
}, {
    timestamps: true
})

userSchema.virtual('tasks', {
    ref: 'Task',
    localField: '_id',
    foreignField: 'userId'
})

userSchema.statics.findByCredentials = async (email, paswd) => {
    const user = await User.findOne({ email })

    if (!user) {
        throw new Error('Unable to login')
    }

    const isMatch = await bcrypt.compare(paswd, user.password)
    if (!isMatch) {
        throw new Error('Unable to login')
    }

    return user
}

userSchema.methods.toJSON = function() {
    const user = this
    const userObject = user.toObject()

    delete userObject.tokens
    delete userObject.password
    delete userObject.avatar

    return userObject
}

userSchema.methods.generateAuthToken = async function() {
    const user = this
    const token = jwt.sign({_id: user._id.toString()}, process.env.JWT_SECRET)

    // user.tokens = user.tokens.concat({ token }) 
    user.tokens.push({ token })
    await user.save()

    return token
}

userSchema.pre('save', async function (next) {

    const user = this
     if (user.isModified('password')) {
         user.password = await bcrypt.hash(user.password, 8)
     }

    next()
})

//Delete users task when user is removed
userSchema.pre('remove', async function(next) {
    const user = this
    await Task.deleteMany({ userId: user._id })
    next()
})

const User = mongoose.model('User', userSchema)



module.exports = User
