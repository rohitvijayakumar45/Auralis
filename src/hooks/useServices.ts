import { useContext } from "react";
import { ServiceContext } from "../services/context";

export function useServices() {
  const services = useContext(ServiceContext);
  if (!services) {
    throw new Error("ServiceProvider is required before using service hooks.");
  }
  return services;
}
