"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
require("dotenv-safe/config");
const express_1 = __importDefault(require("express"));
const apollo_server_express_1 = require("apollo-server-express");
const apollo_server_core_1 = require("apollo-server-core");
const type_graphql_1 = require("type-graphql");
const typeorm_1 = require("typeorm");
const ioredis_1 = __importDefault(require("ioredis"));
const express_session_1 = __importDefault(require("express-session"));
const connect_redis_1 = __importDefault(require("connect-redis"));
const User_1 = require("./entities/User");
const Post_1 = require("./entities/Post");
const path_1 = __importDefault(require("path"));
const cors_1 = __importDefault(require("cors"));
const constants_1 = require("./constants/constants");
const test_1 = require("./resolvers/test");
const user_1 = require("./resolvers/user");
const post_1 = require("./resolvers/post");
const Upvote_1 = require("./entities/Upvote");
const vote_1 = require("./resolvers/vote");
const Group_1 = require("./entities/Group");
const group_1 = require("./resolvers/group");
const Member_1 = require("./entities/Member");
const PORT = parseInt(process.env.PORT);
const main = async () => {
    const connection = await (0, typeorm_1.createConnection)({
        type: "postgres",
        url: process.env.DATABASE_URL,
        logging: true,
        synchronize: false,
        migrations: [path_1.default.join(__dirname, "./migrations/*")],
        entities: [User_1.User, Post_1.Post, Upvote_1.Upvote, Group_1.Group, Member_1.Member]
    });
    await connection.runMigrations();
    const app = (0, express_1.default)();
    const RedisStore = (0, connect_redis_1.default)(express_session_1.default);
    const redis = new ioredis_1.default(process.env.REDIS_URL);
    app.set("trust proxy", 1);
    app.use((0, cors_1.default)({
        origin: process.env.CORS_ORIGIN,
        credentials: true
    }));
    app.use((0, express_session_1.default)({
        name: constants_1.COOKIE,
        store: new RedisStore({
            client: redis,
            disableTouch: true,
        }),
        cookie: {
            maxAge: 1000 * 60 * 60 * 24 * 365 * 10,
            httpOnly: true,
            sameSite: 'lax',
            secure: constants_1.__prod__,
        },
        saveUninitialized: false,
        secret: process.env.SESSION_SECRET,
        resave: false,
    }));
    app.get('/', (_, res) => {
        res.send("Server is working fine!");
    });
    const apolloServer = new apollo_server_express_1.ApolloServer({
        schema: await (0, type_graphql_1.buildSchema)({
            resolvers: [
                test_1.TestResolver,
                user_1.UserResolver,
                post_1.PostResolver,
                vote_1.VoteResolver,
                group_1.GroupResolver
            ],
            validate: false
        }),
        context: ({ req, res }) => ({ req, res, redis }),
        plugins: [
            (0, apollo_server_core_1.ApolloServerPluginLandingPageGraphQLPlayground)(),
        ],
    });
    apolloServer.start().then((_) => {
        apolloServer.applyMiddleware({ app, cors: { origin: false } });
        const server = app.listen(PORT, () => {
            console.log(`Server listening on port ${PORT}`);
        });
        process.on('unhandledRejection', (err, _) => {
            console.log(`Logged Error: ${err}`);
            server.close(() => process.exit(1));
        });
    });
};
main().catch((error) => {
    console.error(error);
});
//# sourceMappingURL=index.js.map