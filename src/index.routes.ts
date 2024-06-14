import { ClientsRoutes } from "./routes/private/clients";
import { PublicRoutes } from "./routes/public";

export const routes = [...PublicRoutes, ...ClientsRoutes];
