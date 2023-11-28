import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import {
  DocumentBuilder,
  SwaggerCustomOptions,
  SwaggerDocumentOptions,
  SwaggerModule,
} from "@nestjs/swagger";
import { OperationSorter, TagSorter } from "./utils/swagger.sort";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix("api");
  app.enableCors();

  const swaggerConfig = new DocumentBuilder()
    .addServer("http://213.136.73.128")
    .addServer("http://localhost:8080")
    .setBasePath("api")
    .setTitle("Scouting API")
    .setDescription("The Scouting API description")
    .setVersion("1.0")
    .addBearerAuth(
      {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
      "access_token",
    )
    .build();

  const documentOptions: SwaggerDocumentOptions = {
    operationIdFactory: (controllerKey: string, methodKey: string) => methodKey,
  };

  const customOptions: SwaggerCustomOptions = {
    swaggerUrl: "api/swagger-json",
    swaggerOptions: {
      tagsSorter: TagSorter,
      operationsSorter: OperationSorter,
      filter: true,
      tryItOutEnabled: true,
    },
  };
  const document = SwaggerModule.createDocument(
    app,
    swaggerConfig,
    documentOptions,
  );
  SwaggerModule.setup("api/swagger", app, document, customOptions);

  await app.listen(8080);
}
bootstrap();
