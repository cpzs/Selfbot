import { ClientEvents } from "oceanic.js";
import { Velish } from "../structures/client";

export interface Event<K extends keyof ClientEvents = any> {
  client: Velish;
  name: K;
  once?: boolean;
  execute(...args: ClientEvents[K]): Promise<void>;
}
