import { ValidationFailedException } from '../../common';

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
