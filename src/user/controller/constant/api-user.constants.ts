// -------------------------------------------------------------------------
// User Id
// -------------------------------------------------------------------------

import { UserRole } from '../../service';

export const ApiUserIdTitle = 'User Id';
export const ApiUserIdDescription = 'Unique identifier representing a user.';
export const ApiUserIdExample = '7bda9f39-8864-4ebb-a8ff-795d371baf56';

// -------------------------------------------------------------------------
// Username
// -------------------------------------------------------------------------

export const ApiUserUsernameTitle = 'Username';
export const ApiUserUsernameDescription =
  'Unique username that belongs to and is used to authenticate a user.';
export const ApiUserUsernameMinLength = 2;
export const ApiUserUsernameMaxLength = 20;
export const ApiUserUsernamePattern = /[a-zA-Z0-9_.]{2,20}/;
export const ApiUserUsernameExample = 'testuser';

// -------------------------------------------------------------------------
// Password
// -------------------------------------------------------------------------

export const ApiUserPasswordTitle = 'Password';
export const ApiUserPasswordDescription =
  'Password used to authenticate a user.';
export const ApiUserPasswordMinLength = 8;
export const ApiUserPasswordMaxLength = 128;
export const ApiUserPasswordPattern = /[\w]{8,128}/;
export const ApiUserPasswordExample = 'hard!to-guess_password';

// -------------------------------------------------------------------------
// Email
// -------------------------------------------------------------------------

export const ApiUserEmailTitle = 'Email';
export const ApiUserEmailDescription =
  'Unique email that belongs to and is used to authenticate a user.';
export const ApiUserEmailExample = 'testuser@example.com';

// -------------------------------------------------------------------------
// User Role
// -------------------------------------------------------------------------
export const ApiUserRoleTitle = 'Role';
export const ApiUserRoleDescription =
  'Unique name of a role that belongs to a user.';
export const ApiUserRoleExample = UserRole.REGULAR_USER;

// -------------------------------------------------------------------------
// Created At
// -------------------------------------------------------------------------

export const ApiUserCreatedAtTitle = 'Created At';
export const ApiUserCreatedAtDescription =
  'The date at which the user was first created.';
export const ApiUserCreatedAtExample = new Date();

// -------------------------------------------------------------------------
// Updated
// -------------------------------------------------------------------------

export const ApiUserUpdatedAtTitle = 'Updated At';
export const ApiUserUpdatedAtDescription =
  'The date at which the user was last updated.';
export const ApiUserUpdatedAtExample = ApiUserCreatedAtExample;
