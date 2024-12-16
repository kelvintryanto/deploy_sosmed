import { ObjectId } from "mongodb";
import { db } from "../config/db.js";

class Post {
  static getCollection() {
    const collection = db.collection("posts");
    return collection;
  }

  static async findAll() {
    const posts = await db
      .collection("posts")
      .aggregate([
        {
          $sort: {
            createdAt: -1,
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "authorId",
            foreignField: "_id",
            as: "author",
          },
        },
        {
          $unwind: {
            path: "$author",
            preserveNullAndEmptyArrays: false,
          },
        },
        {
          $unset: "author.password",
        },
      ])
      .toArray();
    return posts;
  }

  static async create(post) {
    const collection = this.getCollection();
    const result = await collection.insertOne(post);
    return result;
  }

  static async findById(id) {
    const post = await db
      .collection("posts")
      .aggregate([
        {
          $match: {
            _id: new ObjectId(String(id)),
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "authorId",
            foreignField: "_id",
            as: "author",
          },
        },
        {
          $unwind: {
            path: "$author",
            preserveNullAndEmptyArrays: false,
          },
        },
        {
          $unset: "author.password",
        },
      ])
      .next();

    return post;
  }

  static async likePost(id, newLike) {
    const collection = this.getCollection();

    // Cek apakah post sudah disukai oleh user yang sama
    // postAlreadyLiked akan mengembalikan post yang sudah disukai oleh user yang sama
    // https://www.mongodb.com/docs/manual/reference/operator/query/elemMatch/
    const postAlreadyLiked = await collection.findOne({
      _id: new ObjectId(String(id)),
      likes: { $elemMatch: { username: newLike.username } },
    });

    if (!postAlreadyLiked) {
      await collection.updateOne(
        { _id: new ObjectId(String(id)) }, // Filter: mencari pos dengan ID tertentu
        {
          $push: { likes: newLike }, // Update: menambahkan 'newLike' ke array 'likes'
        }
      );
    }
  }

  static async commentPost(id, newComment) {
    const collection = this.getCollection();

    await collection.updateOne(
      { _id: new ObjectId(String(id)) }, // Filter: mencari pos dengan ID tertentu
      {
        $push: { comments: newComment }, // Update: menambahkan 'newComment' ke array 'comments'
      }
    );
  }
}
export default Post;
