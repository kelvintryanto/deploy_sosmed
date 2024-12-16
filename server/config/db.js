const isNotProduction = process.env.NODE_ENV !== "production";

if (isNotProduction) {
  const dotenv = await import("dotenv");
  dotenv.config();
}

import { MongoClient } from "mongodb";

const CONNECTION_STRING = process.env.MONGODB_CONN_STRING;
const DATABASE_NAME = process.env.MONGODB_DB_NAME;

export const client = new MongoClient(CONNECTION_STRING);
export let db = null;

async function main() {
  if (!db) {
    await client.connect();
    console.log("Connected successfully to server");

    db = client.db(DATABASE_NAME);
  }
}

main();
