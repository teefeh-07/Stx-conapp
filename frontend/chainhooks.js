// Chainhooks Client Integration
import { ChainhooksClient } from "@hirosystems/chainhooks-client";

const client = new ChainhooksClient();

export const subscribe = (topic) => {
  client.subscribe(topic, (event) => {
    console.log("Received event:", event);
  });
};
