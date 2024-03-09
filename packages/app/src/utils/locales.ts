import rtlDetect from 'rtl-detect'

export const isLocaleRTL = (localeString: string) => {
  try {
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/Locale/getTextInfo#browser_compatibility
    // @ts-expect-error
    return new Intl.Locale(localeString).getTextInfo().direction === 'rtl'
  } catch (e) {
    return rtlDetect.isRtlLang(localeString)
  }
}
