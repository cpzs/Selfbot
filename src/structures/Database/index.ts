import {
  Model,
  ModelStatic,
  Sequelize,
  Transaction,
  WhereOptions,
} from "sequelize";
import path from "path";
import fs from "fs";
import config from "@/config";

interface VelAttributes {
  createdAt?: Date;
  updatedAt?: Date;
  [key: string]: any;
}

export class Vel extends Model<VelAttributes> {
  static initialize(sequelize: Sequelize, attributes: any): ModelStatic<any> {
    return super.init(attributes, {
      sequelize,
      timestamps: true,
      underscored: true,
      modelName: this.name,
    });
  }

  toJSON(): VelAttributes {
    const values = { ...this.get() };
    delete values.createdAt;
    delete values.updatedAt;
    return values;
  }
}

interface FindOrCreateOptions {
  where: WhereOptions;
  defaults?: any;
  transaction?: Transaction;
}

export class DatabaseManager {
  client: any;
  models: Map<string, ModelStatic<any>>;
  sequelize: Sequelize;

  constructor(client: any) {
    this.client = client;
    this.models = new Map();

    this.sequelize = new Sequelize({
      dialect: config.database.dialect,
      storage: config.database.storage,
      logging: config.database.logging,
      retry: config.database.retry,
      pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000,
      },
    });
  }

  async init(): Promise<boolean> {
    try {
      await this.sequelize.authenticate();
      await this.loadModels();
      await this.sequelize.sync();
      return true;
    } catch (error) {
      throw error;
    }
  }

  async loadModels(): Promise<void> {
    try {
      const modelsPath = path.join(__dirname, "models");
      const modelFiles = fs
        .readdirSync(modelsPath)
        .filter((file) => file.endsWith(".js") || file.endsWith(".ts"));

      for (const file of modelFiles) {
        const modelPath = path.join(modelsPath, file);
        const ModelClass = require(modelPath);

        if (
          typeof ModelClass === "function" &&
          ModelClass.prototype instanceof Vel
        ) {
          const model = ModelClass.initialize(this.sequelize);
          this.models.set(ModelClass.name, model);
        }
      }

      for (const [, model] of this.models) {
        if (typeof (model as any).associate === "function") {
          (model as any).associate(this.models);
        }
      }
    } catch (error) {
      throw error;
    }
  }

  getModel(modelName: string): ModelStatic<any> {
    const model = this.models.get(modelName);
    if (!model) {
      throw new Error(`Model ${modelName} not found`);
    }
    return model;
  }

  async create(modelName: string, data: any): Promise<any> {
    try {
      const Model = this.getModel(modelName);
      return await Model.create(data);
    } catch (error) {
      throw error;
    }
  }

  async findOne(modelName: string, options: any): Promise<any> {
    try {
      const Model = this.getModel(modelName);
      return await Model.findOne(options);
    } catch (error) {
      throw error;
    }
  }

  async findAll(modelName: string, options: any): Promise<any[]> {
    try {
      const Model = this.getModel(modelName);
      return await Model.findAll(options);
    } catch (error) {
      throw error;
    }
  }

  async update(
    modelName: string,
    data: any,
    where: WhereOptions
  ): Promise<[number, any[]]> {
    try {
      const Model = this.getModel(modelName);
      const result = await Model.update(data, {
        where,
        individualHooks: true,
      });

      if (result[0] !== 0) {
        await Model.findOne({ where });
      }

      return [result[0], []];
    } catch (error) {
      throw error;
    }
  }

  async delete(modelName: string, where: WhereOptions): Promise<number> {
    try {
      const Model = this.getModel(modelName);
      return await Model.destroy({ where });
    } catch (error) {
      throw error;
    }
  }

  async findOrCreate(
    modelName: string,
    options: FindOrCreateOptions
  ): Promise<[any, boolean]> {
    try {
      const Model = this.getModel(modelName);

      if (!options?.where) {
        throw new Error(
          `findOrCreate: options.where est requis pour ${modelName}`
        );
      }

      const findOptions: any = {
        where: options.where,
        defaults: options.defaults || {},
      };

      if (options.transaction) {
        findOptions.transaction = options.transaction;
      }

      const result = await Model.findOrCreate(findOptions);

      return result;
    } catch (error) {
      throw error;
    }
  }

  async transaction<T>(callback: (t: Transaction) => Promise<T>): Promise<T> {
    const t = await this.sequelize.transaction();
    try {
      const result = await callback(t);
      await t.commit();
      return result;
    } catch (error) {
      await t.rollback();
      throw error;
    }
  }

  async isTableEmpty(modelName: string): Promise<boolean> {
    try {
      return (await this.getModel(modelName).count()) === 0;
    } catch (error) {
      throw error;
    }
  }

  async truncateTable(modelName: string): Promise<void> {
    try {
      await this.getModel(modelName).destroy({
        truncate: true,
      });
    } catch (error) {
      throw error;
    }
  }

  async getModelCount(modelName: string): Promise<number> {
    try {
      return await this.getModel(modelName).count();
    } catch (error) {
      throw error;
    }
  }

  async cleanup(): Promise<void> {
    try {
      await this.sequelize.close();
    } catch (error) {
      throw error;
    }
  }

  clearCache(): void {
    try {
      if (this.sequelize && this.models) {
        for (const [, model] of this.models) {
          if (model && typeof model === "object") {
            if ((model as any).Instance && (model as any).Instance._cache) {
              (model as any).Instance._cache.clear();
            }
          }
        }
      }
    } catch (error) {}
  }
}
