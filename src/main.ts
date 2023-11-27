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
    .setTitle("Scouting API")
    .setDescription("The Scouting API description")
    .setVersion("1.0")
    .addBearerAuth()
    .setBasePath("api")
    .build();

  const customOptions: SwaggerCustomOptions = {
    swaggerOptions: {
      tagsSorter: TagSorter,
      operationsSorter: OperationSorter,
      filter: true,
      tryItOutEnabled: true,
    },
  };
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup("api/swagger", app, document, customOptions);

  await app.listen(8080);
}
bootstrap();
