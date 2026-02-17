// Wallet Connect Implementation
import { AppConfig, UserSession, showConnect } from "@stacks/connect";
import { StacksMocknet } from "@stacks/network";

const appConfig = new AppConfig(["store_write", "publish_data"]);
export const userSession = new UserSession({ appConfig });
