import "reflect-metadata";
import { DataSource } from "typeorm";
import { User } from "./entity/User";
import { Client } from "./entity/Clients";
import { Permission } from "./entity/Permission";

export const AppDataSource = new DataSource({
  type: "mongodb",
  database: "ecommerce",
  url: "mongodb+srv://ghaffari:abcd123456@cluster0.ofgjfti.mongodb.net/ecommerce?retryWrites=true&w=majority&tls=true",
  useUnifiedTopology: true,
  ssl: true,
  sslValidate: true,
  connectTimeoutMS: 10000, // Optional: Increased timeout (consider temporary)
  logging: true, // Enable logging for debugging
  entities: [User, Client, Permission],
  migrations: [],
  subscribers: [],
});
