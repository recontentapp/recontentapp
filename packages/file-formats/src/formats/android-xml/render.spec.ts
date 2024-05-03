import { testDict } from '../../testHelpers'
import { renderAndroidXML } from './render'

describe('androidXML', () => {
  it('matches snapshot', async () => {
    const result = await renderAndroidXML(testDict)
    expect(result.toString()).toMatchSnapshot()
  })
})
