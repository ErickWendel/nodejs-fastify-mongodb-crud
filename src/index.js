import Fastify from 'fastify'
import { getDb } from './db.js'
import { ObjectId } from 'mongodb'

const fastify = Fastify({})
const isTestEnv = process.env.NODE_ENV === 'test'

if (!isTestEnv && !process.env.DB_NAME) {
    console.error('[error*****]: please, pass DB_NAME env before running it!')
    process.exit(1)
}

const { dbClient, collections: { dbUsers } } = await getDb()

fastify.get('/v1/customers', async (request, reply) => {
    const users = await dbUsers
        .find({})
        .sort({ name: 1 })
        .toArray()

    return reply.code(200).send(users)
})

fastify.get('/v1/customers/:id', {
    schema: {
        response: {
            200: {
                type: 'object',
                properties: {
                    id: { type: 'string' },
                    name: { type: 'string' },
                    phone: { type: 'string' },
                },
            },
            404: {
                type: 'object',
                properties: {
                    message: { type: 'string' },
                    id: { type: 'string' },
                },
            },
            400: {
                type: 'object',
                properties: {
                    message: { type: 'string' },
                    id: { type: 'string' },
                },
            },
        },
    },
}, async (request, reply) => {
    const { id } = request.params
    if (!ObjectId.isValid(id)) {
        return reply.code(400).send({ message: 'the id is invalid!', id })
    }

    const user = await dbUsers.findOne({ _id: ObjectId.createFromHexString(id) }) // Assuming id is stored in MongoDB ObjectId format

    if (!user) {
        return reply.code(404).send({ error: 'User not found' })
    }
    const { _id, ...remainingUserData } = user

    return reply.code(200).send({
        ...remainingUserData,
        id,
    })
})

fastify.post('/v1/customers', {
    schema: {
        body: {
            type: 'object',
            required: ['name', 'phone'],
            properties: {
                name: { type: 'string' },
                phone: { type: 'string' },
            },
        },
        response: {
            201: {
                type: 'object',
                properties: {
                    message: { type: 'string' },
                    id: { type: 'string' },
                },
            },
        },
    },
}, async (request, reply) => {
    const user = request.body
    const result = await dbUsers.insertOne(user)
    return reply.code(201).send({ message: `user ${user.name} created!`, id: result.insertedId.toString() })
})

fastify.put('/v1/customers/:id', {
    schema: {
        body: {
            type: 'object',
            required: ['name', 'phone'],
            properties: {
                name: { type: 'string' },
                phone: { type: 'string' },
            },
        },
        response: {
            200: {
                type: 'object',
                properties: {
                    message: { type: 'string' },
                    id: { type: 'string' },
                },
            },
            404: {
                type: 'object',
                properties: {
                    message: { type: 'string' },
                    id: { type: 'string' },
                },
            },
            400: {
                type: 'object',
                properties: {
                    message: { type: 'string' },
                    id: { type: 'string' },
                },
            },
        },
    },
}, async (request, reply) => {
    const { id } = request.params
    const user = request.body
    if (!ObjectId.isValid(id)) {
        return reply.code(400).send({ message: 'the id is invalid!', id })
    }

    const result = await dbUsers.updateOne({ _id: ObjectId.createFromHexString(id) }, { $set: user })

    if (!result.modifiedCount) {
        return reply.code(404).send({ message: 'User not found or no changes made', id })
    }

    return reply.code(200).send({ message: `User ${id} updated!`, id })
})

fastify.delete('/v1/customers/:id', {
    schema: {
        response: {
            200: {
                type: 'object',
                properties: {
                    message: { type: 'string' },
                    id: { type: 'string' },
                },
            },
            404: {
                type: 'object',
                properties: {
                    message: { type: 'string' },
                    id: { type: 'string' },
                },
            },
            400: {
                type: 'object',
                properties: {
                    message: { type: 'string' },
                    id: { type: 'string' },
                },
            },
        },
    },
}, async (request, reply) => {
    const { id } = request.params
    if (!ObjectId.isValid(id)) {
        return reply.code(400).send({ message: 'the id is invalid!', id })
    }

    const result = await dbUsers.deleteOne({ _id: ObjectId.createFromHexString(id) })

    if (!result.deletedCount) {
        return reply.code(404)
    }

    return reply.code(200).send({ message: `User ${id} deleted!`, id })
})

fastify.addHook('onClose', async () => {
    console.log('server closed!')
    return dbClient.close()
})
fastify.addHook('preHandler', (req, res, done) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
    res.header("Access-Control-Allow-Headers", "*");

    const isPreflight = /options/i.test(req.method);
    if (isPreflight) {
        return res.send();
    }

    done();
})

if (!isTestEnv) {
    const serverInfo = await fastify.listen({
        port: process.env.PORT || 9999,
        host: '::',
    })

    console.log(`server is running at ${serverInfo}`)
}

export const server = fastify
