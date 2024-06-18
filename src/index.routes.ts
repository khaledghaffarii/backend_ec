import { ClientsRoutes } from "./routes/private/clients";
import { MeRoutes } from "./routes/private/me";
import { PublicRoutes } from "./routes/public";

export const routes = [...PublicRoutes, ...ClientsRoutes, ...MeRoutes];
