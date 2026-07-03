import { createApp } from "./app.js";
import { getConfig } from "./config.js";

const config = getConfig();
createApp().listen(config.port, "0.0.0.0", () => {
  console.log(`Auralis API listening on http://0.0.0.0:${config.port}`);
});
