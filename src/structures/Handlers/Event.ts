import fs from "fs/promises";
import path from "path";
import { Velish } from "../client";
import { Event } from "../../types/Event";

export class EventHandler {
  private client: Velish;
  constructor(client: Velish) {
    this.client = client;
  }

  async loadEvents(): Promise<void> {
    const eventsPath = path.join(__dirname, "../../events");
    const eventFiles = await this.getAllFiles(eventsPath);

    for (const file of eventFiles) {
      if (!file.endsWith(".ts")) continue;
      const EventClass = require(file)?.default || require(file);
      if (typeof EventClass !== "function") {
        console.warn(`⚠️ ${file}`);
        continue;
      }

      const event = new EventClass(this.client) as Event;
      if (!event.name) {
        console.warn(`⚠️ ${file}`);
        continue;
      }

      if (event.once) {
        void this.client.once(
          event.name,
          (...args) => void event.execute(...args)
        );
      } else {
        void this.client.on(
          event.name,
          (...args) => void event.execute(...args)
        );
      }
      console.log(`🟢 ${event.name}`);
    }
  }

  async getAllFiles(
    dirPath: string,
    arrayOfFiles: string[] = []
  ): Promise<string[]> {
    const files = await fs.readdir(dirPath);

    for (const file of files) {
      const filePath = path.join(dirPath, file);
      const stat = await fs.stat(filePath);

      if (stat.isDirectory()) {
        arrayOfFiles = await this.getAllFiles(filePath, arrayOfFiles);
      } else {
        arrayOfFiles.push(filePath);
      }
    }

    return arrayOfFiles;
  }
}
