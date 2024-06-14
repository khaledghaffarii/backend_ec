import { Request, Response } from "../../../services/imports";
import { AppDataSource } from "../../data-source";
import { Permission, PermissionsTypes } from "../../entity/Permission";
import { PERMISSION_MODIFIABLE_ENTITIES } from "../../entity/constants";
import { createResponse } from "../../helper/Helpers";
import { checkAuthorization } from "../../middleware/checkAuthorization";

/** Role Permission Controller: Handles role-permissions related operations */
export class RolePermissionController {
  async getPermissions(
    request: Request,
    response: Response
  ): Promise<Permission[]> {
    // check auth and return all the permissions
    try {
      // Check if user has permission to create User entities
      await checkAuthorization(
        Permission.collectionName,
        PermissionsTypes.canView
      )(request, response, async () => {
        const resData = [];
        PERMISSION_MODIFIABLE_ENTITIES.map((entity) => {
          const permission = new Permission();
          permission.entity = entity;
          permission.canCreate = false;
          permission.canView = false;
          permission.canUpdate = false;
          permission.canDelete = false;
          resData.push(permission);
        });
        return createResponse(response, 200, resData);
      });
    } catch (error) {
      console.error(error.message);
      return createResponse(response, 500, "Server error");
    }
  }
}
