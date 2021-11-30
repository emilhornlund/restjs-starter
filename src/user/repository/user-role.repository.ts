import { EntityRepository, Repository } from 'typeorm';
import { UserRoleEntity } from './model/user-role.entity';

@EntityRepository(UserRoleEntity)
export class UserRoleRepository extends Repository<UserRoleEntity> {}
