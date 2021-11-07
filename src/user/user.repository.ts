import { EntityRepository, Repository } from 'typeorm';
import { UserEntity } from './models';

@EntityRepository(UserEntity)
export class UserRepository extends Repository<UserEntity> {}
