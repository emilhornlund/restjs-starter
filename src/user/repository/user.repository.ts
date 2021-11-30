import { EntityRepository, Repository } from 'typeorm';
import { UserEntity } from './model/user.entity';

@EntityRepository(UserEntity)
export class UserRepository extends Repository<UserEntity> {}
