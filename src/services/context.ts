import { createContext } from "react";
import type { ServiceRegistry } from "./contracts";

export const ServiceContext = createContext<ServiceRegistry | null>(null);
