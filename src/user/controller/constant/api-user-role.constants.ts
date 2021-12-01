export const ApiUserRoleIdTitle = 'Role Id';
export const ApiUserRoleIdDescription =
  'Unique identifier representing a role.';
export const ApiUserRoleIdExample = '00b07183-2631-492b-a9e2-83aeb6a37ff0';

export const ApiUserRoleNameTitle = 'Name';
export const ApiUserRoleNameDescription = 'Unique name belonging to a role.';
export const ApiUserRoleNameMinLength = 8;
export const ApiUserRoleNameMaxLength = 32;
export const ApiUserRoleNamePattern = /[A-Z_]+/;
export const ApiUserRoleNameExample = 'REGULAR_USER';

export const ApiUserRoleDescriptionTitle = 'Description';
export const ApiUserRoleDescription = 'Description of the purpose of the role.';
export const ApiUserRoleDescriptionMinLength = 2;
export const ApiUserRoleDescriptionMaxLength = 128;
export const ApiUserRoleDescriptionPattern = /[\w]+/;
export const ApiUserRoleDescriptionExample = ApiUserRoleDescription;

export const ApiUserRoleCreatedAtTitle = 'Created At';
export const ApiUserRoleCreatedAtDescription =
  'The date at which the role was created.';
export const ApiUserRoleCreatedAtExample = new Date();

export const ApiUserRoleUpdatedAtTitle = 'Updated At';
export const ApiUserRoleUpdatedAtDescription =
  'The date at which the role was updated.';
export const ApiUserRoleUpdatedAtExample = ApiUserRoleCreatedAtExample;
