import { Client } from "oceanic.js";
import { EventHandler } from "@/structures/handlers/event";
import { CommandHandler } from "@/structures/handlers/command";
import config from "@/config";
import { DatabaseManager } from "@/structures/database";
import { Command } from "@/types/command";
import { SelfbotClient } from "@/structures/client/bot";

export class Velish extends Client {
  public commands: Map<string, Command>;
  public slashCommands: Map<string, Command>;
  public config: typeof config;
  public database: DatabaseManager;
  public eventHandler: EventHandler;
  public commandHandler: CommandHandler;
  public selfbot: SelfbotClient;

  constructor() {
    super({
      auth: `Bot ${config.token}`,
      gateway: {
        intents: config.intents,
      },
    });

    this.commands = new Map();
    this.slashCommands = new Map();
    this.config = config;
    this.database = new DatabaseManager(this);
    this.eventHandler = new EventHandler(this);
    this.commandHandler = new CommandHandler(this);
    this.selfbot = new SelfbotClient();
    this.selfbot.setMainClient(this);
  }

  async start(): Promise<void> {
    try {
      await this.database.init();
      console.log("DB co");
      await this.eventHandler.loadEvents();
      await this.commandHandler.loadCommands();
      await this.connect();

      try {
        await this.selfbot.start();
      } catch (selfbotError) {
        console.error(selfbotError);
      }
    } catch (error) {
      console.error(error);
      void process.exit(1);
    }
  }
}
