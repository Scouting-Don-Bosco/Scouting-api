import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Res,
  HttpStatus,
} from "@nestjs/common";
import { MembersService } from "./members.service";
import { CreateMemberDto } from "./dto/create-member.dto";
import { UpdateMemberDto } from "./dto/update-member.dto";
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
} from "@nestjs/swagger";
import { AuthGuard } from "src/auth/auth.guard";
import { Roles } from "src/auth/decorators/roles.decorator";
import { Response, response } from "express";
import { UserRole } from "@prisma/client";

@ApiTags("members")
@ApiBearerAuth("access_token")
@Controller("members")
@UseGuards(AuthGuard)
export class MembersController {
  constructor(private readonly membersService: MembersService) {}

  @Post()
  @Roles([UserRole.GEGEVENSBEHEERDER])
  @ApiCreatedResponse({ description: "The location of the created member" })
  @ApiBadRequestResponse({ description: "Malformed Request content" })
  @ApiInternalServerErrorResponse({
    description: "Internal server error from prisma",
  })
  async createMember(
    @Body() createMemberDto: CreateMemberDto,
    @Res() response: Response,
  ) {
    try {
      const result = await this.membersService.create(createMemberDto);
      if (result)
        response.status(HttpStatus.CREATED).send({
          location: `/members/${result.id}`,
        });
      else response.status(HttpStatus.BAD_REQUEST).send("Bad request!");
    } catch (error) {
      response.status(HttpStatus.INTERNAL_SERVER_ERROR).send(error.message);
    }
  }

  @Get()
  @ApiOkResponse({ description: "List of all found members" })
  async findAllMembers() {
    return await this.membersService.findAll();
  }

  @Get(":id")
  @ApiOkResponse({ description: "Member found" })
  @ApiNotFoundResponse({ description: "Member not found" })
  async findMemberById(@Param("id") id: string, @Res() response: Response) {
    const member = await this.membersService.findOne(id);
    if (member) return member;
    else response.status(HttpStatus.NOT_FOUND).send("Member not found!");
  }

  @Patch(":id")
  @Roles([UserRole.GEGEVENSBEHEERDER])
  @ApiNoContentResponse({ description: "Member updated" })
  @ApiNotFoundResponse({ description: "Member not found" })
  async updateMember(
    @Param("id") id: string,
    @Body() updateMemberDto: UpdateMemberDto,
    @Res() response: Response,
  ) {
    const result = await this.membersService.update(id, updateMemberDto);
    if (result) {
      response.status(HttpStatus.NO_CONTENT).send();
    } else {
      response.status(HttpStatus.NOT_FOUND).send();
    }
  }

  @Delete(":id")
  @ApiNoContentResponse({ description: "Member deleted" })
  @ApiNotFoundResponse({ description: "Member not found" })
  async removeMember(@Param("id") id: string) {
    const result = await this.membersService.remove(id);
    if (result) {
      response.status(HttpStatus.NO_CONTENT).send();
    } else response.status(HttpStatus.NOT_FOUND).send();
  }
}
