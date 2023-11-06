import { Module } from "@nestjs/common";
import { MembersService } from "./members.service";
import { MembersController } from "./members.controller";
import { JwtModule } from "@nestjs/jwt";
import { PrismaModule } from "src/prisma/prisma.module";

@Module({
  imports: [JwtModule, PrismaModule],
  controllers: [MembersController],
  providers: [MembersService],
})
export class MembersModule {}
