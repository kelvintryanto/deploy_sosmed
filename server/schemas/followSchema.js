import { GraphQLError } from "graphql";
import Follow from "../models/followModel.js";
import { ObjectId } from "mongodb";

// const follows = [
//   {
//     _id: 1,
//     followingId: 1,
//     // followerId adalah id user yang sedang login
//     followerId: 2,
//     createdAt: "2020-03-19T00:00:00.000Z",
//     updatedAt: "2020-03-19T00:00:00.000Z",
//   },
//   {
//     _id: 1,
//     followingId: 1,
//     // followerId adalah id user yang sedang login
//     followerId: 3,
//     createdAt: "2020-03-19T00:00:00.000Z",
//     updatedAt: "2020-03-19T00:00:00.000Z",
//   },
// ];

export const typeDefs = `#graphql
  #Follow
  type Follow {
    _id: ID
    followingId: ID
    followerId: ID
    createdAt: String
    updatedAt: String
  }

  type GetFollowingResponse {
    statusCode: String!
    data: [Follow]
  }

  type Query {
    # find user that logged in follow any user with id user logged in
    GetFollowing: GetFollowingResponse
  }
  
  type FollowResponse {
    statusCode: String!
    data: String
  }
  
  type Mutation {
    Follow(followingId: ID!): FollowResponse
  }
`;

export const resolvers = {
  Query: {
    // find user that logged in follow any user with id user logged in
    GetFollowing: async (_, args, contextValue) => {
      // We will use the authentication here
      // Remember the doAuthentication will return { id, name, email, username }
      const { id } = await contextValue.authenticate();

      // filter follows with followerId
      const follow = await Follow.findByFollowerId(id);

      return {
        statusCode: 200,
        data: follow,
      };
    },
  },

  Mutation: {
    Follow: async (_, args, contextValue) => {
      // We will use the authentication here
      // Remember the doAuthentication will return { id, name, email, username }
      const { id: followerId } = await contextValue.authenticate();

      // take the followingId User from input
      const { followingId } = args;

      // check if followingId and followerId is filled
      if (!followingId)
        throw new GraphQLError("All fields are required", {
          extensions: {
            code: "BAD_USER_INPUT",
            http: {
              status: 400,
            },
          },
        });

      // make follow object
      const follow = {
        followingId: new ObjectId(followingId),
        followerId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // insert follow to database
      // ?? Remember the followUser will return { insertedId }
      // https://www.mongodb.com/docs/manual/reference/method/db.collection.insertOne/
      // check if follow already exist at model
      const result = await Follow.followUser(follow);

      // jika follow berhasil, return statusCode 200 dan data
      if (result) {
        return {
          statusCode: 200,
          data: `${follow.followingId} followed successfully`,
        };
      } else {
        return {
          statusCode: 400,
          data: "Follow already exist",
        };
      }
    },
  },
};
