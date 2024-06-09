import {
  AppDataSource,
  Request,
  Response,
  bcrypt,
  createUser,
  omit,
  validateEmailAndVerficationEmail,
  // jwt,
  // secret,
  expiresIn,
} from "../../../services/imports";

import {
  createResponse,
  escapeAttributes,
  omitAttributes,
  validateAttributes,
  validateEmail,
} from "../../helper/Helpers";
import { User } from "../../entity/User";
var jwt = require("jsonwebtoken");
export class AuthController {
  private userRepository = AppDataSource.getMongoRepository(User);
  async register(request: Request, response: Response) {
    try {
      const attributes = [
        "firstName",
        "lastName",
        "email",
        "phoneNumber",
        "password",
      ];

      const requiredAttributes = ["firstName", "lastName", "email", "password"];
      // Validate if all required attributes are present in the request body
      const validation = validateAttributes(request.body, requiredAttributes);
      if (validation !== null) {
        // If any attribute is missing, return a 400 error response
        return createResponse(response, 400, validation);
      }

      // Escape all attributes to prevent XSS attacks
      const escapedData = escapeAttributes(request.body, attributes);
      let user: User;
      user = await createUser(escapedData);
      const res = await validateEmailAndVerficationEmail(user);
      console.log("🚀 ~ AuthController ~ register 1 ~ res:", res);

      if (res) {
        return createResponse(response, 200, res);
      }
      return createResponse(response, 500, "Registration failed");
      // Validate if the provided email address is valid
    } catch (err) {
      console.log("🚀 ~ AuthController ~ register ~ err:", err);
      console.error(err.message);
      if (err.name == "InvalidInputError") {
        return createResponse(response, 400, err.message);
      } else if (err.name == "SmtpError") {
        return createResponse(response, 400, err.message);
      } else {
        return createResponse(response, 500, "Server error");
      }
    }
  }
  // async register(request: Request, response: Response) {
  //   try {
  //     const attributes = [
  //       "firstName",
  //       "lastName",
  //       "email",
  //       "phoneNumber",
  //       "password",
  //     ];

  //     const requiredAttributes = ["firstName", "lastName", "email", "password"];
  //     // Valider si tous les attributs requis sont présents dans le corps de la requête
  //     const validation = validateAttributes(request.body, requiredAttributes);
  //     if (validation !== null) {
  //       // Si un attribut est manquant, retourner une réponse d'erreur 400
  //       return createResponse(response, 400, validation);
  //     }

  //     // Échapper tous les attributs pour prévenir les attaques XSS
  //     const escapedData = escapeAttributes(request.body, attributes);

  //     // Hacher le mot de passe avant de créer l'utilisateur
  //     const hashedPassword = await bcrypt.hash(escapedData.password, 10);
  //     escapedData.password = hashedPassword;

  //     let user: User;
  //     user = await createUser(escapedData);
  //     const res = await validateEmailAndVerficationEmail(user);
  //     console.log("🚀 ~ AuthController ~ register ~ res:", res);

  //     if (res) {
  //       return createResponse(response, 200, res);
  //     }
  //     return createResponse(response, 500, "Échec de l'inscription");
  //   } catch (err) {
  //     console.log("🚀 ~ AuthController ~ register ~ err:", err);
  //     console.error(err.message);
  //     if (err.name == "InvalidInputError") {
  //       return createResponse(response, 400, err.message);
  //     } else if (err.name == "SmtpError") {
  //       return createResponse(response, 400, err.message);
  //     } else {
  //       return createResponse(response, 500, "Erreur serveur");
  //     }
  //   }
  // }

  async authenticateUser(
    attributeName: string,
    attributeValue: string,
    password?: string,
    response?: Response,
    pushToken?: string
  ) {
    try {
      const secret = process.env.JWT_SECRET;
      const attributes = [attributeName, "password"];
      const expiresIn = process.env.JWT_EXPIRATION_TIME;
      const escapedData = escapeAttributes(
        { [attributeName]: attributeValue, password },
        attributes
      );

      const whereClause = { [attributeName]: escapedData[attributeName] };
      const user = await this.userRepository.findOne({ where: whereClause });
      // console.log("🚀 ~ AuthController ~ user:", user);

      if (!user) {
        // If no user exists with the provided attribute value, return a 400 error response
        return createResponse(response, 401, " line 86 Invalid credentials");
      }
      // Check if the provided password matches the hashed password stored in the database
      const passwordMatches = await bcrypt.compare(
        escapedData.password,
        user.password
      );
      // console.log("🚀 ~ AuthController ~ passwordMatches:", passwordMatches);
      // console.log("🚀 ~ AuthController ~ jwt:", jwt);
      // console.log("🚀 ~ secret:", secret);
      // console.log("🚀 ~ expiresIn:", expiresIn);
      // console.log(
      //   "🚀 ~ AuthController ~ escapedData.password:",
      //   escapedData.password
      // );
      // console.log("🚀 ~ AuthController ~ user.password:", user.password);
      if (!passwordMatches) {
        // If the password is incorrect, return a 400 error response
        return createResponse(response, 401, " line 98 Invalid credentials");
      }

      let token: string;
      token = jwt.sign({ id: user.id }, secret, { expiresIn });

      if (pushToken) {
        // save pushToken to user pushTokens array
        const pushTokens = user.pushTokens ?? [];
        if (!pushTokens.includes(pushToken)) {
          pushTokens.push(pushToken);
          await this.userRepository.update({ id: user.id }, { pushTokens });
        }
      }
      const resData = {
        user: omit(user, omitAttributes),
        token: token,
      };
      const jsonResponse = createResponse(response, 200, resData);
      return jsonResponse;
    } catch (error) {
      console.log("🚀 ~ AuthController ~ error:", error);
    }
  }

  //LOGIN
  async login(request: Request, response: Response) {
    try {
      // check if body contain email or phoneNumber
      if (!request.body.email && !request.body.phoneNumber) {
        return createResponse(
          response,
          400,
          "Email or phone number is required"
        );
      }
      const attributeName = request.body.email ? "email" : "phoneNumber";
      // console.log(
      //   "🚀 ~ AuthController ~ login ~ attributeName:",
      //   typeof attributeName
      // );
      // Validate if all required attributes are present in the request body
      const validation = validateAttributes(request.body, [
        attributeName,
        "password",
      ]);
      if (validation !== null) {
        // If any attribute is missing, return a 400 error response
        return createResponse(response, 400, validation);
      }

      // Escape all attributes to prevent XSS attacks
      const escapedData = escapeAttributes(request.body, [
        "email",
        "password",
        "pushToken",
      ]);

      if (escapedData.phoneNumber) {
        // verify if phone number is a number
        if (isNaN(Number(escapedData[attributeName]))) {
          return createResponse(response, 400, "Invalid phone number");
        }
      }

      if (escapedData.email) {
        // Validate if the provided email address is valid
        const emailValidation = validateEmail(escapedData[attributeName]);
        if (emailValidation !== null) {
          // If the email address is invalid, return a 400 error response
          return createResponse(response, 400, emailValidation);
        }
      }

      // Authenticate the user
      return this.authenticateUser.call(
        this,
        attributeName,
        escapedData[attributeName].toLowerCase(),
        escapedData.password,
        response,
        escapedData.pushToken
      );
    } catch (err) {
      console.error(err.message);
      return createResponse(response, 500, "Server error");
    }
  }
}
