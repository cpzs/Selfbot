import colors from 'colors';
import { CommandInteraction, Interaction } from 'oceanic.js';
import { Velish } from '../../structures/Client';
import { Event } from '../../types/Event';

export default class InteractionCreateEvent implements Event<'interactionCreate'> {
  client: Velish;

  constructor(client: Velish) {
    this.client = client;
  }

  get name(): 'interactionCreate' {
    return "interactionCreate";
  }

  async execute(interaction: Interaction): Promise<void> {
    if (!interaction.isCommandInteraction()) return;

    const command = this.client.slashCommands.get(interaction.data.name);
    if (!command) return;
    console.log(`Commande utilisée => ${interaction.data.name}`.yellow);

    try {
      void await command.execute(interaction as CommandInteraction, this.client);
    } catch (error) {
      console.error(`❌ Erreur => ${interaction.data.name}:`.red, error);
      const errorMessage = {
        content: "Erreur avec la commande",
        flags: 64 as any
      };

      try {
        if (interaction.acknowledged) {
          void await interaction.createFollowup(errorMessage);
        } else {
          void await interaction.createMessage(errorMessage);
        }
      } catch (responseError: any) {
        if (responseError.code === 10062) {
          console.log("⚠️ Interac expiré".yellow);
        } else {
          console.error(responseError);
        }
      }
    }
  }
}