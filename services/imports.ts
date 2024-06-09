import { AppDataSource } from "../src/data-source";
import { Request } from "express";
import { Response } from "express";
import { User } from "../src/entity/User";
import { ObjectId } from "mongodb";
import * as bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { omit } from "lodash";
import {
  createUser,
  validateEmailAndVerficationEmail,
} from "../services/UserSrvices";
const jwt_rounds = parseInt(process.env.JWT_ROUNDS);
const secret = process.env.JWT_SECRET;
const expiresIn = process.env.JWT_EXPIRATION_TIME;
export {
  //User,
  Request,
  Response,
  ObjectId,
  bcrypt,
  jwt,
  AppDataSource,
  jwt_rounds,
  createUser,
  validateEmailAndVerficationEmail,
  omit,
  secret,
  expiresIn,
};
