import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";

import { typeDefs as userTypeDefs, resolvers as userResolvers } from "./schemas/UserSchema.js";
import { typeDefs as postTypeDefs, resolvers as postResolvers } from "./schemas/PostSchema.js";
import { typeDefs as followTypeDefs, resolvers as followResolvers } from "./schemas/FollowSchema.js";
import { authentication } from "./utils/authentication.js";

const main = async () => {
  const server = new ApolloServer({
    typeDefs: [userTypeDefs, postTypeDefs, followTypeDefs],
    resolvers: [userResolvers, postResolvers, followResolvers],
    introspection: true,
  });

  const { url } = await startStandaloneServer(server, {
    listen: {
      port: process.env.PORT || 4000,
    },
    context: async ({ req, res }) => {
      return {
        authenticate: async () => await authentication(req),
      };
    },
  });

  console.log(`🚀Server ready at: ${url}`);
};

main();
