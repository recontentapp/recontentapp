export type LanguageLocale =
  | 'en'
  | 'es'
  | 'de'
  | 'fr'
  | 'pt'
  | 'ru'
  | 'zh'
  | 'ab'
  | 'aa'
  | 'aa-DJ'
  | 'aa-ER'
  | 'aa-ET'
  | 'aa-Ethi'
  | 'af'
  | 'af-NA'
  | 'af-ZA'
  | 'ak'
  | 'ak-GH'
  | 'sq'
  | 'sq-AL'
  | 'sq-MK'
  | 'am'
  | 'am-ET'
  | 'ar'
  | 'ar-145'
  | 'ar-DZ'
  | 'ar-Arab'
  | 'ar-BH'
  | 'ar-EG'
  | 'ar-IQ'
  | 'ar-IL'
  | 'ar-JO'
  | 'ar-KW'
  | 'ar-LB'
  | 'ar-LY'
  | 'ar-MA'
  | 'ar-OM'
  | 'ar-QA'
  | 'ar-SA'
  | 'ar-SD'
  | 'ar-SY'
  | 'ar-TN'
  | 'ar-AE'
  | 'ar-YE'
  | 'an'
  | 'hy'
  | 'hy-AM'
  | 'as'
  | 'as-IN'
  | 'av'
  | 'ae'
  | 'ay'
  | 'az'
  | 'az-Arab'
  | 'az-AZ'
  | 'az-Cyrl-AZ'
  | 'az-Latn-AZ'
  | 'az-Cyrl'
  | 'az-Latn'
  | 'az-IR'
  | 'az-Arab-IR'
  | 'bm'
  | 'ba'
  | 'eu'
  | 'eu-FR'
  | 'eu-ES'
  | 'be'
  | 'be-BY'
  | 'be-Cyrl'
  | 'be-Latn'
  | 'bn'
  | 'bn-bd'
  | 'bn-IN'
  | 'bi'
  | 'bs'
  | 'bs-BA'
  | 'br'
  | 'bg'
  | 'bg-BG'
  | 'my'
  | 'my-MM'
  | 'ca'
  | 'ca-ES'
  | 'km'
  | 'km-KH'
  | 'ch'
  | 'ce'
  | 'ny'
  | 'ny-MW'
  | 'zh-CN'
  | 'zh-Hans-CN'
  | 'zh-HK'
  | 'zh-Hans-HK'
  | 'zh-Hant-HK'
  | 'zh-MO'
  | 'zh-Hans-MO'
  | 'zh-Hant-MO'
  | 'zh-Hans'
  | 'zh-SG'
  | 'zh-Hans-SG'
  | 'zh-TW'
  | 'zh-Hant-TW'
  | 'zh-Hant'
  | 'zh-yue'
  | 'cu'
  | 'cv'
  | 'kw'
  | 'kw-GB'
  | 'co'
  | 'cr'
  | 'hr'
  | 'hr-HR'
  | 'cs'
  | 'cs-CZ'
  | 'da'
  | 'da-DK'
  | 'dv'
  | 'dv-MV'
  | 'dv-Thaa'
  | 'nl'
  | 'nl-BE'
  | 'nl-NL'
  | 'dz'
  | 'dz-BT'
  | 'en-AR'
  | 'en-AS'
  | 'en-AT'
  | 'en-AE'
  | 'en-AU'
  | 'en-BH'
  | 'en-BR'
  | 'en-BE'
  | 'en-BZ'
  | 'en-BW'
  | 'en-BN'
  | 'en-CA'
  | 'en-CL'
  | 'en-CN'
  | 'en-HR'
  | 'en-CZ'
  | 'en-XY'
  | 'en-Dsrt'
  | 'en-DE'
  | 'en-DK'
  | 'en-EG'
  | 'en-FI'
  | 'en-FR'
  | 'en-GI'
  | 'en-GH'
  | 'en-GR'
  | 'en-GU'
  | 'en-HK'
  | 'en-ID'
  | 'en-IN'
  | 'en-IE'
  | 'en-IL'
  | 'en-IT'
  | 'en-JM'
  | 'en-JO'
  | 'en-JP'
  | 'en-KE'
  | 'en-KH'
  | 'en-KR'
  | 'en-KW'
  | 'en-LT'
  | 'en-LV'
  | 'en-MY'
  | 'en-MT'
  | 'en-MH'
  | 'en-MX'
  | 'en-MA'
  | 'en-MU'
  | 'en-NA'
  | 'en-NG'
  | 'en-NL'
  | 'en-NO'
  | 'en-NZ'
  | 'en-MP'
  | 'en-OM'
  | 'en-PL'
  | 'en-PK'
  | 'en-PH'
  | 'en-PT'
  | 'en-QA'
  | 'en-RO'
  | 'en-RU'
  | 'en-SA'
  | 'en-Shaw'
  | 'en-RS'
  | 'en-SI'
  | 'en-SL'
  | 'en-SG'
  | 'en-ZA'
  | 'en-ES'
  | 'en-SE'
  | 'en-CH'
  | 'en-TN'
  | 'en-TW'
  | 'en-TH'
  | 'en-TT'
  | 'en-TR'
  | 'en-GB'
  | 'en-UA'
  | 'en-US'
  | 'en-Dsrt-US'
  | 'en-UM'
  | 'en-USVI'
  | 'en-VN'
  | 'en-ZW'
  | 'en-145'
  | 'en-CY'
  | 'en-HU'
  | 'en-SK'
  | 'en-BA'
  | 'en-XK'
  | 'en-ME'
  | 'en-KA'
  | 'en-KZ'
  | 'en-KG'
  | 'en-TJ'
  | 'en-TM'
  | 'en-UZ'
  | 'en-BG'
  | 'en-MK'
  | 'en-MD'
  | 'en-AL'
  | 'en-AD'
  | 'en-IC'
  | 'eo'
  | 'et'
  | 'et-EE'
  | 'et-LV'
  | 'ee'
  | 'ee-GH'
  | 'ee-TG'
  | 'fo'
  | 'fo-FO'
  | 'fj'
  | 'fi'
  | 'fi-FI'
  | 'fi-Se'
  | 'fr-BE'
  | 'fr-CA'
  | 'fr-FR'
  | 'fr-LU'
  | 'fr-DE'
  | 'fr-MC'
  | 'fr-SN'
  | 'fr-CH'
  | 'fr-MA'
  | 'fr-MU'
  | 'fr-CD'
  | 'fr-CI'
  | 'fr-DZ'
  | 'fr-GP'
  | 'fr-MQ'
  | 'fr-GF'
  | 'fr-RE'
  | 'fr-TN'
  | 'fr-NC'
  | 'ff'
  | 'ff-Arab'
  | 'ff-Latn'
  | 'gd'
  | 'gl'
  | 'gl-ES'
  | 'lg'
  | 'ka'
  | 'ka-GE'
  | 'de-AT'
  | 'de-BE'
  | 'de-DE'
  | 'de-LI'
  | 'de-LU'
  | 'de-NL'
  | 'de-CH'
  | 'el'
  | 'el-CY'
  | 'el-GR'
  | 'gn'
  | 'gu'
  | 'gu-IN'
  | 'ht'
  | 'ht-HT'
  | 'ha'
  | 'ha-Arab'
  | 'ha-GH'
  | 'ha-Latn-GH'
  | 'ha-Latn'
  | 'ha-NE'
  | 'ha-NG'
  | 'ha-Arab-NG'
  | 'ha-Latn-NG'
  | 'ha-Latn-NE'
  | 'ha-SD'
  | 'ha-Arab-SD'
  | 'he'
  | 'he-Hebr'
  | 'he-IL'
  | 'hz'
  | 'hi'
  | 'hi-IN'
  | 'ho'
  | 'hu'
  | 'hu-HU'
  | 'is'
  | 'is-IS'
  | 'io'
  | 'ig'
  | 'ig-NG'
  | 'id'
  | 'id-Arab'
  | 'id-ID'
  | 'id-Arab-ID'
  | 'iu'
  | 'iu-CA'
  | 'ik'
  | 'ga'
  | 'ga-IE'
  | 'it'
  | 'it-AT'
  | 'it-IT'
  | 'it-CH'
  | 'ja'
  | 'ja-JP'
  | 'jv'
  | 'jv-Java'
  | 'jv-Latn'
  | 'kl'
  | 'kl-GL'
  | 'kn'
  | 'kn-IN'
  | 'kr'
  | 'ks'
  | 'ks-Arab'
  | 'ks-Deva'
  | 'ks-Latn'
  | 'kk'
  | 'kk-Arab'
  | 'kk-Cyrl'
  | 'kk-KZ'
  | 'kk-Arab-KZ'
  | 'kk-Cyrl-KZ'
  | 'kk-Latn-KZ'
  | 'kk-Latn'
  | 'ki'
  | 'rw'
  | 'rw-RW'
  | 'ky-Cyrl'
  | 'ky'
  | 'ky-Arab'
  | 'ky-KG'
  | 'ky-Latn'
  | 'kv'
  | 'kg'
  | 'ko'
  | 'ko-KR'
  | 'kj'
  | 'ku'
  | 'ku-Arab'
  | 'ku-IR'
  | 'ku-Arab-IR'
  | 'ku-IQ'
  | 'ku-Arab-IQ'
  | 'ku-Latn'
  | 'ku-SY'
  | 'ku-Arab-SY'
  | 'ku-TR'
  | 'ku-Latn-TR'
  | 'lo'
  | 'lo-LA'
  | 'la'
  | 'lv'
  | 'lv-LV'
  | 'li'
  | 'ln'
  | 'ln-CG'
  | 'ln-CD'
  | 'lt'
  | 'lt-LT'
  | 'lu'
  | 'lb'
  | 'lb-LU'
  | 'mk'
  | 'mk-MK'
  | 'mg'
  | 'ms'
  | 'ml'
  | 'ml-Arab'
  | 'ml-IN'
  | 'ml-Arab-IN'
  | 'ml-Mlym-IN'
  | 'ml-Mlym'
  | 'ms-Arab'
  | 'ms-BN'
  | 'ms-Latn-BN'
  | 'ms-Latn'
  | 'ms-MY'
  | 'ms-Latn-MY'
  | 'mt'
  | 'mt-MT'
  | 'gv'
  | 'gv-GB'
  | 'mi'
  | 'mr'
  | 'mr-IN'
  | 'mh'
  | 'mn'
  | 'mn-CN'
  | 'mn-Mong-CN'
  | 'mn-Cyrl'
  | 'mn-MN'
  | 'mn-Cyrl-MN'
  | 'mn-Mong'
  | 'na'
  | 'nv'
  | 'nd'
  | 'nr'
  | 'nr-ZA'
  | 'ng'
  | 'ne'
  | 'ne-IN'
  | 'ne-NP'
  | 'se'
  | 'se-FI'
  | 'se-NO'
  | 'no'
  | 'no-NO'
  | 'nb'
  | 'nb-NO'
  | 'nn'
  | 'nn-NO'
  | 'oc'
  | 'oc-FR'
  | 'oj'
  | 'or'
  | 'or-IN'
  | 'om'
  | 'om-ET'
  | 'om-KE'
  | 'os'
  | 'os-Cyrl'
  | 'os-Latn'
  | 'pi'
  | 'pi-Deva'
  | 'pi-Sinh'
  | 'pi-Thai'
  | 'pa-Arab'
  | 'pa-Deva'
  | 'pa-Guru'
  | 'pa-Deva-IN'
  | 'pa-Guru-IN'
  | 'pa-Arab-PK'
  | 'pa-Deva-PK'
  | 'fa'
  | 'fa-AF'
  | 'fa-Arab'
  | 'fa-Cyrl'
  | 'fa-IR'
  | 'pl'
  | 'pl-PL'
  | 'pt-BR'
  | 'pt-PT'
  | 'pa'
  | 'pa-PK'
  | 'ps'
  | 'ps-AF'
  | 'ps-Arab'
  | 'qu'
  | 'qu-PE'
  | 'ro'
  | 'ro-MD'
  | 'ro-RO'
  | 'rm'
  | 'rn'
  | 'ru-LV'
  | 'ru-LT'
  | 'ru-RU'
  | 'ru-UA'
  | 'ru-KZ'
  | 'sm'
  | 'sg'
  | 'sa'
  | 'sa-IN'
  | 'sc'
  | 'sr'
  | 'sr-BA'
  | 'sr-Cyrl-BA'
  | 'sr-Latn-BA'
  | 'sr-Cyrl'
  | 'sr-Latn'
  | 'sr-ME'
  | 'sr-Cyrl-ME'
  | 'sr-Latn-ME'
  | 'sr-RS'
  | 'sr-CS'
  | 'sr-Cyrl-CS'
  | 'sr-Latn-CS'
  | 'sr-Cyrl-RS'
  | 'sr-Latn-RS'
  | 'sn'
  | 'ii'
  | 'ii-CN'
  | 'ii-Yiii-CN'
  | 'ii-Yiii'
  | 'sd'
  | 'sd-Arab'
  | 'sd-Deva'
  | 'sd-Guru'
  | 'si'
  | 'si-LK'
  | 'sk'
  | 'sk-SK'
  | 'sl'
  | 'sl-SI'
  | 'so'
  | 'so-Arab'
  | 'so-DJ'
  | 'so-ET'
  | 'so-KE'
  | 'so-SO'
  | 'st'
  | 'st-LS'
  | 'st-ZA'
  | 'es-419'
  | 'es-AR'
  | 'es-BO'
  | 'es-CL'
  | 'es-CO'
  | 'es-CR'
  | 'es-DO'
  | 'es-EC'
  | 'es-ES'
  | 'es-GT'
  | 'es-HN'
  | 'es-IC'
  | 'es-MX'
  | 'es-NI'
  | 'es-PA'
  | 'es-PE'
  | 'es-PT'
  | 'es-PR'
  | 'es-PY'
  | 'es-SV'
  | 'es-US'
  | 'es-UY'
  | 'es-VE'
  | 'su'
  | 'su-Arab'
  | 'su-Java'
  | 'su-Latn'
  | 'sw'
  | 'sw-KE'
  | 'sw-TZ'
  | 'ss'
  | 'ss-ZA'
  | 'ss-SZ'
  | 'sv'
  | 'sv-FI'
  | 'sv-SE'
  | 'tl'
  | 'ty'
  | 'tg'
  | 'tg-Arab'
  | 'tg-Cyrl'
  | 'tg-Latn'
  | 'tg-TJ'
  | 'tg-Arab-TJ'
  | 'tg-Cyrl-TJ'
  | 'tg-Latn-TJ'
  | 'ta'
  | 'ta-IN'
  | 'tt'
  | 'tt-Cyrl'
  | 'tt-Latn'
  | 'tt-RU'
  | 'tt-Cyrl-RU'
  | 'tt-Latn-RU'
  | 'te'
  | 'te-IN'
  | 'th'
  | 'th-TH'
  | 'bo'
  | 'bo-CN'
  | 'bo-IN'
  | 'ti'
  | 'ti-ER'
  | 'ti-ET'
  | 'to'
  | 'ts'
  | 'tn'
  | 'tn-ZA'
  | 'tr'
  | 'tr-TR'
  | 'tk'
  | 'tk-Arab'
  | 'tk-Cyrl'
  | 'tk-Latn'
  | 'tw'
  | 'ug'
  | 'ug-Arab'
  | 'ug-CN'
  | 'ug-Arab-CN'
  | 'ug-Cyrl-CN'
  | 'ug-Latn-CN'
  | 'ug-Cyrl'
  | 'ug-Latn'
  | 'uk'
  | 'uk-UA'
  | 'ur'
  | 'ur-Arab'
  | 'ur-IN'
  | 'ur-PK'
  | 'uz'
  | 'uz-AF'
  | 'uz-Arab-AF'
  | 'uz-Arab'
  | 'uz-Cyrl'
  | 'uz-Latn'
  | 'uz-UZ'
  | 'uz-Cyrl-UZ'
  | 'uz-Latn-UZ'
  | 've'
  | 've-ZA'
  | 'vi'
  | 'vi-VN'
  | 'vo'
  | 'wa'
  | 'cy'
  | 'cy-GB'
  | 'fy'
  | 'wo'
  | 'wo-Arab'
  | 'wo-Latn'
  | 'wo-SN'
  | 'wo-Arab-SN'
  | 'wo-Latn-SN'
  | 'xh'
  | 'xh-ZA'
  | 'yi'
  | 'yi-Hebr'
  | 'yo'
  | 'yo-NG'

export const possibleLocales: LanguageLocale[] = [
  'en',
  'es',
  'de',
  'fr',
  'pt',
  'ru',
  'zh',
  'ab',
  'aa',
  'aa-DJ',
  'aa-ER',
  'aa-ET',
  'aa-Ethi',
  'af',
  'af-NA',
  'af-ZA',
  'ak',
  'ak-GH',
  'sq',
  'sq-AL',
  'sq-MK',
  'am',
  'am-ET',
  'ar',
  'ar-145',
  'ar-DZ',
  'ar-Arab',
  'ar-BH',
  'ar-EG',
  'ar-IQ',
  'ar-IL',
  'ar-JO',
  'ar-KW',
  'ar-LB',
  'ar-LY',
  'ar-MA',
  'ar-OM',
  'ar-QA',
  'ar-SA',
  'ar-SD',
  'ar-SY',
  'ar-TN',
  'ar-AE',
  'ar-YE',
  'an',
  'hy',
  'hy-AM',
  'as',
  'as-IN',
  'av',
  'ae',
  'ay',
  'az',
  'az-Arab',
  'az-AZ',
  'az-Cyrl-AZ',
  'az-Latn-AZ',
  'az-Cyrl',
  'az-Latn',
  'az-IR',
  'az-Arab-IR',
  'bm',
  'ba',
  'eu',
  'eu-FR',
  'eu-ES',
  'be',
  'be-BY',
  'be-Cyrl',
  'be-Latn',
  'bn',
  'bn-bd',
  'bn-IN',
  'bi',
  'bs',
  'bs-BA',
  'br',
  'bg',
  'bg-BG',
  'my',
  'my-MM',
  'ca',
  'ca-ES',
  'km',
  'km-KH',
  'ch',
  'ce',
  'ny',
  'ny-MW',
  'zh-CN',
  'zh-Hans-CN',
  'zh-HK',
  'zh-Hans-HK',
  'zh-Hant-HK',
  'zh-MO',
  'zh-Hans-MO',
  'zh-Hant-MO',
  'zh-Hans',
  'zh-SG',
  'zh-Hans-SG',
  'zh-TW',
  'zh-Hant-TW',
  'zh-Hant',
  'zh-yue',
  'cu',
  'cv',
  'kw',
  'kw-GB',
  'co',
  'cr',
  'hr',
  'hr-HR',
  'cs',
  'cs-CZ',
  'da',
  'da-DK',
  'dv',
  'dv-MV',
  'dv-Thaa',
  'nl',
  'nl-BE',
  'nl-NL',
  'dz',
  'dz-BT',
  'en-AR',
  'en-AS',
  'en-AT',
  'en-AE',
  'en-AU',
  'en-BH',
  'en-BR',
  'en-BE',
  'en-BZ',
  'en-BW',
  'en-BN',
  'en-CA',
  'en-CL',
  'en-CN',
  'en-HR',
  'en-CZ',
  'en-XY',
  'en-Dsrt',
  'en-DE',
  'en-DK',
  'en-EG',
  'en-FI',
  'en-FR',
  'en-GI',
  'en-GH',
  'en-GR',
  'en-GU',
  'en-HK',
  'en-ID',
  'en-IN',
  'en-IE',
  'en-IL',
  'en-IT',
  'en-JM',
  'en-JO',
  'en-JP',
  'en-KE',
  'en-KH',
  'en-KR',
  'en-KW',
  'en-LT',
  'en-LV',
  'en-MY',
  'en-MT',
  'en-MH',
  'en-MX',
  'en-MA',
  'en-MU',
  'en-NA',
  'en-NG',
  'en-NL',
  'en-NO',
  'en-NZ',
  'en-MP',
  'en-OM',
  'en-PL',
  'en-PK',
  'en-PH',
  'en-PT',
  'en-QA',
  'en-RO',
  'en-RU',
  'en-SA',
  'en-Shaw',
  'en-RS',
  'en-SI',
  'en-SL',
  'en-SG',
  'en-ZA',
  'en-ES',
  'en-SE',
  'en-CH',
  'en-TN',
  'en-TW',
  'en-TH',
  'en-TT',
  'en-TR',
  'en-GB',
  'en-UA',
  'en-US',
  'en-Dsrt-US',
  'en-UM',
  'en-USVI',
  'en-VN',
  'en-ZW',
  'en-145',
  'en-CY',
  'en-HU',
  'en-SK',
  'en-BA',
  'en-XK',
  'en-ME',
  'en-KA',
  'en-KZ',
  'en-KG',
  'en-TJ',
  'en-TM',
  'en-UZ',
  'en-BG',
  'en-MK',
  'en-MD',
  'en-AL',
  'en-AD',
  'en-IC',
  'eo',
  'et',
  'et-EE',
  'et-LV',
  'ee',
  'ee-GH',
  'ee-TG',
  'fo',
  'fo-FO',
  'fj',
  'fi',
  'fi-FI',
  'fi-Se',
  'fr-BE',
  'fr-CA',
  'fr-FR',
  'fr-LU',
  'fr-DE',
  'fr-MC',
  'fr-SN',
  'fr-CH',
  'fr-MA',
  'fr-MU',
  'fr-CD',
  'fr-CI',
  'fr-DZ',
  'fr-GP',
  'fr-MQ',
  'fr-GF',
  'fr-RE',
  'fr-TN',
  'fr-NC',
  'ff',
  'ff-Arab',
  'ff-Latn',
  'gd',
  'gl',
  'gl-ES',
  'lg',
  'ka',
  'ka-GE',
  'de-AT',
  'de-BE',
  'de-DE',
  'de-LI',
  'de-LU',
  'de-NL',
  'de-CH',
  'el',
  'el-CY',
  'el-GR',
  'gn',
  'gu',
  'gu-IN',
  'ht',
  'ht-HT',
  'ha',
  'ha-Arab',
  'ha-GH',
  'ha-Latn-GH',
  'ha-Latn',
  'ha-NE',
  'ha-NG',
  'ha-Arab-NG',
  'ha-Latn-NG',
  'ha-Latn-NE',
  'ha-SD',
  'ha-Arab-SD',
  'he',
  'he-Hebr',
  'he-IL',
  'hz',
  'hi',
  'hi-IN',
  'ho',
  'hu',
  'hu-HU',
  'is',
  'is-IS',
  'io',
  'ig',
  'ig-NG',
  'id',
  'id-Arab',
  'id-ID',
  'id-Arab-ID',
  'iu',
  'iu-CA',
  'ik',
  'ga',
  'ga-IE',
  'it',
  'it-AT',
  'it-IT',
  'it-CH',
  'ja',
  'ja-JP',
  'jv',
  'jv-Java',
  'jv-Latn',
  'kl',
  'kl-GL',
  'kn',
  'kn-IN',
  'kr',
  'ks',
  'ks-Arab',
  'ks-Deva',
  'ks-Latn',
  'kk',
  'kk-Arab',
  'kk-Cyrl',
  'kk-KZ',
  'kk-Arab-KZ',
  'kk-Cyrl-KZ',
  'kk-Latn-KZ',
  'kk-Latn',
  'ki',
  'rw',
  'rw-RW',
  'ky-Cyrl',
  'ky',
  'ky-Arab',
  'ky-KG',
  'ky-Latn',
  'kv',
  'kg',
  'ko',
  'ko-KR',
  'kj',
  'ku',
  'ku-Arab',
  'ku-IR',
  'ku-Arab-IR',
  'ku-IQ',
  'ku-Arab-IQ',
  'ku-Latn',
  'ku-SY',
  'ku-Arab-SY',
  'ku-TR',
  'ku-Latn-TR',
  'lo',
  'lo-LA',
  'la',
  'lv',
  'lv-LV',
  'li',
  'ln',
  'ln-CG',
  'ln-CD',
  'lt',
  'lt-LT',
  'lu',
  'lb',
  'lb-LU',
  'mk',
  'mk-MK',
  'mg',
  'ms',
  'ml',
  'ml-Arab',
  'ml-IN',
  'ml-Arab-IN',
  'ml-Mlym-IN',
  'ml-Mlym',
  'ms-Arab',
  'ms-BN',
  'ms-Latn-BN',
  'ms-Latn',
  'ms-MY',
  'ms-Latn-MY',
  'mt',
  'mt-MT',
  'gv',
  'gv-GB',
  'mi',
  'mr',
  'mr-IN',
  'mh',
  'mn',
  'mn-CN',
  'mn-Mong-CN',
  'mn-Cyrl',
  'mn-MN',
  'mn-Cyrl-MN',
  'mn-Mong',
  'na',
  'nv',
  'nd',
  'nr',
  'nr-ZA',
  'ng',
  'ne',
  'ne-IN',
  'ne-NP',
  'se',
  'se-FI',
  'se-NO',
  'no',
  'no-NO',
  'nb',
  'nb-NO',
  'nn',
  'nn-NO',
  'oc',
  'oc-FR',
  'oj',
  'or',
  'or-IN',
  'om',
  'om-ET',
  'om-KE',
  'os',
  'os-Cyrl',
  'os-Latn',
  'pi',
  'pi-Deva',
  'pi-Sinh',
  'pi-Thai',
  'pa-Arab',
  'pa-Deva',
  'pa-Guru',
  'pa-Deva-IN',
  'pa-Guru-IN',
  'pa-Arab-PK',
  'pa-Deva-PK',
  'fa',
  'fa-AF',
  'fa-Arab',
  'fa-Cyrl',
  'fa-IR',
  'pl',
  'pl-PL',
  'pt-BR',
  'pt-PT',
  'pa',
  'pa-PK',
  'ps',
  'ps-AF',
  'ps-Arab',
  'qu',
  'qu-PE',
  'ro',
  'ro-MD',
  'ro-RO',
  'rm',
  'rn',
  'ru-LV',
  'ru-LT',
  'ru-RU',
  'ru-UA',
  'ru-KZ',
  'sm',
  'sg',
  'sa',
  'sa-IN',
  'sc',
  'sr',
  'sr-BA',
  'sr-Cyrl-BA',
  'sr-Latn-BA',
  'sr-Cyrl',
  'sr-Latn',
  'sr-ME',
  'sr-Cyrl-ME',
  'sr-Latn-ME',
  'sr-RS',
  'sr-CS',
  'sr-Cyrl-CS',
  'sr-Latn-CS',
  'sr-Cyrl-RS',
  'sr-Latn-RS',
  'sn',
  'ii',
  'ii-CN',
  'ii-Yiii-CN',
  'ii-Yiii',
  'sd',
  'sd-Arab',
  'sd-Deva',
  'sd-Guru',
  'si',
  'si-LK',
  'sk',
  'sk-SK',
  'sl',
  'sl-SI',
  'so',
  'so-Arab',
  'so-DJ',
  'so-ET',
  'so-KE',
  'so-SO',
  'st',
  'st-LS',
  'st-ZA',
  'es-419',
  'es-AR',
  'es-BO',
  'es-CL',
  'es-CO',
  'es-CR',
  'es-DO',
  'es-EC',
  'es-ES',
  'es-GT',
  'es-HN',
  'es-IC',
  'es-MX',
  'es-NI',
  'es-PA',
  'es-PE',
  'es-PT',
  'es-PR',
  'es-PY',
  'es-SV',
  'es-US',
  'es-UY',
  'es-VE',
  'su',
  'su-Arab',
  'su-Java',
  'su-Latn',
  'sw',
  'sw-KE',
  'sw-TZ',
  'ss',
  'ss-ZA',
  'ss-SZ',
  'sv',
  'sv-FI',
  'sv-SE',
  'tl',
  'ty',
  'tg',
  'tg-Arab',
  'tg-Cyrl',
  'tg-Latn',
  'tg-TJ',
  'tg-Arab-TJ',
  'tg-Cyrl-TJ',
  'tg-Latn-TJ',
  'ta',
  'ta-IN',
  'tt',
  'tt-Cyrl',
  'tt-Latn',
  'tt-RU',
  'tt-Cyrl-RU',
  'tt-Latn-RU',
  'te',
  'te-IN',
  'th',
  'th-TH',
  'bo',
  'bo-CN',
  'bo-IN',
  'ti',
  'ti-ER',
  'ti-ET',
  'to',
  'ts',
  'tn',
  'tn-ZA',
  'tr',
  'tr-TR',
  'tk',
  'tk-Arab',
  'tk-Cyrl',
  'tk-Latn',
  'tw',
  'ug',
  'ug-Arab',
  'ug-CN',
  'ug-Arab-CN',
  'ug-Cyrl-CN',
  'ug-Latn-CN',
  'ug-Cyrl',
  'ug-Latn',
  'uk',
  'uk-UA',
  'ur',
  'ur-Arab',
  'ur-IN',
  'ur-PK',
  'uz',
  'uz-AF',
  'uz-Arab-AF',
  'uz-Arab',
  'uz-Cyrl',
  'uz-Latn',
  'uz-UZ',
  'uz-Cyrl-UZ',
  'uz-Latn-UZ',
  've',
  've-ZA',
  'vi',
  'vi-VN',
  'vo',
  'wa',
  'cy',
  'cy-GB',
  'fy',
  'wo',
  'wo-Arab',
  'wo-Latn',
  'wo-SN',
  'wo-Arab-SN',
  'wo-Latn-SN',
  'xh',
  'xh-ZA',
  'yi',
  'yi-Hebr',
  'yo',
  'yo-NG',
]

export const isValidLanguageLocale = (
  locale: string,
): locale is LanguageLocale => {
  return possibleLocales.map(String).includes(locale)
}

const iso639Labels: Record<string, string> = {
  ab: 'Abkhazian',
  aa: 'Afar',
  af: 'Afrikaans',
  ak: 'Akan',
  sq: 'Albanian',
  am: 'Amharic',
  ar: 'Arabic',
  an: 'Aragonese',
  hy: 'Armenian',
  as: 'Assamese',
  av: 'Avaric',
  ae: 'Avestan',
  ay: 'Aymara',
  az: 'Azerbaijani',
  bm: 'Bambara',
  ba: 'Bashkir',
  eu: 'Basque',
  be: 'Belarusian',
  bn: 'Bengali',
  bi: 'Bislama',
  bs: 'Bosnian',
  br: 'Breton',
  bg: 'Bulgarian',
  my: 'Burmese',
  ca: 'Catalan',
  ch: 'Chamorro',
  ce: 'Chechen',
  ny: 'Chichewa',
  zh: 'Chinese',
  cu: 'Church Slavonic',
  cv: 'Chuvash',
  kw: 'Cornish',
  co: 'Corsican',
  cr: 'Cree',
  hr: 'Croatian',
  cs: 'Czech',
  da: 'Danish',
  dv: 'Divehi',
  nl: 'Dutch',
  dz: 'Dzongkha',
  en: 'English',
  eo: 'Esperanto',
  et: 'Estonian',
  ee: 'Ewe',
  fo: 'Faroese',
  fj: 'Fijian',
  fi: 'Finnish',
  fr: 'French',
  fy: 'Western Frisian',
  ff: 'Fulah',
  gd: 'Gaelic',
  gl: 'Galician',
  lg: 'Ganda',
  ka: 'Georgian',
  de: 'German',
  el: 'Greek',
  kl: 'Kalaallisut',
  gn: 'Guarani',
  gu: 'Gujarati',
  ht: 'Haitian',
  ha: 'Hausa',
  he: 'Hebrew',
  hz: 'Herero',
  hi: 'Hindi',
  ho: 'Hiri Motu',
  hu: 'Hungarian',
  is: 'Icelandic',
  io: 'Ido',
  ig: 'Igbo',
  id: 'Indonesian',
  iu: 'Inuktitut',
  ik: 'Inupiaq',
  ga: 'Irish',
  it: 'Italian',
  ja: 'Japanese',
  jv: 'Javanese',
  kn: 'Kannada',
  kr: 'Kanuri',
  ks: 'Kashmiri',
  kk: 'Kazakh',
  km: 'Central Khmer',
  ki: 'Kikuyu',
  rw: 'Kinyarwanda',
  ky: 'Kirghiz',
  kv: 'Komi',
  kg: 'Kongo',
  ko: 'Korean',
  kj: 'Kuanyama',
  ku: 'Kurdish',
  lo: 'Lao',
  la: 'Latin',
  lv: 'Latvian',
  li: 'Limburgan',
  ln: 'Lingala',
  lt: 'Lithuanian',
  lu: 'Luba-Katanga',
  lb: 'Luxembourgish',
  mk: 'Macedonian',
  mg: 'Malagasy',
  ms: 'Malay',
  ml: 'Malayalam',
  mt: 'Maltese',
  gv: 'Manx',
  mi: 'Maori',
  mr: 'Marathi',
  mh: 'Marshallese',
  mn: 'Mongolian',
  na: 'Nauru',
  nv: 'Navajo',
  nd: 'North Ndebele',
  nr: 'South Ndebele',
  ng: 'Ndonga',
  ne: 'Nepali',
  no: 'Norwegian',
  nb: 'Norwegian Bokmål',
  nn: 'Norwegian Nynorsk',
  ii: 'Sichuan Yi',
  oc: 'Occitan',
  oj: 'Ojibwa',
  or: 'Oriya',
  om: 'Oromo',
  os: 'Ossetian',
  pi: 'Pali',
  ps: 'Pashto',
  fa: 'Persian',
  pl: 'Polish',
  pt: 'Portuguese',
  pa: 'Punjabi',
  qu: 'Quechua',
  ro: 'Romanian',
  rm: 'Romansh',
  rn: 'Rundi',
  ru: 'Russian',
  se: 'Northern Sami',
  sm: 'Samoan',
  sg: 'Sango',
  sa: 'Sanskrit',
  sc: 'Sardinian',
  sr: 'Serbian',
  sn: 'Shona',
  sd: 'Sindhi',
  si: 'Sinhala',
  sk: 'Slovak',
  sl: 'Slovenian',
  so: 'Somali',
  st: 'Southern Sotho',
  es: 'Spanish',
  su: 'Sundanese',
  sw: 'Swahili',
  ss: 'Swati',
  sv: 'Swedish',
  tl: 'Tagalog',
  ty: 'Tahitian',
  tg: 'Tajik',
  ta: 'Tamil',
  tt: 'Tatar',
  te: 'Telugu',
  th: 'Thai',
  bo: 'Tibetan',
  ti: 'Tigrinya',
  to: 'Tonga',
  ts: 'Tsonga',
  tn: 'Tswana',
  tr: 'Turkish',
  tk: 'Turkmen',
  tw: 'Twi',
  ug: 'Uighur',
  uk: 'Ukrainian',
  ur: 'Urdu',
  uz: 'Uzbek',
  ve: 'Venda',
  vi: 'Vietnamese',
  vo: 'Volapük',
  wa: 'Walloon',
  cy: 'Welsh',
  wo: 'Wolof',
  xh: 'Xhosa',
  yi: 'Yiddish',
  yo: 'Yoruba',
  za: 'Zhuang',
  zu: 'Zulu',
}

export const getISO639LabelFromLocale = (locale: LanguageLocale) => {
  const code = locale.split('-')[0]

  return iso639Labels[code]
}
