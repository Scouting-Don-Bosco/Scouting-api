import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { MembersModule } from "./members/members.module";
import { PrismaModule } from "./prisma/prisma.module";
import { UsersModule } from "./users/users.module";
import { AuthModule } from "./auth/auth.module";
import { GroupsModule } from "./groups/groups.module";
import { JwtModule } from "@nestjs/jwt";

@Module({
  imports: [
    MembersModule,
    PrismaModule,
    UsersModule,
    AuthModule,
    GroupsModule,
    JwtModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
