const axios = require('axios')
const faker = require('faker')

function createKeyspace(name) {
    return axios.post('http://localhost:8082/v2/schemas/keyspaces', {
        name: name,
        replicas: 1
    })
}

function createVehicleTable() {
    return axios.post('http://localhost:8082/v2/schemas/keyspaces/blog/tables', {
        name: 'vehicle',
        columnDefinitions: [
            {
                name: 'manufacturer',
                typeDefinition: 'text'
            },
            {
                name: 'model',
                typeDefinition: 'text'
            },
            {
                name: 'type',
                typeDefinition: 'text'
            },
            {
                name: 'color',
                typeDefinition: 'text'
            },
            {
                name: 'vin',
                typeDefinition: 'text'
            }
        ],
        primaryKey: {
            partitionKey: ['manufacturer'],
            clusteringKey: ['type']
        },
        tableOptions: {
            defaultTimeToLive: 0,
            clusteringExpression: [{ "column": "type", "order": "ASC" }]
        }
    })
}

axios.post('http://localhost:8081/v1/auth', {
    username: 'cassandra',
    password: 'cassandra'
}).then(response => {
    axios.defaults.headers.common['X-Cassandra-Token'] = response.data.authToken

    // Create keyspace 'blog'
    createKeyspace('blog')
        .then(() => {
            createVehicleTable()
                .then(() => {
                    for (let i = 0; i < 50; i++) {
                        axios.post('http://localhost:8082/v2/keyspaces/blog/vehicle', {
                            manufacturer: faker.vehicle.manufacturer(),
                            model: faker.vehicle.model(),
                            type: faker.vehicle.type(),
                            color: faker.vehicle.color(),
                            vin: faker.vehicle.vin()
                        }).then(response => {
                            console.log(response.data)
                        })
                    }
                })
        })
})