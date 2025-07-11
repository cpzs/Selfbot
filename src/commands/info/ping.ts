import {
  ApplicationCommandTypes,
  CommandInteraction,
  CreateApplicationCommandOptions,
} from "oceanic.js";
import { Velish } from "../../structures/client";
import { Command } from "../../types/command";

export default class PingCommand implements Command {
  client: Velish;

  constructor(client: Velish) {
    this.client = client;
  }

  get name(): string {
    return "ping";
  }

  get data(): any {
    return {
      name: this.name,
      description: "Répond avec pong",
      type: ApplicationCommandTypes.CHAT_INPUT,
    };
  }

  async execute(interaction: CommandInteraction): Promise<void> {
    try {
      void (await interaction.createMessage({
        content: "Pong",
      }));
    } catch (error: any) {
      if (error.code === 10062) {
      } else {
        throw error;
      }
    }
  }
}
