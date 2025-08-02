import { DataTypes, Sequelize } from "sequelize";
import { Vel, DatabaseManager } from "@/structures/database/index";

interface KickLimitAttributes {
  guildId: string;
  limit: number;
  timeWindow: number;
  createdAt?: Date;
  updatedAt?: Date;
}

interface KickLimitCreationAttributes {
  guildId: string;
  limit?: number;
  timeWindow?: number;
}

export class KickLimit extends Vel {
  declare guildId: string;
  declare limit: number;
  declare timeWindow: number;
  declare createdAt?: Date;
  declare updatedAt?: Date;

  constructor(values: KickLimitCreationAttributes = { guildId: "" }) {
    super();
    this.guildId = values.guildId;
    this.limit = values.limit || 3;
    this.timeWindow = values.timeWindow || 60000;
  }

  static initialize(sequelize: Sequelize) {
    return super.initialize(sequelize, {
      guildId: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      limit: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 3,
      },
      timeWindow: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 60000,
      },
    });
  }

  static async getGuildLimit(
    database: DatabaseManager,
    guildId: string
  ): Promise<any> {
    let limit = await database.findOne("KickLimit", {
      where: { guildId },
    });

    if (!limit) {
      limit = await database.create("KickLimit", {
        guildId,
        limit: 3,
        timeWindow: 60000,
      });
    }

    return limit;
  }

  static async updateGuildLimit(
    database: DatabaseManager,
    guildId: string,
    limit: number,
    timeWindow: number
  ): Promise<any> {
    const existingLimit = await database.findOne("KickLimit", {
      where: { guildId },
    });

    if (existingLimit) {
      await database.update(
        "KickLimit",
        {
          limit,
          timeWindow,
        },
        {
          guildId,
        }
      );

      return await database.findOne("KickLimit", {
        where: { guildId },
      });
    } else {
      return await database.create("KickLimit", {
        guildId,
        limit,
        timeWindow,
      });
    }
  }
}

export default KickLimit;
