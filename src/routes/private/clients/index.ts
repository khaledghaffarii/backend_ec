import { ClientController } from "../../../controllers/clients/ClientController";
import { IRoutes } from "../../../helper/Helpers";

export const ClientsRoutes: IRoutes = [
  {
    method: "post",
    route: "/clients",
    controller: ClientController,
    action: "create",
  },
  {
    method: "get",
    route: "/clients",
    controller: ClientController,
    action: "get",
  },
  {
    method: "get",
    route: "/clients/:id",
    controller: ClientController,
    action: "getById",
  },
  {
    method: "put",
    route: "/clients/:id",
    controller: ClientController,
    action: "update",
  },
  {
    method: "delete",
    route: "/clients/:id",
    controller: ClientController,
    action: "delete",
  },
];
