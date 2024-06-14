import { Request, Response } from "express";
import { AppDataSource } from "../../data-source";
import { Client } from "../../entity/Clients";
import {
  checkAuthorization,
  getDecodedAuthTokenFromHeaderOrFail,
} from "../../middleware/checkAuthorization";
import { PermissionsTypes } from "../../entity/Permission";
import {
  createResponse,
  escapeAttribute,
  escapeAttributes,
  validateAttributes,
} from "../../helper/Helpers";
import { ObjectId } from "mongodb";

export class ClientController {
  static readonly collectionName = Client.collectionName;
  //private collectionName = AppDataSource.getMongoRepository(Client);
  async create(request: Request, response: Response) {
    try {
      await checkAuthorization(
        ClientController.collectionName,
        PermissionsTypes.canCreate
      )(request, response, async () => {
        const requiredData = [
          "fullname",
          "email",
          "telephone",
          "address",
          "status",
        ];
        console.log("🚀 ~ ClientController ~ ) ~ requiredData:", requiredData);
        // Validate body
        const validation = validateAttributes(request.body, requiredData);
        console.log("🚀 ~ ClientController ~ ) ~ validation:", validation);
        const { userId } = await getDecodedAuthTokenFromHeaderOrFail(
          request,
          response
        );
        if (validation !== null) {
          // If any attribute is missing, return a 400 error response
          return createResponse(response, 400, validation);
        }
        // Escape all attributes to prevent XSS attacks
        const escapedData = escapeAttributes(request.body, requiredData);
        const clientRepo = AppDataSource.getMongoRepository(Client);
        const _client = new Client();
        escapedData.createdBy = userId;
        const newClient = await clientRepo.save(
          Object.assign(_client, escapedData)
        );
        const jsonResponse = createResponse(response, 200, {
          message: "Client created successfully",
          data: newClient,
        });
        return jsonResponse;
      });
    } catch (err) {
      console.log("🚀 ~ ClientController ~ create ~ err:", err);

      if (err.name == "InvalidInputError") {
        return createResponse(response, 400, err.message);
      } else {
        return createResponse(response, 500, "Server error");
      }
    }
  }
  async get(request: Request, response: Response) {
    try {
      await checkAuthorization(
        ClientController.collectionName,
        PermissionsTypes.canView
      )(request, response, async () => {
        const clientRepository = AppDataSource.getMongoRepository(Client);
        const clients = await clientRepository.find({
          order: { createdAt: "DESC" },
        });
        const jsonResponse = createResponse(response, 200, {
          message: "Clients retrieved successfully",
          data: clients,
        });
        return jsonResponse;
      });
    } catch (err) {
      console.error(err.message);
      if (err.name == "InvalidInputError") {
        return createResponse(response, 400, err.message);
      } else {
        return createResponse(response, 500, "Server error");
      }
    }
  }
  async getById(request: Request, response: Response) {
    try {
      await checkAuthorization(
        ClientController.collectionName,
        PermissionsTypes.canView
      )(request, response, async () => {
        const clientId = request.params.id;
        if (!ObjectId.isValid(clientId)) {
          return createResponse(response, 400, "Invalid client ID");
        }
        const clientRepository = AppDataSource.getMongoRepository(Client);
        const client = await clientRepository.findOneBy({
          _id: new ObjectId(clientId),
        });
        if (!client) {
          return createResponse(response, 404, "Client not found");
        }
        const jsonResponse = createResponse(response, 200, {
          message: "Client retrieved successfully",
          data: client,
        });
        return jsonResponse;
      });
    } catch (err) {
      console.error(err.message);
      if (err.name == "InvalidInputError") {
        return createResponse(response, 400, err.message);
      } else {
        return createResponse(response, 500, "Server error");
      }
    }
  }

  async update(request: Request, response: Response) {
    try {
      await checkAuthorization(
        ClientController.collectionName,
        PermissionsTypes.canUpdate
      )(request, response, async () => {
        const clientId = escapeAttribute(request.params.id);
        const clientRepository = AppDataSource.getMongoRepository(Client);
        if (!ObjectId.isValid(clientId)) {
          return createResponse(response, 400, "Invalid client id");
        }
        const _client = await clientRepository.findOne({
          where: { _id: new ObjectId(clientId) },
        });
        if (!_client) {
          return createResponse(response, 404, "Client not found");
        }
        const dataToUpdate = [
          "fullname",
          "email",
          "telephone",
          "address",
          "status",
        ];
        // Escape body
        const escapedData = escapeAttributes(request.body, dataToUpdate);
        // Update the client, set escaped data
        Object.assign(_client, escapedData);
        await clientRepository.save(_client);
        const jsonResponse = createResponse(response, 200, {
          message: "Client updated successfully",
          client: _client,
        });
        return jsonResponse;
      });
    } catch (error) {
      console.error(error.message);
      if (error.name == "InvalidInputError") {
        return createResponse(response, 400, error.message);
      } else {
        return createResponse(response, 500, "Server error");
      }
    }
  }

  async delete(request: Request, response: Response) {
    try {
      await checkAuthorization(
        ClientController.collectionName,
        PermissionsTypes.canDelete
      )(request, response, async () => {
        const clientId = request.params.id;
        const clientRepository = AppDataSource.getMongoRepository(Client);
        if (!ObjectId.isValid(clientId)) {
          return createResponse(response, 400, "Invalid client id");
        }
        const _client = await clientRepository.findOne({
          where: { _id: new ObjectId(clientId) },
        });
        if (!_client) {
          return createResponse(response, 404, "Client not found");
        }
        await clientRepository.delete(new ObjectId(_client.id));
        const jsonResponse = createResponse(response, 200, {
          data: "Client deleted successfully",
        });
        return jsonResponse;
      });
    } catch (err) {
      console.error(err.message);
      if (err.name == "InvalidInputError") {
        return createResponse(response, 400, err.message);
      } else {
        return createResponse(response, 500, "Server error");
      }
    }
  }
}
