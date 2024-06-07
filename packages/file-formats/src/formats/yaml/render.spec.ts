import { testDict } from '../../testHelpers'
import { renderNestedYAML, renderYAML } from './render'

describe('yaml', () => {
  it('matches snapshot', async () => {
    const result = await renderYAML(testDict)
    expect(result.toString()).toMatchSnapshot()
  })
})

describe('nestedYaml', () => {
  it('matches snapshot', async () => {
    const result = await renderNestedYAML(testDict)
    expect(result.toString()).toMatchSnapshot()
  })
})
