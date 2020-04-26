import * as express from 'express'
import {ApolloServer, gql} from 'apollo-server-express'
import {PubSub} from 'graphql-subscriptions'
import {createServer} from 'http'
import {makeSchema, mutationField, queryField, queryType, stringArg} from "nexus"

const pubsub = new PubSub()

const Query = queryField("hello", {
    type: "String",
    resolve: () => "Hello, world!"
})

const Mutation = mutationField("say", {
    type: "String",
    args: { name: stringArg() },
    resolve: (parent, args) => {
        const greeting = `Hello, ${args.name}!`
        pubsub.publish("newGreeting", greeting)
        return "true"
    }
})

const schema = makeSchema({
    types: [Query, Mutation],
    outputs: {
        schema: __dirname + '/generated/schema.graphql',
        typegen: __dirname + '/generated/typings.ts'
    }
})

const typeDefs = gql`
    type Subscription {
        newGreeting: String!
    }
`

const resolvers = {
    Subscription: {
        newGreeting: {
            subscribe: () => {
                return pubsub.asyncIterator("newGreeting")
            },
            resolve: (payload) => {
                return payload
            }
        }
    }
}

const server = new ApolloServer({schema})

const app = express()
server.applyMiddleware({app})

const httpServer = createServer(app)
server.installSubscriptionHandlers(httpServer)

const PORT = 4000

httpServer.listen(PORT, () => {
    console.log(`🚀 Server ready at http://localhost:${PORT}${server.graphqlPath}`)
    console.log(`🚀 Subscriptions ready at ws://localhost:${PORT}${server.subscriptionsPath}`)
})
