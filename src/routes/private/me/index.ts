import { MeController } from "../../../controllers/me/MeController";
import { IRoutes } from "../../../helper/Helpers";

export const MeRoutes: IRoutes = [
  {
    method: "post",
    route: "/logout",
    controller: MeController,
    action: "logout",
  },

  {
    method: "get",
    route: "/me",
    controller: MeController,
    action: "getMe",
  },
];
