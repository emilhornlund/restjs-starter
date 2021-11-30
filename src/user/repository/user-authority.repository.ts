import { EntityRepository, Repository } from 'typeorm';
import { UserAuthorityEntity } from './model/user-authority.entity';

@EntityRepository(UserAuthorityEntity)
export class UserAuthorityRepository extends Repository<UserAuthorityEntity> {}
