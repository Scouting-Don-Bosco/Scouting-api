import { Injectable } from "@nestjs/common";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class UsersService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    return await this.prismaService.user.create({
      data: {
        email: createUserDto.email,
        password: createUserDto.password,
        username: createUserDto.username,
        roles: createUserDto.roles,
      },
      select: {
        id: true,
      },
    });
  }

  async findAll() {
    return await this.prismaService.user.findMany();
  }

  async findUserByEmail(email: string) {
    return this.prismaService.user.findUnique({
      where: { email: email },
    });
  }

  async findOne(id: string) {
    return await this.prismaService.user.findUnique({
      where: { id: id },
    });
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    return await this.prismaService.user.upsert({
      where: { id: id },
      update: {
        email: updateUserDto.email ?? undefined,
        password: updateUserDto.password ?? undefined,
        username: updateUserDto.username ?? undefined,
        roles: updateUserDto.roles ?? undefined,
      },
      create: {
        email: updateUserDto.email,
        password: updateUserDto.password,
        username: updateUserDto.username,
        roles: updateUserDto.roles,
      },
    });
  }

  async remove(id: string) {
    return await this.prismaService.user.delete({
      where: { id: id },
    });
  }
}
