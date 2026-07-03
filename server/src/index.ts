import { createApp } from "./app.js";
import { getConfig } from "./config.js";

const config = getConfig();
createApp().listen(config.port, () => {
  console.log(`Auralis API listening on http://127.0.0.1:${config.port}`);
});
