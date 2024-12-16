import { ObjectId } from "mongodb";
import { db } from "../config/db.js";

class Follow {
  static getCollection() {
    const collection = db.collection("follows");
    return collection;
  }

  static async findByFollowerId(id) {
    const collection = this.getCollection();
    const follow = await collection.find({ followingId: id }).toArray();
    return follow;
  }

  // untuk user mendapatkan semua user yang menjadi follower
  // pakai manual langsung tembak ke db
  static async getFollowers(id) {
    const followers = await db
      .collection("follows")
      .aggregate([
        {
          $match: {
            followingId: new ObjectId(String(id)),
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "followerId",
            foreignField: "_id",
            as: "users",
          },
        },
        {
          $unwind: {
            path: "$users",
            preserveNullAndEmptyArrays: false,
          },
        },
        {
          $project: {
            createdAt: 0,
            updatedAt: 0,
          },
        },
        {
          $unset: ["users.password"],
        },
      ])
      .toArray();
    return followers;
  }

  static async getFollowings(id) {
    const following = await db
      .collection("follows")
      .aggregate([
        {
          $match: {
            followerId: new ObjectId(String(id)),
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "followingId",
            foreignField: "_id",
            as: "users",
          },
        },
        {
          $unwind: {
            path: "$users",
            preserveNullAndEmptyArrays: false,
          },
        },
        {
          $project: {
            createdAt: 0,
            updatedAt: 0,
          },
        },
        {
          $unset: ["users.password"],
        },
      ])
      .toArray();
    return following;
  }

  static async followUser(follow) {
    const collection = this.getCollection();

    // cek follow sudah ada atau belum
    const foundFollow = await collection.findOne({
      followingId: follow.followingId,
      followerId: follow.followerId,
    });
    console.log(foundFollow);

    if (!foundFollow) {
      const result = await collection.insertOne(follow);
      return result;
    }
  }
}

export default Follow;
