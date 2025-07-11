import { Client } from 'discord.js-selfbot-v13';
import config from '../../../config';
declare module 'discord.js-selfbot-v13' {
  interface ClientOptions {
    checkUpdate?: boolean;
  }
}

export class SelfbotClient {
  private client: Client;
  private mainClient: any;

  constructor() {
    this.client = new Client({
      checkUpdate: false,
    });

    this.setupListeners();
  }

  private setupListeners(): void {
    this.client.on('ready', () => {
      console.log(`Selfbot co => ${this.client.user?.tag}`);
      if (this.mainClient) {
        this.sendConnectionEmbed();
      }
    });
  }

  public setMainClient(client: any): void {
    this.mainClient = client;
  }

  private async sendConnectionEmbed(): Promise<void> {
    try {
      const channelId = '1393007186602496082';
      const channel = this.mainClient.getChannel(channelId);
      await channel.createMessage({
        embeds: [{
          color: 0x000,
          description: `Selfbot co sur le client \`${this.client.user?.tag || 'Inconnu'} (${this.client.user?.id || 'Inconnu'})\` le ${new Date().toLocaleString('fr-FR')}`,
        }]
      });
    } catch (error) {
      console.error(error);
    }
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