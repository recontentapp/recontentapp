import { testDict } from '../../testHelpers'
import { renderAppleStrings } from './render'

describe('appleStrings', () => {
  it('matches snapshot', async () => {
    const result = await renderAppleStrings(testDict)
    expect(result.toString()).toMatchSnapshot()
  })
})
