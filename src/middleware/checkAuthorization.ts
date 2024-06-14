import { Request, Response, NextFunction } from "express";

import { User } from "../entity/User";
import { AppDataSource } from "../data-source";
import { ObjectId } from "mongodb";
import { AuthError } from "../helper/Helpers";
var jwt = require("jsonwebtoken");
export const getDecodedAuthTokenFromHeaderOrFail = async (
  req: Request,
  res: Response
) => {
  try {
    // Get token from headers
    let token = req.headers["authorization-token"];
    console.log("🚀 ~ token:", token);

    if (token) {
      token = token as string;
      // Verify token : this will throw an error if the token is invalid or expired

      const decodedToken: any = jwt.verify(token, process.env.JWT_SECRET);

      const userId: any = decodedToken.id;

      // find user
      const userRepo = AppDataSource.getMongoRepository(User);

      //@ts-ignore
      const user = await userRepo.findOne(new ObjectId(userId));

      if (!user) {
        console.log("true");
        throw new AuthError("Authorization failed");
      }
      return { userId };
    }
    throw new AuthError("Authorization failed");
  } catch (error) {
    console.log("🚀firstcheck: ~ error:", error);

    if (error.name == "AuthError") {
      throw new AuthError(error.message);
    } else {
      throw new AuthError("Authorization failed");
    }
  }
};

export const checkAuthorization =
  (entity: string, requiredPermission: string) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Get user id from the token
      const { userId } = await getDecodedAuthTokenFromHeaderOrFail(req, res);

      if (!userId) {
        return res.status(401).json({ message: "Authorization failed" });
      }
      const userRepository = AppDataSource.getMongoRepository(User);

      const user = await userRepository.findOne({
        where: { _id: new ObjectId(userId) },
      });

      if (!user) {
        return res.status(401).json({ message: "Authorization failed" });
      }

      next();
    } catch (error) {
      if (error.name == "AuthError") {
        return res.status(401).json({ message: error.message });
      } else {
        return res.status(401).json({ message: "Authorization failed" });
      }
    }
  };
