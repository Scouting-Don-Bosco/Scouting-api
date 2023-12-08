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
import { GroupsService } from "./groups.service";
import { CreateGroupDto } from "./dto/create-group.dto";
import { UpdateGroupDto } from "./dto/update-group.dto";
import {
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
} from "@nestjs/swagger";
import { AuthGuard } from "src/auth/auth.guard";
import { UserRole } from "@prisma/client";
import { Roles } from "src/auth/decorators/roles.decorator";
import { Response, response } from "express";
import { adminRoles } from "src/auth/admin.roles";

@Controller("groups")
@ApiTags("groups")
@ApiBearerAuth("access_token")
export class GroupsController {
  constructor(private readonly groupsService: GroupsService) {}

  @Post()
  @UseGuards(AuthGuard)
  @Roles([UserRole.GEGEVENSBEHEERDER])
  @ApiCreatedResponse({ description: "Group created", status: 201 })
  @ApiBody({ type: CreateGroupDto })
  async createGroup(@Body() createGroupDto: CreateGroupDto) {
    return await this.groupsService.create(createGroupDto);
  }

  @Get()
  @UseGuards(AuthGuard)
  @ApiOkResponse({ description: "List of all found groups" })
  async findAllGroups() {
    return await this.groupsService.findAll();
  }

  @Get(":id")
  @UseGuards(AuthGuard)
  @ApiOkResponse({ description: "Group found" })
  @ApiNotFoundResponse({ description: "Group not found" })
  async findGroupById(@Param("id") id: string) {
    const group = await this.groupsService.findOne(id);
    if (group) response.send(group);
    else
      response.status(HttpStatus.NOT_FOUND).send({
        statusCode: HttpStatus.NOT_FOUND,
        message: "Group not found!",
      });
  }

  @Get(":slug/info")
  @ApiOkResponse({ description: "Group info found" })
  @ApiNotFoundResponse({ description: "Group info not found" })
  async findGroupInfoById(
    @Param("slug") slug: string,
    @Res() response: Response,
  ) {
    const group = await this.groupsService.findByName(slug);
    if (group)
      response.send({
        id: group.id,
        title: group.name,
        content: group.pageContent,
      });
    else
      response.status(HttpStatus.NOT_FOUND).send({
        statusCode: HttpStatus.NOT_FOUND,
        message: "Group not found!",
      });
  }

  @Patch(":id")
  @UseGuards(AuthGuard)
  @Roles([UserRole.GEGEVENSBEHEERDER])
  @ApiNoContentResponse({ description: "Group updated" })
  @ApiNotFoundResponse({ description: "Group not found" })
  async updateGroup(
    @Param("id") id: string,
    @Body() updateGroupDto: UpdateGroupDto,
    @Res() response: Response,
  ) {
    const result = await this.groupsService.update(id, updateGroupDto);
    if (result) {
      response.status(HttpStatus.NO_CONTENT).send();
    } else {
      response.status(HttpStatus.NOT_FOUND).send();
    }
  }

  @UseGuards(AuthGuard)
  @Roles([UserRole.GEGEVENSBEHEERDER])
  @Delete(":id")
  @ApiNoContentResponse({ description: "Group deleted" })
  async removeGroup(@Param("id") id: string, @Res() response: Response) {
    const result = await this.groupsService.remove(id);
    if (result) {
      response.status(HttpStatus.NO_CONTENT).send();
    } else response.status(HttpStatus.NOT_FOUND).send();
  }
}
