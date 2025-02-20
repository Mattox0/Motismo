/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeOrmModule, TypeOrmModuleAsyncOptions } from "@nestjs/typeorm";
import { AcceptLanguageResolver, I18nModule, QueryResolver } from "nestjs-i18n";
import * as path from "node:path";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [".env.local", ".env"],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: "postgres",
        host: configService.get("POSTGRES_HOST"),
        port: +configService.get("POSTGRES_PORT"),
        username: configService.get("POSTGRES_USER"),
        password: configService.get("POSTGRES_PASSWORD"),
        database: configService.get("POSTGRES_DATABASE"),
        entities: [],
        autoLoadEntities: true,
        synchronize: true,
        extra: {
          ssl: configService.get("POSTGRES_SSL") === "true",
        },
        subscribers: [],
      }),
      inject: [ConfigService],
    } as TypeOrmModuleAsyncOptions),
    I18nModule.forRoot({
      fallbackLanguage: "fr",
      fallbacks: {
        "fr-*": "fr",
      },
      loaderOptions: {
        path: path.join(__dirname, "/i18n/"),
        watch: true,
      },
      typesOutputPath: path.join(
        __dirname,
        "../src/generated/i18n.generated.ts",
      ),
      resolvers: [
        { use: QueryResolver, options: ["lang", "locale"] },
        AcceptLanguageResolver,
      ],
    }),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
