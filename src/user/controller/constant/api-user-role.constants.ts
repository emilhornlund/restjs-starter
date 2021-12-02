// -------------------------------------------------------------------------
// Role Id
// -------------------------------------------------------------------------

export const ApiUserRoleIdTitle = 'Role Id';
export const ApiUserRoleIdDescription =
  'Unique identifier representing a role.';
export const ApiUserRoleIdExample = '00b07183-2631-492b-a9e2-83aeb6a37ff0';

// -------------------------------------------------------------------------
// Role Name
// -------------------------------------------------------------------------

export const ApiUserRoleNameTitle = 'Name';
export const ApiUserRoleNameDescription = 'Unique name belonging to a role.';
export const ApiUserRoleNameMinLength = 8;
export const ApiUserRoleNameMaxLength = 32;
export const ApiUserRoleNamePattern = /[A-Z_]{8,32}/;
export const ApiUserRoleNameExample = 'REGULAR_USER';

// -------------------------------------------------------------------------
// Role Description
// -------------------------------------------------------------------------

export const ApiUserRoleDescriptionTitle = 'Description';
export const ApiUserRoleDescriptionDescription =
  'Description of the purpose of the role.';
export const ApiUserRoleDescriptionMinLength = 2;
export const ApiUserRoleDescriptionMaxLength = 128;
export const ApiUserRoleDescriptionPattern = /[\w]{2,128}/;
export const ApiUserRoleDescriptionExample = ApiUserRoleDescriptionDescription;

// -------------------------------------------------------------------------
// Role Created At
// -------------------------------------------------------------------------

export const ApiUserRoleCreatedAtTitle = 'Created At';
export const ApiUserRoleCreatedAtDescription =
  'The date at which the role was first created.';
export const ApiUserRoleCreatedAtExample = new Date();

// -------------------------------------------------------------------------
// Role Updated At
// -------------------------------------------------------------------------

export const ApiUserRoleUpdatedAtTitle = 'Updated At';
export const ApiUserRoleUpdatedAtDescription =
  'The date at which the role was last updated.';
export const ApiUserRoleUpdatedAtExample = ApiUserRoleCreatedAtExample;
