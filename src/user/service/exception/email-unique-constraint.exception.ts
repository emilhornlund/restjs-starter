import { ValidationFailedException } from '../../../common/exception';

export class EmailUniqueConstraintException extends ValidationFailedException {
  constructor(field?: string) {
    super([
      {
        property: field ?? 'email',
        constraints: {
          isUsernameUnique: `email already exists`,
        },
      },
    ]);
  }
}
