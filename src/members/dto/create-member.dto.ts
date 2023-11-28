import { ContactInfo, MemberInGroup } from "@prisma/client";

export class CreateMemberDto {
  firstName: string;
  lastName: string;
  birthDate: Date;
  address: string;
  zipcode: string;
  city: string;
  memberSince: Date;
  chil_lidnumber: number;
  contactOptions: Omit<ContactInfo, "id">[];
  memberInGroups: Omit<MemberInGroup, "id">[];
}
