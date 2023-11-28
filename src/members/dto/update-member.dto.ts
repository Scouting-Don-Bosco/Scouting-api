import { OmitType } from "@nestjs/mapped-types";
import { CreateMemberDto } from "./create-member.dto";
import { ContactInfo, MemberInGroup } from "@prisma/client";

export class UpdateMemberDto extends OmitType(CreateMemberDto, [
  "memberInGroups",
  "contactOptions",
]) {
  memberInGroups: MemberInGroup[];
  contactOptions: ContactInfo[];
}
