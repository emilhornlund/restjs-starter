import { ValidationFailedException } from '../../../common';

export class UsernameUniqueConstraintException extends ValidationFailedException {
  constructor(field?: string) {
    super([
      {
        property: field ?? 'username',
        constraints: {
          isUsernameUnique: `username already exists`,
        },
      },
    ]);
  }
}
