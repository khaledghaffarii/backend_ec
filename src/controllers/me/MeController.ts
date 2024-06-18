import { ObjectId, Request, Response, omit } from "../../../services/imports";
import { AppDataSource } from "../../data-source";
import { User } from "../../entity/User";
import {
  createResponse,
  escapeAttributes,
  omitAttributes,
  validateAttributes,
} from "../../helper/Helpers";
import { getDecodedAuthTokenFromHeaderOrFail } from "../../middleware/checkAuthorization";

/** User Controller: Handles user-related operations */
export class MeController {
  private userRepository = AppDataSource.getMongoRepository(User);
  /**
   * Get User method: returns a user
   * @param request - the incoming request object
   * @returns a JSON object with a user or an error response object
   */
  async getMe(request: Request, response: Response) {
    try {
      const { userId } = await getDecodedAuthTokenFromHeaderOrFail(
        request,
        response
      );
      const user = await this.userRepository.findOne({
        where: { _id: new ObjectId(userId) },
      });
      if (!user) {
        return createResponse(response, 400, "Invalid request");
      }
      var resUser = omit(user, omitAttributes);
      return createResponse(response, 200, resUser);
    } catch (err) {
      console.error(err.message);
      if (err.name == "InvalidInputError") {
        return createResponse(response, 400, err.message);
      } else if (err.name == "SmtpError") {
        return createResponse(response, 400, err.message);
      } else if (err.name == "AuthError") {
        return createResponse(response, 400, err.message);
      } else {
        return createResponse(response, 500, "Server error");
      }
    }
  }

  /**
   * Logout method: logs out a user by deleting the user's push token
   * @param request - the incoming request object
   * @returns a JSON object with a success message or an error response object
   */
  async logout(request: Request, response: Response) {
    try {
      // get userId from auth token
      const { userId } = await getDecodedAuthTokenFromHeaderOrFail(
        request,
        response
      );
      // validate escape and get pushToken from body
      const validation = validateAttributes(request.body, ["pushToken"]);
      if (validation !== null) {
        // If any attribute is missing, return a 400 error response
        return createResponse(response, 400, validation);
      }

      const escapedData = escapeAttributes(request.body, ["pushToken"]);
      // find user
      const user = await this.userRepository.findOne({
        where: { _id: new ObjectId(userId) },
      });
      if (!user) {
        return createResponse(response, 400, "User not found");
      }
      // delete push token
      user.pushTokens = user.pushTokens.filter(
        (token) => token !== escapedData.pushToken
      );
      console.log("🚀 ~ MeController ~ logout ~ user:", user);
      await this.userRepository.save(user);
      return createResponse(response, 200, "Logout successful");
    } catch (err) {
      console.error(err.message);
      if (err.name == "InvalidInputError") {
        return createResponse(response, 400, err.message);
      } else if (err.name == "SmtpError") {
        return createResponse(response, 400, err.message);
      } else if (err.name == "AuthError") {
        return createResponse(response, 400, err.message);
      } else {
        return createResponse(response, 500, "Server error");
      }
    }
  }
}
