import { GraphQLError } from "graphql";
import { verifyToken } from "./jwt.js";
import User from "../models/userModel.js";

export const authentication = async (req) => {
  const headerAuthorization = req.headers.authorization;

  if (!headerAuthorization)
    throw new GraphQLError("You are not authenticated", {
      extensions: {
        code: "UNAUTHENTICATED",
        http: "401",
      },
    });

  const token = headerAuthorization.split(" ")[1];

  // we need to read the token here
  const payload = verifyToken(token);

  const user = await User.findByEmail(payload.email);

  if (!user)
    throw new GraphQLError("You are not authenticated", {
      extensions: {
        http: "401",
        code: "UNAUTHENTICATED",
      },
    });

  // setiap kali menjalankan authenticate, maka userId akan berubah
  // jadi kita harus menyimpan userId tersebut ke dalam context
  // untuk menggunakan di resolver
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    username: user.username,
  };
};
