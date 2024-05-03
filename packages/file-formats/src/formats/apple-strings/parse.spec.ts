import { parseAppleStrings } from './parse'

describe('appleString', () => {
  it('returns expected output', async () => {
    const testData = `"GeneralLearnMore" = "Learn more";

/* Common usage of the "Next" text. */
"GeneralNext" = "Next";

/* Common usage of the "Previous" text. */
"GeneralPrevious" = "Previous";

/* Common usage of the "Welcome <NAME>!" text. 
At runtime, the placeholder is replaced with a concrete value.
Example: "Welcome John!" */
"GeneralWelcome" = "Welcome %s!";`

    const result = await parseAppleStrings(Buffer.from(testData))
    expect(result).toEqual({
      GeneralLearnMore: 'Learn more',
      GeneralNext: 'Next',
      GeneralPrevious: 'Previous',
    })
  })
})
