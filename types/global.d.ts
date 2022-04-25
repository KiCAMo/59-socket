interface IDBSettings {
  // readonly master: any;
  // readonly slave: any;
  readonly username: string;
  readonly password: string;
  readonly database: string;
  readonly port: number;
  readonly host: string;
}

interface ILogSettings {
  readonly level: string;
  readonly silence: string[];
}

interface IJwtSettings {
  readonly secretKey: string;
  readonly expiresIn: number;
  readonly algorithms: string[];
}

interface IAppSettings {
  readonly port: number;
  readonly socketPort: number;
  readonly socketPingInterval: number;
  readonly socketPinkTimeout: number;
  readonly socketIoPath: string;
  readonly bodyLimit: string;
  readonly bodyParameterLimit: number;
}

interface ICorsSettings {
  readonly allowedOrigins: string[];
  readonly allowedUrls: string[];
  readonly allowedPaths: string[];
  readonly allowedMethods: string[];
  readonly allowedCredentials: boolean;
}

interface IGraphqlSettings {
  readonly playground: boolean;
  readonly debug: boolean;
  readonly introspection: boolean;
  readonly installSubscriptionHandlers: boolean;
}

interface IRabbitMQSettings {
  readonly exchange: string;
  readonly name: string;
  readonly host: string;
  readonly vhost: string;
  readonly port: number;
  readonly username: string;
  readonly password: string;
  readonly INPLAY_LSPORTS_PID: string;
  readonly INPLAY_LSPORTS_GUID: string;
}

interface IRedisSettings {
  readonly use: boolean;
  readonly host: string;
  readonly port: number;
  readonly password?: string;
  readonly key?: string;
}

interface ITokenSetting {
  readonly url: string;
  readonly agentId: string;
  readonly apiKey: string;
}

interface ILotusSetting {
  readonly url: string;
  readonly apikey: string;
  readonly domain: string;
  readonly agent: string;
}

interface IMegaCasinoSetting {
  readonly url: string;
  readonly operatorId: string;
  readonly userIdPrefix: string;
  readonly userIdExp: string;
  readonly privateKey: string;
  readonly min: string;
  readonly units: string;
}

interface IAWSSetting {
  readonly AWS_S3_BUCKET_NAME: string;
  readonly AWS_ACCESS_KEY_ID: string;
  readonly AWS_SECRET_ACCESS_KEY: string;
  readonly AWS_REGION: string;
}
