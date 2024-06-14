import { RolePermissionController } from "../../../controllers/role-permission/RolePermissionController";
import { IRoutes } from "../../../helper/Helpers";

export const PermissionsRoutes: IRoutes = [
  {
    method: "get",
    route: "/roles",
    controller: RolePermissionController,
    action: "getAllRoles",
  },
  {
    method: "get",
    route: "/modifiable-roles",
    controller: RolePermissionController,
    action: "getModifiableRoles",
  },
  {
    method: "post",
    route: "/roles",
    controller: RolePermissionController,
    action: "createRole",
  },
  {
    method: "put",
    route: "/roles/:id",
    controller: RolePermissionController,
    action: "updateRole",
  },
  {
    method: "get",
    route: "/permissions",
    controller: RolePermissionController,
    action: "getPermissions",
  },
];
