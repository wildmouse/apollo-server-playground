import * as express from 'express'
import {ApolloServer, gql} from 'apollo-server-express'

const typeDefs = gql`
    type Query {
        hello: String!
    }

    type Mutation {
        say(name: String!): String!
    }
`

const resolvers = {
    Query: {
        hello: () => "Hello, world!",
    },
    Mutation: {
        say: (parent, args) => {
            const greeting = `Hello, ${args.name}!`
            // Do something with greeting
            return true
        }
    }
}

const server = new ApolloServer({typeDefs, resolvers})

const app = express()
server.applyMiddleware({app})

app.listen({port: 4000}, () => {
    console.log(`🚀 Server ready at http://localhost:4000${server.graphqlPath}`)
})
