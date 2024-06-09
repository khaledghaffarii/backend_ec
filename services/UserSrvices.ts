import { User } from "../src/entity/User";
import {
  InvalidInputError,
  escapeAttributes,
  omitAttributes,
  validateAttributes,
  validateEmail,
} from "../src/helper/Helpers";
import { bcrypt, AppDataSource, jwt_rounds, omit } from "./imports";

export async function validateEmailAndVerficationEmail(user: User) {
  const emailValidation = validateEmail(user.email);
  if (emailValidation !== null) {
    // If the email address is invalid, return a 400 error response
    throw new InvalidInputError(emailValidation);
  }
  const resData = {
    user: omit(user, omitAttributes),
    message: "Verification email  successfully",
  };
  return resData;
}
// export async function createUser(_user: any): Promise<User> {
//   // Define attributes that are required to create a new user
//   const attributes = [
//     "firstName",
//     "lastName",
//     "email",
//     "picture",
//     "phoneNumber",
//     "password",
//   ];
//   const requiredAttributes = ["firstName", "lastName", "email", "password"];

//   // Validate if all required attributes are present in the request body
//   const validation = validateAttributes(_user, requiredAttributes);
//   if (validation !== null) {
//     // If any attribute is missing, return a 400 error response
//     throw new InvalidInputError(validation);
//   }

//   // Escape all attributes to prevent XSS attacks
//   const escapedData = escapeAttributes(_user, attributes);

//   // Validate if the provided email address is valid
//   const emailValidation = validateEmail(escapedData.email);
//   if (emailValidation !== null) {
//     // If the email address is invalid, return a 400 error response
//     throw new InvalidInputError(emailValidation);
//   }
//   // verify if phone number is a number
//   if (_user.phoneNumber && isNaN(Number(escapedData.phoneNumber))) {
//     throw new InvalidInputError("Invalid phone number");
//   }

//   if (escapedData.password.length < 8) {
//     throw new InvalidInputError("Password must be at least 8 characters long");
//   }
//   // Check if a user with the same phone number already exists in the database
//   const userRepo = AppDataSource.getMongoRepository(User);
//   if (_user.phoneNumber) {
//     const existingUserWithPhoneNumber = await userRepo.findOne({
//       where: { phoneNumber: escapedData["phoneNumber"] },
//     });

//     if (existingUserWithPhoneNumber) {
//       // If a user with the same phone number exists, return a 400 error response
//       throw new InvalidInputError("Email or phone number already exists");
//     }
//   }
//   const sanitizedEmail = escapedData.email.toLowerCase();
//   // Check if a user with the same email address already exists in the database
//   const existingUserWithEmail = await userRepo.findOne({
//     where: { email: sanitizedEmail },
//   });

//   if (existingUserWithEmail) {
//     // If a user with the same email address exists, return a 400 error response
//     throw new InvalidInputError("Email or phone number already exists");
//   }

//   // Hash the password before storing it in the database
//   //const hashedPassword = await bcrypt.hash(_user.password, jwt_rounds);
//   const userProps = {
//     ...escapedData,
//     email: sanitizedEmail,
//     password: escapedData.password,
//     picture: escapedData.picture
//       ? `/uploads/${escapedData.picture}`
//       : "/uploads/default-user-avatar.png",
//   };
//   const user: User = Object.assign(new User(), userProps);

//   await userRepo.save(user);
//   return user;
// }
export async function createUser(_user: any): Promise<User> {
  // Define attributes that are required to create a new user
  const attributes = [
    "firstName",
    "lastName",
    "email",
    "picture",
    "phoneNumber",
    "password",
  ];
  const requiredAttributes = ["firstName", "lastName", "email", "password"];

  // Validate if all required attributes are present in the request body
  const validation = validateAttributes(_user, requiredAttributes);
  if (validation !== null) {
    // If any attribute is missing, return a 400 error response
    throw new InvalidInputError(validation);
  }

  // Escape all attributes to prevent XSS attacks
  const escapedData = escapeAttributes(_user, attributes);

  // Validate if the provided email address is valid
  const emailValidation = validateEmail(escapedData.email);
  if (emailValidation !== null) {
    // If the email address is invalid, return a 400 error response
    throw new InvalidInputError(emailValidation);
  }

  // Verify if phone number is a number
  if (_user.phoneNumber && isNaN(Number(escapedData.phoneNumber))) {
    throw new InvalidInputError("Invalid phone number");
  }

  if (escapedData.password.length < 8) {
    throw new InvalidInputError("Password must be at least 8 characters long");
  }

  // Check if a user with the same phone number already exists in the database
  const userRepo = AppDataSource.getMongoRepository(User);
  if (_user.phoneNumber) {
    const existingUserWithPhoneNumber = await userRepo.findOne({
      where: { phoneNumber: escapedData["phoneNumber"] },
    });

    if (existingUserWithPhoneNumber) {
      // If a user with the same phone number exists, return a 400 error response
      throw new InvalidInputError("Email or phone number already exists");
    }
  }
  const sanitizedEmail = escapedData.email.toLowerCase();

  // Check if a user with the same email address already exists in the database
  const existingUserWithEmail = await userRepo.findOne({
    where: { email: sanitizedEmail },
  });

  if (existingUserWithEmail) {
    // If a user with the same email address exists, return a 400 error response
    throw new InvalidInputError("Email or phone number already exists");
  }

  // Hash the password before storing it in the database
  const hashedPassword = await bcrypt.hash(escapedData.password, 10);
  escapedData.password = hashedPassword;

  // Create the user object with hashed password
  const userProps = {
    ...escapedData,
    email: sanitizedEmail,
    picture: escapedData.picture
      ? `/uploads/${escapedData.picture}`
      : "/uploads/default-user-avatar.png",
  };
  const user: User = Object.assign(new User(), userProps);

  await userRepo.save(user);
  return user;
}
