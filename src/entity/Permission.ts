import { Entity, ObjectIdColumn, Column, ObjectId } from "typeorm";

// Permission entity
@Entity()
export class Permission {
  static readonly collectionName = "Permission";
  @ObjectIdColumn()
  id: ObjectId;

  @Column()
  entity: string;

  @Column()
  canView: boolean;

  @Column()
  canCreate: boolean;

  @Column()
  canUpdate: boolean;

  @Column()
  canDelete: boolean;
}

export const PermissionsTypes = {
  canView: "canView",
  canCreate: "canCreate",
  canUpdate: "canUpdate",
  canDelete: "canDelete",
};
