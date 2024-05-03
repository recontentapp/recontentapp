import { parsePHPArrays } from './parse'

describe('phpArrays', () => {
  it('returns expected output', async () => {
    const testData = `<?php
$lang["username"] = "Username";
$lang["password"] = "Enter password";
$lang["app"] = "Lokalise";`

    const result = await parsePHPArrays(Buffer.from(testData))
    expect(result).toEqual({
      username: 'Username',
      password: 'Enter password',
      app: 'Lokalise',
    })
  })
})
