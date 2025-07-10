import { Intents } from 'oceanic.js';

interface DatabaseConfig {
  storage: string;
  dialect: 'sqlite';
  logging: boolean;
  retry: {
    max: number;
    match: RegExp[];
    backoffBase: number;
    backoffExponent: number;
  };
}

interface CommandsConfig {
  defaultCooldown: number;
}

interface PermissionsConfig {
  default: string[];
  admin: string[];
}

interface Config {
  token: string;
  userToken: string;
  intents: (keyof typeof Intents)[];
  commands: CommandsConfig;
  permissions: PermissionsConfig;
  database: DatabaseConfig;
}

const config: Config = {
  token: "...",
  userToken: "...",
  intents: [
    "GUILDS",
    "GUILD_MESSAGES",
    "GUILD_MEMBERS",
    "GUILD_PRESENCES",
    "GUILD_MESSAGE_REACTIONS",
    "GUILD_VOICE_STATES",
    "MESSAGE_CONTENT",
    "DIRECT_MESSAGES",
    "DIRECT_MESSAGE_REACTIONS",
    "GUILD_INTEGRATIONS"
  ],

  commands: {
    defaultCooldown: 3,
  },

  permissions: {
    default: [],
    admin: ["ADMINISTRATOR"],
  },

  database: {
    storage: "./velish.sqlite",
    dialect: "sqlite",
    logging: false,
    retry: {
      max: 10,
      match: [
        /Deadlock/i,
        /SequelizeConnectionError/
      ],
      backoffBase: 1000,
      backoffExponent: 1.5
    }
  }
};

export default config;