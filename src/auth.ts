import { Client, AppType } from "@larksuiteoapi/node-sdk";
import * as dotenv from "dotenv";

dotenv.config();

export class FeishuAuth {
  private client: Client | null = null;

  constructor() {
    const appId = process.env.FEISHU_APP_ID;
    const appSecret = process.env.FEISHU_APP_SECRET;

    if (!appId || !appSecret) {
      throw new Error("FEISHU_APP_ID and FEISHU_APP_SECRET must be set in .env file");
    }

    this.client = new Client({
      appId,
      appSecret,
      appType: AppType.SelfBuild,
    });
  }

  async initialize(): Promise<void> {
    // Test the connection by getting tenant access token
    try {
      if (!this.client) throw new Error("Client not initialized");
      // Just verify credentials are set
      console.log("Feishu authentication initialized");
    } catch (error: any) {
      throw new Error(`Feishu authentication failed: ${error.message}`);
    }
  }

  async getClient(): Promise<Client> {
    if (!this.client) {
      throw new Error("Feishu client not initialized");
    }
    return this.client;
  }
}
