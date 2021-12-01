export const ApiUserAuthorityIdTitle = 'Authority Id';
export const ApiUserAuthorityIdDescription =
  'Unique identifier representing a authority.';
export const ApiUserAuthorityIdExample = '69626488-3d77-49b6-9ba6-355353064b3c';

export const ApiUserAuthorityNameTitle = 'Name';
export const ApiUserAuthorityNameDescription =
  'Unique name belonging to a authority.';
export const ApiUserAuthorityNameMinLength = 8;
export const ApiUserAuthorityNameMaxLength = 32;
export const ApiUserAuthorityNamePattern =
  /[A-Z_]{3,27}:read|[A-Z_]{2,26}:write/;
export const ApiUserAuthorityNameExample = 'AUTHORITY_ADMINISTRATION:read';

export const ApiUserAuthorityDescriptionTitle = 'Description';
export const ApiUserAuthorityDescription =
  'Description of the purpose of the authority.';
export const ApiUserAuthorityDescriptionMinLength = 2;
export const ApiUserAuthorityDescriptionMaxLength = 128;
export const ApiUserAuthorityDescriptionPattern = /[\w]{2,128}/;
export const ApiUserAuthorityDescriptionExample = ApiUserAuthorityDescription;

export const ApiUserAuthorityCreatedAtTitle = 'Created At';
export const ApiUserAuthorityCreatedAtDescription =
  'The date at which the authority was created.';
export const ApiUserAuthorityCreatedAtExample = new Date();

export const ApiUserAuthorityUpdatedAtTitle = 'Updated At';
export const ApiUserAuthorityUpdatedAtDescription =
  'The date at which the authority was updated.';
export const ApiUserAuthorityUpdatedAtExample =
  ApiUserAuthorityCreatedAtExample;
