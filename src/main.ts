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

  const swaggerConfig = new DocumentBuilder()
    .setTitle("Scouting API")
    .setDescription("The Scouting API description")
    .setVersion("1.0")
    .addBearerAuth()
    .build();

  const customSwaggerDocumentOptions: SwaggerDocumentOptions = {
    ignoreGlobalPrefix: false,
    operationIdFactory: (controllerKey: string, methodKey: string) => methodKey,
  };
  const customOptions: SwaggerCustomOptions = {
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
    customSwaggerDocumentOptions,
  );
  SwaggerModule.setup("swagger", app, document, customOptions);

  app.enableCors();
  app.setGlobalPrefix("api");
  await app.listen(8080);
}
bootstrap();
