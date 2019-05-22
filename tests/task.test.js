const request = require('supertest')
const app = require('../src/app')
const Task = require('../src/models/task')
const {userOne, userTwo, setupDataBase, taskOne} = require('./fixtures/db')

beforeEach(setupDataBase)

const testTaskData = {
    description: 'Test task',
    completed: false
}

test('Should create task for user', async () => {
    const res = await request(app)
        .post('/tasks')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send(testTaskData)
        .expect(201)
    
    const task = await Task.findById(res.body._id)    
    expect(task).not.toBeNull()
    expect(task.completed).toEqual(false)
})

test('Should get 2 userOne tasks', async () => {
    const res = await request(app)
        .get('/tasks')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)

    expect(res).not.toBeNull()
    expect(res.body.length).toEqual(2) 
})

test('Should not delete that not related to userTwo', async () => {
    await request(app)
        .delete(`/tasks/${taskOne._id}`)
        .set('Authorization', `Bearer ${userTwo.tokens[0].token}`)
        .send()
        .expect(404)

    const task = Task.findById(taskOne._id)    
    expect(task).not.toBeNull()
})
