import { CommandInteraction, PermissionName } from "oceanic.js";
import type { ApplicationCommandOptions } from "oceanic.js";
import { Velish } from "../structures/Client";

export interface Command {
  client: Velish;
  name: string;
  data?: ApplicationCommandOptions;
  permissions?: PermissionName[];
  execute(interaction: CommandInteraction, client: Velish): Promise<void>;
}