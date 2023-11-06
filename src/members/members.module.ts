import { Module } from "@nestjs/common";
import { MembersService } from "./members.service";
import { MembersController } from "./members.controller";
import { JwtModule } from "@nestjs/jwt";

@Module({
  imports: [JwtModule],
  controllers: [MembersController],
  providers: [MembersService],
})
export class MembersModule {}
