import {
  AppDataSource,
  Request,
  Response,
  User,
  bcrypt,
  createUser,
  omit,
  validateEmailAndVerficationEmail,
} from "../../../services/imports";
import {
  createResponse,
  escapeAttributes,
  omitAttributes,
  validateAttributes,
  validateEmail,
} from "../../helper/Helpers";

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
      console.log("🚀 ~ AuthController ~ register ~ res:", res);

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
  async authenticateUser(
    attributeName: string,
    attributeValue: string,
    password: string,
    response: Response,
    pushToken?: string
  ) {
    // Define attributes that are required for user authentication
    const attributes = [attributeName, "password"];

    // Escape all attributes to prevent XSS attacks
    const escapedData = escapeAttributes(
      { [attributeName]: attributeValue, password },
      attributes
    );

    // Check if a user with the provided attribute value exists in the database
    const whereClause = { [attributeName]: escapedData[attributeName] };
    const user = await this.userRepository.findOne({ where: whereClause });
    console.log("🚀 ~ AuthController ~ user:", user);

    if (!user) {
      // If no user exists with the provided attribute value, return a 400 error response
      return createResponse(response, 401, " line 86 Invalid credentials");
    }

    // Check if the provided password matches the hashed password stored in the database

    const passwordMatches = await bcrypt.compare(
      escapedData.password,
      user.password
    );
    console.log("🚀 ~ AuthController ~ passwordMatches:", passwordMatches);
    console.log(
      "🚀 ~ AuthController ~ escapedData.password:",
      escapedData.password
    );
    console.log("🚀 ~ AuthController ~ user.password:", user.password);
    if (!passwordMatches) {
      // If the password is incorrect, return a 400 error response
      return createResponse(response, 401, " line 98 Invalid credentials");
    }

    // if (user.verified == false) {
    //   // check if there is a verification code with the user id
    //   const registryCodeRepository =
    //     AppDataSource.getMongoRepository(RegistryCode);
    //   const registryCode = await registryCodeRepository.findOne({
    //     where: { userId: user.id.toString() },
    //   });
    //   if (registryCode) {
    //     registryCodeRepository.delete({ userId: user.id.toString() });
    //   }
    //   validateEmailAndSendVerficationEmail(user);
    //   const resData = {
    //     user: omit(user, omitAttributes),
    //     message: "User not verified",
    //     isCodeExpired: !Boolean(registryCode),
    //   };
    //   return createResponse(response, 206, resData);
    // }
    let token: string;
    // let company: Company;
    // if (ObjectID.isValid(companyId)) {
    //   const companyRepo = AppDataSource.getMongoRepository(Company);
    //   company = await companyRepo.findOne(new ObjectID(companyId));
    // }
    // if (company) {
    //   // Create a JWT token for the authenticated user
    //   token = jwt.sign({ id: user.id, companyId: company.id }, secret, {
    //     expiresIn,
    //   });
    // } else {
    //   token = jwt.sign({ id: user.id }, secret, { expiresIn });
    // }

    if (pushToken) {
      // save pushToken to user pushTokens array
      const pushTokens = user.pushTokens ?? [];
      if (!pushTokens.includes(pushToken)) {
        pushTokens.push(pushToken);
        await this.userRepository.update({ id: user.id }, { pushTokens });
      }
    }

    // const resCompanies: Partial<Company>[] = [];
    // if (user.companiesId) {
    //   for (let index = 0; index < user.companiesId.length; index++) {
    //     const compId = user.companiesId[index];
    //     const companyRepo = AppDataSource.getMongoRepository(Company);
    //     const _company = await companyRepo.findOne(new ObjectID(compId));
    //     if (_company) {
    //       resCompanies.push({
    //         id: _company.id,
    //         name: _company.name,
    //       });
    //     }
    //   }
    // }

    // user.companiesId = undefined;
    // //@ts-ignore
    // user.companies = resCompanies;
    // // Return a success response along with the user object (excluding password) and the JWT token
    const resData = {
      user: omit(user, omitAttributes),
      token: token,
    };
    const jsonResponse = createResponse(response, 200, resData);
    return jsonResponse;
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
      console.log(
        "🚀 ~ AuthController ~ login ~ attributeName:",
        typeof attributeName
      );
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
        "companyId",
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
