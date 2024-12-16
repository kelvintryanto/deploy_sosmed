import { GraphQLError } from "graphql";
import Post from "../models/postModel.js";
import redis from "../config/redis.js";

export const typeDefs = `#graphql
  type Comments {
    content: String!
    username: String!
    createdAt: String
    updatedAt: String
  }
  
  type Likes {
    username: String!
    createdAt: String
    updateAt: String
  }
  
  type PostAuthor {
    _id: ID
    name: String
    username: String!
    email: String!
  }
  
  # Post
  type Post {
    _id: ID
    content: String!
    tags: [String]
    imgURL: String
    authorId: ID!
    comments: [Comments]
    likes: [Likes]
    createdAt: String
    updatedAt: String
    author: PostAuthor
  }
  
  type Query {
    # ganti di sini untuk GetPost dan GetPostById
    GetPost: [Post]
    GetPostById(id: ID!): Post
  }
  
  input NewPost {
    content: String!
    tags: [String]
    imgURL: String
  }
  
  input NewLikePost {
    # mengambil id dari post
    id: ID!
  }
  
  input NewCommentPost {
    # mengambil id dari post
    id: ID!
    content: String!
  }
  
  type PostResponse {
    statusCode: String!
    data: String
  }
  
  type Mutation {
    AddPost(body: NewPost): PostResponse
    LikePost(body: NewLikePost): PostResponse
    CommentPost(body: NewCommentPost): PostResponse
  }
`;

export const resolvers = {
  Query: {
    GetPost: async (_, args) => {
      try {
        // get cache from redis
        const cachedPosts = await redis.get("posts");

        if (cachedPosts) {
          return JSON.parse(cachedPosts);
        }

        const posts = await Post.findAll();
        await redis.set("posts", JSON.stringify(posts));
        return posts;
      } catch (error) {
        console.log(error);
      }
    },

    GetPostById: async (_, args) => {
      try {
        const { id } = args;
        const post = await Post.findById(id);
        console.log(post);
        return post;
      } catch (error) {
        console.log(error);
      }
    },
  },

  Mutation: {
    AddPost: async (_, args, contextValue) => {
      // We will use the authentication here
      // Remember the doAuthentication will return { id, name, email, username }
      const { id: authorId } = await contextValue.authenticate();

      // take content, tags, imgURL from input
      const { body } = args;
      const { content, tags, imgURL } = body;

      // check if content and authorId is filled
      if (!content)
        throw new GraphQLError("All fields are required", {
          extensions: {
            code: "BAD_USER_INPUT",
            http: {
              status: 400,
            },
          },
        });

      const post = {
        authorId,
        content,
        tags,
        imgURL,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = await Post.create(post);

      // cache invalidation
      await redis.del("posts");

      return {
        statusCode: 200,
        data: `Post with id ${result.insertedId} created successfully`,
      };
    },

    LikePost: async (_, args, contextValue) => {
      // We will use the authentication here
      // Remember the doAuthentication will return { id, name, email, username }
      const { username } = await contextValue.authenticate();

      // take id post from post liked
      const { body } = args;
      const { id } = body;

      const likes = {
        username,
        createdAt: new Date(),
        updateAt: new Date(),
      };

      await Post.likePost(id, likes);

      // cache invalidation
      await redis.del("posts");

      return {
        statusCode: 200,
        data: `Post with id ${id} liked successfully`,
      };
    },

    CommentPost: async (_, args, contextValue) => {
      // We will use the authentication here
      // Remember the doAuthentication will return { id, name, email, username }
      const { username } = await contextValue.authenticate();

      // take id and content from input
      const { body } = args;
      const { id, content } = body;

      // check if and content is filled
      if (!content)
        throw new GraphQLError("All fields are required", {
          extensions: {
            code: "BAD_USER_INPUT",
            http: {
              status: 400,
            },
          },
        });

      const comment = {
        content,
        username,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await Post.commentPost(id, comment);

      // cache invalidation
      await redis.del("posts");

      return {
        statusCode: 200,
        data: `Comment with id ${id} created successfully`,
      };
    },
  },
};
