import { TestUtils } from './test-utils';
import {
  ApiUserAuthorityDescriptionMaxLength,
  ApiUserAuthorityDescriptionMinLength,
  ApiUserAuthorityNameMaxLength,
  ApiUserAuthorityNameMinLength,
  ApiUserPasswordMaxLength,
  ApiUserPasswordMinLength,
  ApiUserRoleDescriptionMaxLength,
  ApiUserRoleDescriptionMinLength,
  ApiUserRoleNameMaxLength,
  ApiUserRoleNameMinLength,
  ApiUserUsernameMaxLength,
  ApiUserUsernameMinLength,
} from '../src/user/controller';

export class TestData {
  // -------------------------------------------------------------------------
  // Users
  // -------------------------------------------------------------------------

  static User = class {
    // User Ids
    public static NonExistingUserId = 'fe513ec7-4096-4cdc-91ea-956efdbba20d';

    // Usernames
    public static readonly UsernamePrefix = 'TestUser';
    public static readonly BatchUsernamePrefix = 'BatchTestUser';
    public static readonly UsernamePrimary = this.UsernamePrefix + 1;
    public static readonly UsernameSecondary = this.UsernamePrefix + 2;
    public static readonly UsernameEqualMinLength = TestUtils.randomString(
      ApiUserUsernameMinLength,
      TestUtils.Characters.ALPHANUMERIC,
    );
    public static readonly UsernameLessThanMinLength = TestUtils.randomString(
      ApiUserUsernameMinLength - 1,
      TestUtils.Characters.ALPHANUMERIC,
    );
    public static readonly UsernameEqualMaxLength = TestUtils.randomString(
      ApiUserUsernameMaxLength,
      TestUtils.Characters.ALPHANUMERIC,
    );
    public static readonly UsernameGreaterThanMaxLength =
      TestUtils.randomString(
        ApiUserUsernameMaxLength + 1,
        TestUtils.Characters.ALPHANUMERIC,
      );
    public static readonly UsernameInvalidCharacters = 'test#_user!';

    // Passwords
    public static readonly PasswordPrimary = 'harD2!Guess_p@ssw0rd';
    public static readonly PasswordSecondary = 'another#harD2!Guess_p@ssw0rd';
    public static readonly PasswordEqualMinLength =
      'aB1#' +
      TestUtils.randomString(
        ApiUserPasswordMinLength - 4,
        TestUtils.Characters.ALPHANUMERIC,
      );
    public static readonly PasswordLessThanMinLength =
      'aB1#' +
      TestUtils.randomString(
        ApiUserPasswordMinLength - 4 - 1,
        TestUtils.Characters.ALPHANUMERIC,
      );
    public static readonly PasswordEqualMaxLength =
      'aB1#' +
      TestUtils.randomString(
        ApiUserPasswordMaxLength - 4,
        TestUtils.Characters.ALPHANUMERIC,
      );
    public static readonly PasswordGreaterThanMaxLength =
      'aB1#' +
      TestUtils.randomString(
        ApiUserPasswordMaxLength - 4 + 1,
        TestUtils.Characters.ALPHANUMERIC,
      );

    // Emails
    public static readonly EmailSuffix = '@example.com';
    public static readonly EmailPrimary =
      this.UsernamePrefix + 1 + this.EmailSuffix;
    public static readonly EmailSecondary =
      this.UsernamePrefix + 2 + this.EmailSuffix;
    public static readonly EmailInvalid = 'invalid_email';
  };

  // -------------------------------------------------------------------------
  // User Roles
  // -------------------------------------------------------------------------

  static UserRole = class {
    // User Ids
    public static NonExistingId = 'aad63dd6-ac6b-4725-b850-87b53782e6bf';

    // User Role Names
    public static readonly PrimaryName = 'PRIMARY_ROLE';
    public static readonly SecondaryName = 'SECONDARY_ROLE';
    public static readonly BatchNamePrefix = 'BATCH_ROLE_PREFIX';
    public static readonly ValidNameExactMinLength = TestUtils.randomString(
      ApiUserRoleNameMinLength,
      TestUtils.Characters.UPPERCASE_LETTERS,
      '_',
    );
    public static readonly ValidNameExactMaxLength = TestUtils.randomString(
      ApiUserRoleNameMaxLength,
      TestUtils.Characters.UPPERCASE_LETTERS,
      '_',
    );

    // Invalid User Role Names
    public static readonly InvalidNameLessThanMinLength =
      TestUtils.randomString(
        ApiUserRoleNameMinLength - 1,
        TestUtils.Characters.UPPERCASE_LETTERS,
        '_',
      );
    public static readonly InvalidNameMoreThanMaxLength =
      TestUtils.randomString(
        ApiUserRoleNameMaxLength + 1,
        TestUtils.Characters.UPPERCASE_LETTERS,
        '_',
      );
    public static readonly InvalidNameIncludingLowercaseLetters =
      TestUtils.randomString(
        ApiUserRoleNameMinLength,
        TestUtils.Characters.LOWERCASE_LETTERS,
      );
    public static readonly InvalidNameIncludingNumbers = TestUtils.randomString(
      ApiUserRoleNameMinLength,
      TestUtils.Characters.NUMBERS,
    );

    ///User Role Descriptions
    public static readonly PrimaryDescription =
      'The primary user role for testing';
    public static readonly SecondaryDescription =
      'The secondary user role for testing';
    public static readonly ValidDescriptionExactMinLength =
      TestUtils.randomString(
        ApiUserRoleDescriptionMinLength,
        TestUtils.Characters.ALPHANUMERIC,
      );
    public static readonly ValidNameDescriptionExactMaxLength =
      TestUtils.randomString(
        ApiUserRoleDescriptionMaxLength,
        TestUtils.Characters.ALPHANUMERIC,
      );

    // Invalid User Role Descriptions
    public static readonly InvalidDescriptionLessThanMinLength =
      TestUtils.randomString(
        ApiUserRoleDescriptionMinLength - 1,
        TestUtils.Characters.ALPHANUMERIC,
      );
    public static readonly InvalidDescriptionMoreThanMaxLength =
      TestUtils.randomString(
        ApiUserRoleDescriptionMaxLength + 1,
        TestUtils.Characters.ALPHANUMERIC,
      );
  };

  // -------------------------------------------------------------------------
  // User Authorities
  // -------------------------------------------------------------------------

  static UserAuthority = class {
    // User Ids
    public static NonExistingId = 'aad63dd6-ac6b-4725-b850-87b53782e6bf';

    // User Authority Names
    public static readonly PrimaryName = 'PRIMARY_AUTHORITY:write';
    public static readonly SecondaryName = 'SECONDARY_AUTHORITY:read';
    public static readonly BatchNamePrefix = 'BATCH_AUTHORITY_PREFIX';
    public static readonly ValidNameExactMinLength =
      TestUtils.randomString(
        ApiUserAuthorityNameMinLength - 5,
        TestUtils.Characters.UPPERCASE_LETTERS,
        '_',
      ) + ':read';
    public static readonly ValidNameExactMaxLength =
      TestUtils.randomString(
        ApiUserAuthorityNameMaxLength - 5,
        TestUtils.Characters.UPPERCASE_LETTERS,
        '_',
      ) + ':read';

    // Invalid User Authority Names
    public static readonly InvalidNameLessThanMinLength =
      TestUtils.randomString(
        ApiUserAuthorityNameMinLength - 5 - 1,
        TestUtils.Characters.UPPERCASE_LETTERS,
        '_',
      ) + ':read';
    public static readonly InvalidNameMoreThanMaxLength =
      TestUtils.randomString(
        ApiUserAuthorityNameMaxLength - 5 + 1,
        TestUtils.Characters.UPPERCASE_LETTERS,
        '_',
      ) + ':read';
    public static readonly InvalidNameIncludingLowercaseLetters =
      TestUtils.randomString(
        ApiUserAuthorityNameMinLength - 5,
        TestUtils.Characters.LOWERCASE_LETTERS,
      ) + ':read';
    public static readonly InvalidNameIncludingNumbers =
      TestUtils.randomString(
        ApiUserAuthorityNameMinLength - 5,
        TestUtils.Characters.NUMBERS,
      ) + ':read';

    ///User Authority Descriptions
    public static readonly PrimaryDescription =
      'The primary user authority for testing';
    public static readonly SecondaryDescription =
      'The secondary user authority for testing';
    public static readonly ValidDescriptionExactMinLength =
      TestUtils.randomString(
        ApiUserAuthorityDescriptionMinLength,
        TestUtils.Characters.ALPHANUMERIC,
      );
    public static readonly ValidNameDescriptionExactMaxLength =
      TestUtils.randomString(
        ApiUserAuthorityDescriptionMaxLength,
        TestUtils.Characters.ALPHANUMERIC,
      );

    // Invalid User Authority Descriptions
    public static readonly InvalidDescriptionLessThanMinLength =
      TestUtils.randomString(
        ApiUserAuthorityDescriptionMinLength - 1,
        TestUtils.Characters.ALPHANUMERIC,
      );
    public static readonly InvalidDescriptionMoreThanMaxLength =
      TestUtils.randomString(
        ApiUserAuthorityDescriptionMaxLength + 1,
        TestUtils.Characters.ALPHANUMERIC,
      );
  };
}
