import { Controller, Get } from "@nestjs/common";
import { AppService } from "./app.service";
import { PrismaService } from "./prisma/prisma.service";
import { ApiTags } from "@nestjs/swagger";

@ApiTags("index")
@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly prismaService: PrismaService,
  ) {}

  @Get()
  getHello(): string {
    return "Scouting API";
  }
}
