import { createAwsApiAdapters } from "./adapters/awsApi";
import { createServiceRegistry } from "./registry";

export function createConfiguredServices() {
  return createServiceRegistry(createAwsApiAdapters());
}
