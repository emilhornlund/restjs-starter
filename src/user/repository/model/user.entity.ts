import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserRole } from '../../service';

@Entity('users')
export class UserEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  username: string;

  @Column()
  password: string;

  @Column({ unique: true })
  email: string;

  @Column({ default: UserRole.REGULAR_USER })
  role: UserRole;

  @CreateDateColumn({ name: 'created_at ' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at ' })
  updatedAt: Date;
}
