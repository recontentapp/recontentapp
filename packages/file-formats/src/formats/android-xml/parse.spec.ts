import { parseAndroidXML } from './parse'

describe('androidXML', () => {
  it('returns expected output', async () => {
    const testData = `<?xml version="1.0" encoding="utf-8"?>
    <resources>
        <string name="app_name">LokaliseI18n</string>
        <string name="hello_world">Sveika pasaule!</string>
    </resources>`

    const result = await parseAndroidXML(Buffer.from(testData))
    expect(result).toEqual({
      app_name: 'LokaliseI18n',
      hello_world: 'Sveika pasaule!',
    })
  })
})
