import { createAwsApiAdapters } from "./adapters/awsApi";
import { createMockServiceAdapters } from "./adapters/mock";
import { createServiceRegistry } from "./registry";

export function createConfiguredServices() {
  if (import.meta.env.VITE_DATA_ADAPTER === "aws") {
    return createServiceRegistry(createAwsApiAdapters());
  }
  return createServiceRegistry(createMockServiceAdapters());
}
