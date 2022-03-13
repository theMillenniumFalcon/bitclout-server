import "reflect-metadata"
import 'dotenv-safe/config'
import express from 'express'
import { ApolloServer } from 'apollo-server-express'
import { ApolloServerPluginLandingPageGraphQLPlayground } from "apollo-server-core"
import { buildSchema } from 'type-graphql'
import {createConnection} from 'typeorm'
import Redis from 'ioredis'
import session from 'express-session'
import connnectRedis from 'connect-redis'
import { User } from "./entities/User"
import { Post } from "./entities/Post"
import path from "path"
import cors from "cors"
import { COOKIE, __prod__ } from "./constants/constants"
import { TestResolver } from "./resolvers/test"
import { UserResolver } from "./resolvers/user"
import { PostResolver } from "./resolvers/post"
import { Upvote } from "./entities/Upvote"
import { VoteResolver } from "./resolvers/vote"
import { Group } from "./entities/Group"
import { GroupResolver } from "./resolvers/group"
import { Member } from "./entities/Member"

const PORT = parseInt(process.env.PORT)

const main = async () => {

    const connection = await createConnection({
        type: "postgres",
        url: process.env.DATABASE_URL,
        logging: true,
        synchronize: false,
        migrations: [path.join(__dirname, "./migrations/*")],
        entities: [User, Post, Upvote, Group, Member]
    })

    await connection.runMigrations()

    const app = express()

    const RedisStore = connnectRedis(session)
    const redis = new Redis(process.env.REDIS_URL)

    app.set("trust proxy", 1)

    app.use(cors({
        origin: process.env.CORS_ORIGIN,
        credentials: true
    }))
    
    app.use(session({
        name: COOKIE,
        store: new RedisStore({
            client: redis,
            disableTouch: true,
        }),
        cookie: {
            maxAge: 1000*60*60*24*365*10,
            httpOnly: true,
            sameSite: 'lax', // * csrf
            secure: __prod__, // * cookie only works in https
        },
        saveUninitialized: false,
        secret: process.env.SESSION_SECRET,
        resave: false,
    }))

    app.get('/', (_, res) => {
        res.send("Server is working fine!")
    })

    const apolloServer = new ApolloServer({
        schema: await buildSchema({
            resolvers: [
                TestResolver, 
                UserResolver, 
                PostResolver, 
                VoteResolver, 
                GroupResolver
            ],
            validate: false
        }),
        // * context is an object that is accessible to all the resolvers
        context: ({ req, res }) => ({ req, res, redis }),
        plugins: [
            ApolloServerPluginLandingPageGraphQLPlayground(),
        ],
    })

    apolloServer.start().then((_) => {
        apolloServer.applyMiddleware({ app, cors: { origin: false } })
        const server = app.listen(PORT, () => {
            console.log(`Server listening on port ${PORT}`)
        })
        process.on('unhandledRejection', (err, _) => {
            console.log(`Logged Error: ${err}`)
            server.close(() => process.exit(1))
        })
    })
}
main().catch((error) => {
    console.error(error)
})