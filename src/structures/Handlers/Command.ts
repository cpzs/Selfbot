import fs from "fs/promises";
import path from "path";
import { Velish } from "../Client";
import { Command } from "../../types/Command";

export class CommandHandler {
  private client: Velish;

  constructor(client: Velish) {
    this.client = client;
  }

  async loadCommands(): Promise<void> {
    const commandsPath = path.join(__dirname, "../../commands");
    const commandFiles = await this.getAllFiles(commandsPath);
    for (const file of commandFiles) {
      if (!file.endsWith(".ts")) continue;
      const CommandClass = require(file)?.default || require(file);
      if (typeof CommandClass !== 'function') {
        console.warn(`⚠️ ${file}`);
        continue;
      }

      const command = new CommandClass(this.client) as Command;

      if (!command.name) {
        console.warn(`⚠️ ${file}`);
        continue;
      }

      this.client.commands.set(command.name, command);
      if (command.data) {
        this.client.slashCommands.set(command.name, command);
      }

      console.log(`🟢 ${command.name}`);
    }
  }

  async getAllFiles(dirPath: string, arrayOfFiles: string[] = []): Promise<string[]> {
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