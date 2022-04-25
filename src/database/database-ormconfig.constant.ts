import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import config from 'config';

const settings: IDBSettings = config.get('DB_SETTINGS');

export function getOrmConfig(): TypeOrmModuleOptions {
  let ormConfig: TypeOrmModuleOptions;
  if (process.env.NODE_ENV === 'production') {
    ormConfig = {
      type: 'mysql',
      ...settings,
      database: `${settings.database}`,
      entities: [__dirname + '../../**/*.entity{.ts,.js}'],
      migrations: [__dirname + '/migrations/**/*{.ts,.js}'],
      migrationsRun: false,
      maxQueryExecutionTime: 10 /** To log request runtime */,
      synchronize: false,
      logging: ['error'],
      // cache: {
      //   type: 'ioredis',
      //   options: {
      //     host: 'platform-001.91qhwr.0001.apne1.cache.amazonaws.com',
      //     port: 6379,
      //   },
      // },
      cli: {
        migrationsDir: __dirname + '/migrations/**/*{.ts,.js}',
      },
    };
  } else {
    ormConfig = {
      type: 'mysql',
      ...settings,
      database: `${settings.database}`,
      entities: [__dirname + '../../**/*.entity{.ts,.js}'],
      migrations: [__dirname + '/migrations/**/*{.ts,.js}'],
      migrationsRun: false,
      maxQueryExecutionTime: 10 /** To log request runtime */,
      synchronize: false,
      // cache: {
      //   type: 'ioredis',
      //   options: {
      //     host: 'platform-001.91qhwr.0001.apne1.cache.amazonaws.com',
      //     port: 6379,
      //   },
      // },
      cli: {
        migrationsDir: __dirname + '/migrations/**/*{.ts,.js}',
      },
    };
  }
  return ormConfig;
}
