import {
  Entity,
  ObjectIdColumn,
  ObjectId,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity()
export class Client {
  static readonly collectionName = "Client";

  @ObjectIdColumn()
  id: ObjectId;

  @Column()
  fullname: string;

  @Column()
  email: string;

  @Column()
  telephone: string;

  @Column()
  address: string;

  @Column()
  status: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
