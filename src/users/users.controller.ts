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
import { UsersService } from "./users.service";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
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
import { User } from "@prisma/client";
import { Response } from "express";
import { AdminOnly } from "src/auth/decorators/admin.decorator";

@ApiTags("users")
@Controller("users")
@UseGuards(AuthGuard)
@AdminOnly()
@ApiBearerAuth("access_token")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiCreatedResponse({ description: "User created" })
  @ApiBadRequestResponse({ description: "Malformed Request content" })
  @ApiInternalServerErrorResponse({
    description: "Internal server error from prisma",
  })
  async createUser(
    @Body() createUserDto: CreateUserDto,
    @Res() response: Response,
  ) {
    try {
      const result = await this.usersService.create(createUserDto);
      if (result)
        response
          .status(HttpStatus.CREATED)
          .send({ location: `/users/${result.id}` });
      else response.status(HttpStatus.BAD_REQUEST).send("Bad request!");
    } catch (error) {
      response.status(HttpStatus.INTERNAL_SERVER_ERROR).send(error.message);
    }
  }

  @Get()
  @ApiOkResponse({ description: "List of all found users" })
  async findAllUsers(): Promise<Omit<User, "password">[]> {
    const users = await this.usersService.findAll();
    users.forEach((user) => delete user.password);
    return users;
  }

  @Get(":id")
  @ApiOkResponse({ description: "User found" })
  @ApiNotFoundResponse({ description: "User not found" })
  async findUserById(@Param("id") id: string, @Res() response: Response) {
    const user = await this.usersService.findOne(id);
    if (user) {
      delete user.password;
      return user;
    } else response.status(HttpStatus.NOT_FOUND).send("User not found!");
  }

  @Patch(":id")
  @ApiNoContentResponse({ description: "User updated" })
  @ApiNotFoundResponse({ description: "User not found" })
  async updateUser(
    @Param("id") id: string,
    @Body() updateUserDto: UpdateUserDto,
    @Res() response: Response,
  ) {
    const result = await this.usersService.update(id, updateUserDto);
    if (result) {
      response.status(HttpStatus.NO_CONTENT).send();
    } else {
      response.status(HttpStatus.NOT_FOUND).send();
    }
  }

  @Delete(":id")
  @ApiNoContentResponse({ description: "User deleted" })
  @ApiNotFoundResponse({ description: "User not found" })
  async removeUser(@Param("id") id: string, @Res() response: Response) {
    const result = await this.usersService.remove(id);
    if (result) {
      response.status(HttpStatus.NO_CONTENT).send();
    } else response.status(HttpStatus.NOT_FOUND).send();
  }
}
