import { AuthController } from "../../controllers/User/AuthController";
import { IRoutes } from "../../helper/Helpers";

export const PublicRoutes: IRoutes = [
  {
    method: "post",
    route: "/register",
    controller: AuthController,
    action: "register",
  },
  {
    method: "post",
    route: "/login",
    controller: AuthController,
    action: "login",
  },
];
