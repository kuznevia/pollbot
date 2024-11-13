import dotenv from 'dotenv';

class EnvConfig {
  private static instance: EnvConfig;
  private envVariables: Record<string, string>;

  private constructor() {
    const envFile =
      process.env.NODE_ENV === 'production'
        ? '.env.production'
        : '.env.development';
    dotenv.config({ path: envFile });
    this.envVariables = Object.fromEntries(
      Object.entries(process.env).filter(([, value]) => value !== undefined)
    ) as Record<string, string>;
  }

  public static getInstance(): EnvConfig {
    if (!EnvConfig.instance) {
      EnvConfig.instance = new EnvConfig();
    }
    return EnvConfig.instance;
  }

  public get(key: string): string {
    const value = this.envVariables[key];
    if (value === undefined) {
      throw new Error(`Environment variable ${key} is not set`);
    }
    return value;
  }
}

export const envConfig = EnvConfig.getInstance();
