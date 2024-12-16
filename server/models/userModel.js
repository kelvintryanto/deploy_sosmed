import { ObjectId } from "mongodb";
import { db } from "../config/db.js";
import { hashPassword } from "../utils/bcrypt.js";

class User {
  static getCollection() {
    const collection = db.collection("users");
    return collection;
  }

  // temukan semua user
  static async findAll() {
    const collection = this.getCollection();
    const users = await collection.find().toArray();

    return users;
  }

  static async findById(id) {
    const collection = await db.collection("users");
    const user = await collection.findOne({ _id: new ObjectId(String(id)) });

    return user;
  }

  static async findByEmail(email) {
    const collection = this.getCollection();
    const user = await collection.findOne({ email });

    return user;
  }

  static async findByUsername(username) {
    const collection = this.getCollection();
    const user = await collection.findOne({ username });

    return user;
  }

  // register user
  static async register(body) {
    const { email, name, username, password } = body;
    const collection = this.getCollection();
    await collection.insertOne({
      email: email,
      name: name,
      username: username,
      password: hashPassword(password),
    });

    return {
      message: "User registered successfully",
    };
  }

  static async login(email, password) {
    const collection = this.getCollection();
    const user = await collection.findOne({ email, password });
    if (!user) {
      throw new Error("Invalid email or password");
    }
    console.log(user);
    return user;
  }
}

export default User;
