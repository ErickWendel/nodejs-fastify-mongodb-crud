import { describe, beforeEach, before, after, it } from 'node:test'
import { deepStrictEqual, ok } from 'node:assert'
import { runSeed } from '../config/seed.js'
import { users } from '../config/users.js'

describe('API Workflow', () => {
    let _testServer
    let _testServerAddress

    function createCustomer(customer) {
        return _testServer.inject({
            method: 'POST',
            url: `${_testServerAddress}/v1/customers`,
            payload: customer,
        })
    }

    function getCustomers() {
        return _testServer.inject({
            method: 'GET',
            url: `${_testServerAddress}/v1/customers`,
        })
    }

    function getCustomerById(id) {
        return _testServer.inject({
            method: 'GET',
            url: `${_testServerAddress}/v1/customers/${id}`,
        })
    }

    function updateCustomer(id, customer) {
        return _testServer.inject({
            method: 'PUT',
            url: `${_testServerAddress}/v1/customers/${id}`,
            payload: customer,
        })
    }

    function deleteCustomer(id) {
        return _testServer.inject({
            method: 'DELETE',
            url: `${_testServerAddress}/v1/customers/${id}`,
        })
    }

    async function validateUsersListOrderedByName(usersSent) {
        const res = await getCustomers()
        const statusCode = res.statusCode
        const result = await res.json()

        const sort = items => items
            .map(({ _id, ...remaining }) => remaining)
            .sort((a, b) => a.name.localeCompare(b.name))

        const expectSortedByName = sort(usersSent)

        deepStrictEqual(statusCode, 200)
        deepStrictEqual(sort(result), expectSortedByName)
    }

    before(async () => {
        const { server } = await import('../src/index.js')
        _testServer = server

        _testServerAddress = await server.listen();
    })

    beforeEach(async () => {
        return runSeed()
    })

    after(async () => _testServer.close())

    describe('POST /v1/customers', () => {
        it('should create customer', async () => {
            const input = {
                name: 'Xuxa da Silva',
                phone: '123456789',
            }

            const expected = { message: `user ${input.name} created!` }


            const res = await createCustomer(input)
            deepStrictEqual(res.statusCode, 201)
            const result = await res.json()
            ok(result.id)
            delete result.id
            deepStrictEqual(result, expected)

            await validateUsersListOrderedByName([...users, input])
        })
    })

    describe(`GET /v1/customers`, () => {
        it('should retrieve only initial users', async () => {
            return validateUsersListOrderedByName(users)
        })

        it('given 5 different customers it should have valid list', async () => {
            const customers = [
                { name: 'Erick Wendel', phone: '123456789' },
                { name: 'Ana Neri', phone: '123456789' },
                { name: 'Shrek de Souza', phone: '123456789' },
                { name: 'Nemo de Oliveira', phone: '123456789' },
                { name: 'Buzz da Rocha', phone: '123456789' },
            ]
            await Promise.all(
                customers.map(customer => createCustomer(customer))
            )

            await validateUsersListOrderedByName(users.concat(customers))
        })
    })

    describe(`GET /v1/customers/:id`, () => {
        it('should retrieve a customer by ID', async () => {
            const customerResponse = await createCustomer({
                name: 'Test User',
                phone: '123456789',
            })

            const { id } = await customerResponse.json() // Extracting the ID from the response

            const res = await getCustomerById(id)
            deepStrictEqual(res.statusCode, 200)
            deepStrictEqual(await res.json(), { id, name: 'Test User', phone: '123456789' })
        })

        it('should return 404 for non-existent customer', async () => {
            const res = await getCustomerById('66fbfd09785d518f5c747366')
            deepStrictEqual(res.statusCode, 404)
        })
    })

    describe(`PUT /v1/customers/:id`, () => {
        it('should update a customer', async () => {
            const customerResponse = await createCustomer({
                name: 'Update User',
                phone: '123456789',
            })

            const { id } = await customerResponse.json() // Extracting the ID from the response

            const updatedData = { name: 'Updated Name', phone: '987654321' }
            const res = await updateCustomer(id, updatedData)
            deepStrictEqual(res.statusCode, 200)
            deepStrictEqual(await res.json(), { message: `User ${id} updated!`, id })

            const updatedUser = await getCustomerById(id)
            deepStrictEqual(updatedUser.statusCode, 200)
            deepStrictEqual(await updatedUser.json(), { id, ...updatedData })
        })

        it('should return 400 for invalid id', async () => {
            const id = '123'
            const res = await updateCustomer(id, { name: 'New Name', phone: '123' })
            deepStrictEqual(res.statusCode, 400)
            const result = await res.json()
            deepStrictEqual(result, { message: 'the id is invalid!', id })
        })
    })

    describe(`DELETE /v1/customers/:id`, () => {
        it('should delete a customer', async () => {
            const customerResponse = await createCustomer({
                name: 'Delete User',
                phone: '123456789',
            })

            const { id } = await customerResponse.json() // Extracting the ID from the response

            const res = await deleteCustomer(id)
            deepStrictEqual(res.statusCode, 200)
            deepStrictEqual(await res.json(), { message: `User ${id} deleted!`, id })

            const deletedUser = await getCustomerById(id)
            deepStrictEqual(deletedUser.statusCode, 404)
        })

        it('should return 400 for id invalid', async () => {
            const id = '123'
            const res = await deleteCustomer(id)
            deepStrictEqual(res.statusCode, 400)
            deepStrictEqual(await res.json(), { message: 'the id is invalid!', id })
        })
    })
})
