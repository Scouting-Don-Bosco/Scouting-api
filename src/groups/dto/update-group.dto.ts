import { PartialType } from "@nestjs/swagger";
import { CreateGroupDto } from "./create-group.dto";
import { Member } from "@prisma/client";

export class UpdateGroupDto extends PartialType(CreateGroupDto) {
  members: Member[];
}

