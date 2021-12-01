import { TestUtils } from './test-utils';
import {
  ApiUserRoleDescriptionMaxLength,
  ApiUserRoleDescriptionMinLength,
  ApiUserRoleNameMaxLength,
  ApiUserRoleNameMinLength,
} from '../src/user/controller';

export class TestData {
  // -------------------------------------------------------------------------
  // Users
  // -------------------------------------------------------------------------

  // User Ids
  public static NonExistingUserId = 'fe513ec7-4096-4cdc-91ea-956efdbba20d';

  // Usernames
  private static readonly UsernamePrefix = 'test_user';
  public static Username = (i: number): string => TestData.UsernamePrefix + i;
  public static readonly PrimaryUsername = TestData.Username(1);
  public static readonly SecondaryUsername = TestData.Username(2);
  public static readonly ShortUsername = 'ab';
  public static readonly InvalidTooShortUsername = 'a';
  public static readonly LongUsername = 'abcdefghijklmnopqrst';
  public static readonly InvalidTooLongUsername = 'abcdefghijklmnopqrstu';

  // Passwords
  public static readonly PrimaryPassword = 'hard!to-guess_password';
  public static readonly SecondaryPassword = 'another#hard!to-guess_password';

  // Emails
  private static readonly EmailSuffix = '@example.com';
  public static Email = (i: number): string =>
    TestData.Username(i) + TestData.EmailSuffix;
  public static readonly PrimaryEmail = TestData.Email(1);
  public static readonly SecondaryEmail = TestData.Email(2);
  public static readonly InvalidEmail = 'invalid_email';

  // -------------------------------------------------------------------------
  // User Roles
  // -------------------------------------------------------------------------

  static UserRole = class {
    // User Ids
    public static NonExistingId = 'aad63dd6-ac6b-4725-b850-87b53782e6bf';

    // User Role Names
    public static readonly PrimaryName = 'PRIMARY_ROLE';
    public static readonly SecondaryName = 'SECONDARY_ROLE';
    public static readonly NamePrefix = 'ROLE_PREFIX';
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
}
