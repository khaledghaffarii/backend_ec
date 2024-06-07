import * as express from "express";
import * as bodyParser from "body-parser";
import { Request, Response } from "express";
import { AppDataSource } from "./data-source";
//@ts-ignore
import * as cors from "cors";
import { apiLimiter, corsOptions, logRequest } from "./helper/Helpers";
import { routes } from "./index.routes";
require("dotenv").config();

// create express app
const app = express();

//debuggRoutes(routes);
app.use(apiLimiter);
app.use(logRequest);

app.use(cors(corsOptions));
app.use(bodyParser.json());

// register express routes from defined application routes

routes.forEach((route) => {
  route.route = "/api" + route.route;
  const method = (req: Request, res: Response, next: Function) => {
    const controller = new (route.controller as any)();
    controller[route.action](req, res, next);
  };
  if (route.middleware) {
    (app as any)[route.method](route.route, route.middleware, method);
  } else {
    (app as any)[route.method](route.route, method);
  }
});
AppDataSource.initialize().catch((error) => console.log(error));
app.listen(process.env.PORT, () => {
  console.log(`Server started at port ${process.env.PORT}`);
});

export { app };
