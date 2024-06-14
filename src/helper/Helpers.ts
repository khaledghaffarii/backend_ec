import { NextFunction, Request, Response } from "express";
import rateLimit from "express-rate-limit";
import validator from "validator";
export const logRequest = (req: Request, res: Response, next: NextFunction) => {
  console.log(
    `${req.ip} [${new Date().toISOString()}] ${req.method} ${req.url}`
  );
  next();
};
export const omitAttributes = ["password"];
export const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 50, // limit each IP to 50 requests per windowMs
});

export const corsOptions = {
  origin: "*",
  optionsSuccessStatus: 200,
};
interface IRoute {
  route: string;
  method: string;
  controller: any;
  action: string;
  middleware?: any;
}
// This function takes in an email string and validates it using the `isEmail`
// function from the `validator` package. If the email is invalid, it returns
// a string error message. Otherwise, it returns null.
export function validateEmail(email: string): string | null {
  const _validator = validator;

  // validate the email using `isEmail` function from validator
  if (!_validator.isEmail(email)) {
    return "Invalid email format";
  }

  // if email is valid, return null
  return null;
}
export class InvalidInputError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidInputError";
  }
}
export class AuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AuthError";
  }
}
export function createResponse(res: Response, status: number, data: any): any {
  if (status >= 200 && status < 300) {
    return res.status(status).json(data);
  } else {
    return res.status(status).json({ error: data });
  }
}
// This function takes in an object `data` and an array `attributes`,
// and checks if each attribute in the array exists in the object.
// If any attribute is missing, it returns a string indicating which
// attributes are missing. Otherwise, it returns null.

function validateAttribute(
  attribute: string | Record<string, any>,
  data: any
): string[] {
  const missingFields: string[] = [];

  if (typeof attribute === "string") {
    if (
      data === undefined ||
      !data.hasOwnProperty(attribute) ||
      data[attribute] === "" ||
      data[attribute] === null
    ) {
      missingFields.push(attribute);
    }
  } else if (typeof attribute === "object") {
    const attributeName = Object.keys(attribute)[0];
    const attributeValue = attribute[attributeName];
    if (Array.isArray(data[attributeName])) {
      if (data[attributeName].length === 0) {
        missingFields.push(attributeName);
      } else {
        missingFields.push(
          ...validateArray(
            attributeValue[0],
            data[attributeName],
            attributeName
          )
        );
      }
    } else if (Array.isArray(attributeValue)) {
      if (!Array.isArray(data[attributeName])) {
        missingFields.push(attributeName);
      } else {
        missingFields.push(
          ...validateArray(
            attributeValue[0],
            data[attributeName],
            attributeName
          )
        );
      }
    } else {
      if (data[attributeName] === undefined || data[attributeName] === null) {
        missingFields.push(attributeName);
      } else {
        missingFields.push(
          ...validateObject(attributeValue, data[attributeName])
        );
      }
    }
  }

  return missingFields;
}

function validateObject(attributes: Record<string, any>, obj: any): string[] {
  const missingFields: string[] = [];

  for (const [key, value] of Object.entries(attributes)) {
    if (typeof value === "string") {
      if (
        obj === undefined ||
        !obj.hasOwnProperty(key) ||
        obj[key] === "" ||
        obj[key] === null
      ) {
        missingFields.push(key);
      }
    } else if (typeof value === "object") {
      const nestedObj = obj[key];

      if (Array.isArray(nestedObj)) {
        missingFields.push(...validateArray(value[0], nestedObj, key));
      } else {
        missingFields.push(...validateObject(value, nestedObj));
      }
    }
  }

  return missingFields;
}

function validateArray(
  attributes: Record<string, any>,
  array: any[],
  attributeName: string
): string[] {
  const missingFields: string[] = [];

  array.forEach((item, index) => {
    const missingItemFields = validateObject(attributes, item);

    if (missingItemFields.length > 0) {
      missingItemFields.forEach((missingField) => {
        missingFields.push(` ${attributeName}[${index}]:${missingField}`);
      });
    }
  });

  return missingFields;
}

export function validateAttributes(
  data: any,
  attributes: (string | Record<string, any>)[]
): string | null {
  const missingFields: string[] = [];
  attributes.forEach((attribute) => {
    missingFields.push(...validateAttribute(attribute, data));
  });

  if (missingFields.length > 0) {
    return `Some fields are missing: ${missingFields.join(", ")}`;
  }

  return null;
}

export function escapeAttribute(value: any): any {
  // Check if the value is a string
  if (typeof value === "string") {
    // Validate the length of the string
    if (validator.isLength(value, { min: 0, max: 255 })) {
      // Escape the attribute value using `escape` function from validator
      return validator.escape(value);
    } else {
      // If the string is too long, throw an error or handle it in some way
      throw new Error(`Input is too long`);
    }
  } else if (Array.isArray(value)) {
    // If the value is an array, recursively escape each item in the array
    return escapeArray(value);
  } else if (typeof value === "object" && value !== null) {
    // If the value is an object, recursively escape each attribute in the object

    return escapeObject(value);
  } else {
    // If the value is not a string, array, or object, return it as is
    return value;
  }
}

export function escapeArray(array: any[]): any[] {
  // Recursively escape each item in the array
  return array.map((item) => escapeAttribute(item));
}

export function escapeObject(object: Record<string, any>): Record<string, any> {
  const escapedObject: Record<string, any> = {};

  // Recursively escape each attribute in the object
  for (const [key, value] of Object.entries(object)) {
    escapedObject[key] = escapeAttribute(value);
  }

  return escapedObject;
}
export interface IRoutes extends Array<IRoute> {}
export function escapeAttributes(
  data: any,
  attributes: (string | Record<string, any>)[]
): any {
  const escapedData: Record<string, any> = {};

  for (const attribute of attributes) {
    if (typeof attribute === "string") {
      // Escape the attribute value using `escapeAttribute` function
      const value = escapeAttribute(data[attribute]);
      if (value !== undefined) {
        escapedData[attribute] = value;
      }
    } else if (typeof attribute === "object" && attribute !== null) {
      const attributeName = Object.keys(attribute)[0];
      const attributeValue = attribute[attributeName];

      if (Array.isArray(attributeValue)) {
        if (!Array.isArray(data[attributeName])) {
          continue;
        } else {
          const value = validateArray(
            attributeValue[0],
            data[attributeName],
            attributeName
          );
          if (value.length > 0) {
            continue;
          }
          const escapedArray = escapeArray(data[attributeName]);
          if (escapedArray !== undefined) {
            escapedData[attributeName] = escapedArray;
          }
        }
      } else if (
        typeof attributeValue === "object" &&
        attributeValue !== null
      ) {
        if (!data.hasOwnProperty(attributeName)) {
          continue;
        }
        const value = escapeObject(data[attributeName]);
        if (value !== undefined) {
          escapedData[attributeName] = value;
        }
      } else {
        // If the attribute is not an object or array, escape it using `escapeAttribute` function
        const value = escapeAttribute(data[attributeName]);
        if (value !== undefined) {
          escapedData[attributeName] = value;
        }
      }
    }
  }

  return escapedData;
}
