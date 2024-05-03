import { testDict } from '../../testHelpers'
import { parseYAML } from './parse'

describe('yaml', () => {
  it('returns expected output', async () => {
    const testData = `title: Hello World
dashboard:
  title: Welcome to your dashboard
  description: Here you can find all the information you need to get started`

    const result = await parseYAML(Buffer.from(testData))
    expect(result).toEqual(testDict)
  })
})
