export enum Role {
  ADMIN = 'ADMIN',
  MEMBER = 'MEMBER'
}

export interface GroupCreateInput {
  name: string;
}

export interface GroupMemberInput {
  email: string;
}

export interface RoleUpdateInput {
  role: Role;
} 