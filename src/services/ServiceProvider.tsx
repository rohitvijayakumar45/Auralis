import type { ReactNode } from "react";
import type { ServiceRegistry } from "./contracts";
import { ServiceContext } from "./context";

export function ServiceProvider({
  services,
  children
}: {
  services: ServiceRegistry;
  children: ReactNode;
}) {
  return (
    <ServiceContext.Provider value={services}>{children}</ServiceContext.Provider>
  );
}
