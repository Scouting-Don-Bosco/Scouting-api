import { Injectable } from "@nestjs/common";
import { CreateMemberDto } from "./dto/create-member.dto";
import { UpdateMemberDto } from "./dto/update-member.dto";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class MembersService {
  constructor(private prismaService: PrismaService) {}
  async create(createMemberDto: CreateMemberDto) {
    return await this.prismaService.member.create({
      data: {
        firstName: createMemberDto.firstName,
        lastName: createMemberDto.lastName,
        birthDate: createMemberDto.birthDate,
        address: createMemberDto.address,
        zipcode: createMemberDto.zipcode,
        city: createMemberDto.city,
        memberSince: createMemberDto.memberSince,
        chil_lidnumber: createMemberDto.chil_lidnumber,
        contactOptions: {
          create: createMemberDto.contactOptions,
        },
        memberInGroups: {
          create: createMemberDto.memberInGroups,
        },
      },
      select: {
        id: true,
      },
    });
  }

  async findAll() {
    return await this.prismaService.member.findMany();
  }

  async findOne(id: string) {
    return await this.prismaService.member.findUnique({
      where: {
        id: id,
      },
    });
  }

  async update(id: string, updateMemberDto: UpdateMemberDto) {
    return await this.prismaService.member.update({
      where: {
        id: id,
      },
      data: {
        firstName: updateMemberDto.firstName,
        lastName: updateMemberDto.lastName,
        birthDate: updateMemberDto.birthDate,
        address: updateMemberDto.address,
        zipcode: updateMemberDto.zipcode,
        city: updateMemberDto.city,
        memberSince: updateMemberDto.memberSince,
        chil_lidnumber: updateMemberDto.chil_lidnumber,
        contactOptions: {
          connect: updateMemberDto.contactOptions,
        },
        memberInGroups: {
          create: updateMemberDto.memberInGroups,
        },
      },
    });
  }

  async remove(id: string) {
    return await this.prismaService.member.delete({
      where: {
        id: id,
      },
    });
  }
}
