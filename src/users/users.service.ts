import { Injectable } from "@nestjs/common";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { PrismaService } from "src/prisma/prisma.service";
import bcrypt from "bcrypt";

@Injectable()
export class UsersService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = await bcrypt.hash(createUserDto.password, salt);
    return await this.prismaService.user.create({
      data: {
        email: createUserDto.email,
        password: hashedPassword,
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
        username: updateUserDto.username ?? undefined,
        roles: updateUserDto.roles ?? undefined,
      },
      create: {
        email: updateUserDto.email,
        password: bcrypt.hashSync("changeme", 10),
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
