import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import cookieParser from "cookie-parser";
import { I18nValidationExceptionFilter, I18nValidationPipe } from "nestjs-i18n";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    cors: {
      origin: process.env.FRONT_BASE_URL,
      methods: ["GET", "POST", "PUT", "DELETE"],
      credentials: true,
    },
  });

  // SWAGGER
  const config = new DocumentBuilder()
    .setTitle("Food")
    .setDescription("The food API description")
    .setVersion("1.0")
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("swagger", app, documentFactory);

  // I18N
  app.useGlobalPipes(
    new I18nValidationPipe({
      whitelist: true,
    }),
  );
  app.useGlobalFilters(
    new I18nValidationExceptionFilter({
      detailedErrors: false,
    }),
  );

  app.use(cookieParser());

  await app.startAllMicroservices();
  await app.listen(process.env.NEST_PORT || 3000);
}
void bootstrap();
