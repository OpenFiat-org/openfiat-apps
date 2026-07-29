import { createApp } from "./app.js";

// 7091: the node owns 7080 and a local cluster takes 7080-7082, so the
// explorer's two services sit just above that range (indexer 7090, api 7091).
const port = Number(process.env.PORT ?? 7091);
createApp().listen(port, () => {
  console.log(`openfiat-explorer-api listening on :${port}`);
});
