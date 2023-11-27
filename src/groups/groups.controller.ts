import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from "@nestjs/common";
import { GroupsService } from "./groups.service";
import { CreateGroupDto } from "./dto/create-group.dto";
import { UpdateGroupDto } from "./dto/update-group.dto";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { AuthGuard } from "src/auth/auth.guard";
import { UserRole } from "@prisma/client";
import { Roles } from "src/auth/decorators/roles.decorator";

@Controller("groups")
@ApiTags("groups")
@ApiBearerAuth()
@UseGuards(AuthGuard)
export class GroupsController {
  constructor(private readonly groupsService: GroupsService) {}

  @Post()
  @Roles([UserRole.DATAMANAGER])
  async create(@Body() createGroupDto: CreateGroupDto) {
    return await this.groupsService.create(createGroupDto);
  }

  @Get()
  async findAll() {
    return await this.groupsService.findAll();
  }

  @Get(":id")
  async findOne(@Param("id") id: string) {
    return await this.groupsService.findOne(id);
  }

  @Patch(":id")
  async update(
    @Param("id") id: string,
    @Body() updateGroupDto: UpdateGroupDto,
  ) {
    return await this.groupsService.update(id, updateGroupDto);
  }

  @Delete(":id")
  async remove(@Param("id") id: string) {
    return await this.groupsService.remove(id);
  }
}
