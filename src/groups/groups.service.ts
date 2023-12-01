import { Injectable } from "@nestjs/common";
import { CreateGroupDto } from "./dto/create-group.dto";
import { UpdateGroupDto } from "./dto/update-group.dto";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class GroupsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createGroupDto: CreateGroupDto) {
    return await this.prisma.group.create({
      data: {
        name: createGroupDto.name,
        pageContent: createGroupDto.pageContent,
      },
      select: {
        id: true,
      },
    });
  }

  async findAll() {
    return await this.prisma.group.findMany();
  }

  async findOne(id: string) {
    return await this.prisma.group.findUnique({
      where: { id: id },
    });
  }

  async findByName(slug: string) {
    return await this.prisma.group.findFirst({
      where: {
        name: {
          contains: slug,
        },
      },
    });
  }

  async update(id: string, updateGroupDto: UpdateGroupDto) {
    return await this.prisma.group.update({
      where: { id: id },
      data: {
        name: updateGroupDto.name,
        Members: {
          connect: updateGroupDto.members,
        },
      },
    });
  }

  async remove(id: string) {
    return await this.prisma.group.delete({
      where: { id: id },
    });
  }
}
