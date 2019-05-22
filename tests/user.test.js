const request = require('supertest')
const app = require('../src/app')
const User = require('../src/models/user')
const {userOne, userOneId, setupDataBase} = require('./fixtures/db')

beforeEach(setupDataBase)

test('Should signup new user', async () => {
    const response = await request(app).post('/users').send({
        name: 'Alex',
        email: 'ljjvarfqg@royalhost.info',
        password: 'pa$$word!23'
    }).expect(201)

    // Assert that the database was changed correctly
    const user = await User.findById(response.body.user._id)
    expect(user).not.toBeNull()

    // Assertions about the response
    expect(response.body).toMatchObject({
        user: {
            name: 'Alex',
            email: 'ljjvarfqg@royalhost.info'
        },
        token: user.tokens[0].token
    })
    expect(user.password).not.toBe('MyPass777!')
})

test('Should login existing user', async () => {
    const response = await request(app).post('/users/login').send({
        email: userOne.email,
        password: userOne.password
    }).expect(200)

    const user = await User.findById(userOneId)
    expect(user.tokens[1].token).toBe(response.body.token)
})

test('Should not login non-existent user', async () => {
    await request(app).post('/users/login').send({
        email: 'nonexistent@expl.com',
        password: 'dsfvadbjb12jh34'
    }).expect(400)
})

test('Should get profile for user', async () => {
    await request(app)
        .get('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)
})

test('Should not get profile for non authorized user', async () => {
    await request(app)
        .get('/users/me')
        .send()
        .expect(401)
})

test('Shouldn\'t delete profile for non authorized user', async () => {
    await request(app)
        .delete('/users/me')
        .send()
        .expect(401)
})

test('Should delete profile for authorized user', async () => {
    await request(app)
        .delete('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)

    const user = await User.findById(userOneId)
    expect(user).toBeNull()    
})
    
test('Should upload avatar img', async () => {
    await request(app)
        .post('/users/me/avatar')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .attach('upload', 'tests/fixtures/profile-pic.jpg')
        .expect(200)

    const user = await User.findById(userOneId)
    expect(user.avatar).toEqual(expect.any(Buffer))
})

test('Should update valid user fields', async () => {
    const res = await request(app)
        .patch('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({name: 'Alex', age: 29})
        .expect(200)
    
    const user = await User.findById(userOneId)    
    expect(user.name).toBe('Alex')
})

test('Should not update unvalid user fields', async () => {
    await request(app)
        .patch('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({login: '1444', score: 34})
        .expect(400)
})

test("Should not signup user with existing email", async () => {
    await request(app)
      .post("/users")
      .send(({ name, email, password } = userOne))
      .expect(400);
  });
