import { GraphQLError } from "graphql";
import User from "../models/userModel.js";
import Follow from "../models/followModel.js";
import { comparePassword } from "../utils/bcrypt.js";
import { generateToken } from "../utils/jwt.js";

export const typeDefs = `#graphql
  # User
  type GeneralResponse {
    message: String
  }
  
  type User {
    _id: ID
    name: String
    username: String!
    email: String!
    password: String!
  }
  
  type UserFollow {
    _id: ID
    name: String
    username: String!
    email: String!
  }
  
  type UserAggregate {
    _id: ID
    name: String
    username: String!
    email: String!
    follower: [UserFollow]
    following: [UserFollow]
  }
  
  type Query {
    SearchUser(username: String): User
    GetUser(id: ID!): UserAggregate
    GetAllUsers: [User]
  }
  
  input NewUser {
    name: String!
    username: String!
    email: String!
    password: String!
  }
  
  type Mutation {
    register(body: NewUser): GeneralResponse
    login(email: String!, password: String!): String
  }
`;

async function checkUniqueEmail(email) {
  // ambil semua user dari collection
  const users = await User.findAll();
  // cek apakah email tersebut ada di array tersebut
  return users.some((user) => user.email === email);
}

async function checkUniqueUsername(username) {
  // ambil semua user dari collection
  const users = await User.findAll();
  // cek apakah username tersebut ada di array tersebut
  return users.some((user) => user.username === username);
}

export const resolvers = {
  Query: {
    SearchUser: async (_, args) => {
      try {
        const { username } = args;
        const user = await User.findByUsername(username);

        return user;
      } catch (error) {
        console.log(error);
      }
    },

    GetUser: async (_, args) => {
      try {
        const { id } = args;
        const user = await User.findById(id);

        // di sini ambil getFollowers dan getFollowings
        // lalu gabungkan dengan user yang ingin dicari
        /**
         *     _id: ID
              name: String
              username: String!
              email: String!
              password: String!
              Follower: [User]
              Following: [User]
              pastikan user bentuknya object
         */

        const followers = await Follow.getFollowers(id);
        console.log("followers: ", followers, 97);

        const userFollowers = followers.map((follow) => follow.users);
        console.log("userFollowers: ", userFollowers, 98);

        const following = await Follow.getFollowings(id);
        console.log("following: ", following, 102);

        const userFollowing = following.map((follow) => follow.users);
        console.log("userFollowers: ", userFollowing, 98);

        const userAggregate = {
          _id: user._id,
          name: user.name,
          username: user.username,
          email: user.email,
          follower: userFollowers,
          following: userFollowing,
        };
        console.log(userAggregate, 108);

        // pasti error karena returnnya tidak ada follower dan following
        return userAggregate;
      } catch (error) {
        console.log(error);
      }
    },

    GetAllUsers: async () => {
      try {
        const users = await User.findAll();
        return users;
      } catch (error) {
        console.log(error);
      }
    },
  },

  Mutation: {
    // user register
    register: async (_, args) => {
      const { name, username, email, password } = args.body;

      // check if all fields are filled
      if (!name || !username || !email || !password)
        throw new GraphQLError("All fields are required", {
          extensions: {
            code: "BAD_USER_INPUT",
            http: {
              status: 400,
            },
          },
        });

      // check if email is unique
      const isUniqueEmail = await checkUniqueEmail(email);
      if (isUniqueEmail)
        throw new GraphQLError("Email already exists", {
          extensions: {
            http: {
              status: 400,
            },
          },
        });

      // check if username is unique
      const isUniqueUsername = await checkUniqueUsername(username);
      if (isUniqueUsername)
        throw new GraphQLError("Username already exists", {
          extensions: {
            http: {
              status: 400,
            },
          },
        });

      // check if password is long enough
      if (password.length < 5)
        throw new GraphQLError("Password must be at least 5 characters long", {
          extensions: {
            http: {
              status: 400,
            },
          },
        });

      // take body
      const { body } = args;
      const response = await User.register(body);
      return response;
    },

    // user login
    login: async (_, args) => {
      const { email, password } = args;

      // check if password is filled
      if (!email || !password)
        throw new GraphQLError("All Field are required", {
          extensions: {
            http: {
              status: 401,
            },
          },
        });

      // find user with email and password
      const user = await User.findByEmail(email);

      // check if user not found & compare password is false
      if (!user || !comparePassword(password, user.password))
        throw new GraphQLError("Invalid email or password", {
          extensions: {
            http: {
              status: 401,
            },
          },
        });

      // make token
      const payload = {
        id: user._id,
        email: user.email,
      };

      const token = generateToken(payload);

      return token;
    },
  },
};

export default { typeDefs, resolvers };
