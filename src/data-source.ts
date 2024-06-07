import "reflect-metadata";
import { DataSource } from "typeorm";
import { User } from "./entity/User";

export const AppDataSource = new DataSource({
  type: "mongodb",
  database: "ecommerce",
  url: "mongodb+srv://ghaffari:abcd123456@cluster0.ofgjfti.mongodb.net/",
  synchronize: true,
  useUnifiedTopology: true,
  logging: false,
  entities: [User],
  migrations: [],
  subscribers: [],
});
