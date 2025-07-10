import { Velish } from '../../structures/Client';
import { Event } from '../../types/Event';

export default class ReadyEvent implements Event<'ready'> {
  client: Velish;

  constructor(client: Velish) {
    this.client = client;
  }

  get name(): 'ready' {
    return "ready";
  }

  get once(): boolean {
    return true;
  }

  async execute(): Promise<void> {
    console.log(`Connecté => ${this.client.user!.username}`.green);
    void this.client.editStatus("idle", [{
      name: `les membres`,
      type: 3
    }]);

    try {
      const existingCommands = await this.client.application.getGlobalCommands();
      for (const command of existingCommands) {
        void await this.client.application.deleteGlobalCommand(command.id);
      }

      for (const command of this.client.slashCommands.values()) {
        if (command.data) {
          void await this.client.application.createGlobalCommand(command.data as any);
        }
      }
    } catch (error) {
      console.error(error);
    }
  }
}