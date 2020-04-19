import * as express from 'express'
import {ApolloServer, gql} from 'apollo-server-express'
import {PubSub} from 'graphql-subscriptions'
import {createServer} from 'http'

const pubsub = new PubSub()

const typeDefs = gql`
    type Query {
        hello: String!
    }
    type Mutation {
        say(name: String!): String!
    }
    type Subscription {
        newGreeting: String!
    }
`

const resolvers = {
    Query: {
        hello: () => "Hello, world!",
    },
    Mutation: {
        say: (parent, args) => {
            const greeting = `Hello, ${args.name}!`
            pubsub.publish("newGreeting", greeting)
            return true
        }
    },
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

const server = new ApolloServer({typeDefs, resolvers})

const app = express()
server.applyMiddleware({app})

const httpServer = createServer(app)
server.installSubscriptionHandlers(httpServer)

const PORT = 4000

httpServer.listen(PORT, () => {
    console.log(`🚀 Server ready at http://localhost:${PORT}${server.graphqlPath}`)
    console.log(`🚀 Subscriptions ready at ws://localhost:${PORT}${server.subscriptionsPath}`)
})
