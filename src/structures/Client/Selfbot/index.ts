import { Client } from 'discord.js-selfbot-v13';
import config from '../../../config';

declare module 'discord.js-selfbot-v13' {
  interface ClientOptions {
    checkUpdate?: boolean;
  }
}

export class SelfbotClient {
  private client: Client;

  constructor() {
    this.client = new Client({
      checkUpdate: false,
    });

    this.setupListeners();
  }

  private setupListeners(): void {
    this.client.on('ready', () => {
      console.log(`Selfbot co => ${this.client.user?.tag}`);
    });
  }

  public async start(): Promise<void> {
    try {
      await this.client.login(config.userToken);
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  public getClient(): Client {
    return this.client;
  }

  public async stop(): Promise<void> {
    try {
      this.client.destroy();
      console.log('Selfbot déco');
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}