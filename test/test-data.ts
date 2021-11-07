export class TestData {
  // User Ids
  public static NonExistingUserId = 'fe513ec7-4096-4cdc-91ea-956efdbba20d';

  // Usernames
  private static UsernamePrefix = 'test_user';
  public static Username = (i: number): string => TestData.UsernamePrefix + i;
  public static PrimaryUsername = TestData.Username(1);
  public static SecondaryUsername = TestData.Username(2);
  public static ShortUsername = 'ab';
  public static InvalidTooShortUsername = 'a';
  public static LongUsername = 'abcdefghijklmnopqrst';
  public static InvalidTooLongUsername = 'abcdefghijklmnopqrstu';

  // Passwords
  public static PrimaryPassword = 'hard!to-guess_password';
  public static SecondaryPassword = 'another#hard!to-guess_password';

  // Emails
  private static EmailSuffix = '@example.com';
  public static Email = (i: number): string =>
    TestData.Username(i) + TestData.EmailSuffix;
  public static PrimaryEmail = TestData.Email(1);
  public static SecondaryEmail = TestData.Email(2);
  public static InvalidEmail = 'invalid_email';
}
