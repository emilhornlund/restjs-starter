import { ValidationFailedException } from './validation-failed.exception';

export class IsNumberConstraintException extends ValidationFailedException {
  constructor(field: string) {
    super([
      {
        property: field,
        constraints: {
          isNumber: `${field} is not a valid number`,
        },
      },
    ]);
  }
}
