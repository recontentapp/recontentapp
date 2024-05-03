import { testDict } from '../../testHelpers'
import { parseJSON } from './parse'

describe('json', () => {
  it('returns expected output', async () => {
    const testData = `{
  "title": "Hello World",
  "dashboard.title": "Welcome to your dashboard",
  "dashboard.description": "Here you can find all the information you need to get started"
}`

    const result = await parseJSON(Buffer.from(testData))
    expect(result).toEqual(testDict)
  })
})
