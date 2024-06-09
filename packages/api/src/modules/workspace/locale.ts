export type LanguageLocale =
  | 'en'
  | 'es'
  | 'de'
  | 'fr'
  | 'pt'
  | 'ru'
  | 'zh'
  | 'ab'
  | 'ace'
  | 'ach'
  | 'ada'
  | 'ady'
  | 'aa'
  | 'aa-DJ'
  | 'aa-ER'
  | 'aa-ET'
  | 'aa-Ethi'
  | 'afh'
  | 'af'
  | 'af-NA'
  | 'af-ZA'
  | 'afa'
  | 'ain'
  | 'ain-Latn'
  | 'ak'
  | 'ak-GH'
  | 'akk'
  | 'sq'
  | 'sq-AL'
  | 'sq-MK'
  | 'ale'
  | 'alg'
  | 'tut'
  | 'am'
  | 'am-ET'
  | 'anp'
  | 'apa'
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
  | 'arp'
  | 'arn'
  | 'arw'
  | 'hy'
  | 'hy-AM'
  | 'rup'
  | 'rup-Grek'
  | 'rup-Latn'
  | 'art'
  | 'as'
  | 'as-IN'
  | 'ast'
  | 'ath'
  | 'cch'
  | 'cch-NG'
  | 'aus'
  | 'map'
  | 'av'
  | 'ae'
  | 'awa'
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
  | 'ban'
  | 'bat'
  | 'bal'
  | 'bal-Arab'
  | 'bm'
  | 'bai'
  | 'bad'
  | 'bnt'
  | 'bas'
  | 'ba'
  | 'eu'
  | 'eu-FR'
  | 'eu-ES'
  | 'btk'
  | 'bej'
  | 'be'
  | 'be-BY'
  | 'be-Cyrl'
  | 'be-Latn'
  | 'bem'
  | 'bn'
  | 'bn-bd'
  | 'bn-IN'
  | 'ber'
  | 'bho'
  | 'bh'
  | 'bik'
  | 'bin'
  | 'bi'
  | 'byn'
  | 'byn-ER'
  | 'zbl'
  | 'bs'
  | 'bs-BA'
  | 'bra'
  | 'br'
  | 'bug'
  | 'bg'
  | 'bg-BG'
  | 'bua'
  | 'my'
  | 'my-MM'
  | 'cad'
  | 'car'
  | 'ca'
  | 'ca-ES'
  | 'cau'
  | 'ceb'
  | 'cel'
  | 'cai'
  | 'km'
  | 'km-KH'
  | 'cmc'
  | 'cmc-Arab'
  | 'ch'
  | 'ce'
  | 'chr'
  | 'chy'
  | 'cnr'
  | 'cnr-ME'
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
  | 'chn'
  | 'chp'
  | 'cho'
  | 'cu'
  | 'chk'
  | 'cv'
  | 'kw'
  | 'kw-GB'
  | 'co'
  | 'cr'
  | 'mus'
  | 'crp'
  | 'crh'
  | 'crh-Cyrl'
  | 'crh-Latn'
  | 'hr'
  | 'hr-HR'
  | 'cus'
  | 'cs'
  | 'cs-CZ'
  | 'dak'
  | 'da'
  | 'da-DK'
  | 'dar'
  | 'day'
  | 'del'
  | 'din'
  | 'dv'
  | 'dv-MV'
  | 'dv-Thaa'
  | 'doi'
  | 'dgr'
  | 'dra'
  | 'dua'
  | 'nl'
  | 'nl-BE'
  | 'nl-NL'
  | 'dyu'
  | 'dz'
  | 'dz-BT'
  | 'frs'
  | 'efi'
  | 'eka'
  | 'en-AR'
  | 'en-AS'
  | 'en-AT'
  | 'en-AE'
  | 'en-AU'
  | 'en-BH'
  | 'en-BR'
  | 'cpe'
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
  | 'myv'
  | 'eo'
  | 'et'
  | 'et-EE'
  | 'et-LV'
  | 'ee'
  | 'ee-GH'
  | 'ee-TG'
  | 'ewo'
  | 'fan'
  | 'fat'
  | 'fo'
  | 'fo-FO'
  | 'fj'
  | 'fil'
  | 'fil-PH'
  | 'fi'
  | 'fi-FI'
  | 'fi-Se'
  | 'fiu'
  | 'fon'
  | 'cpf'
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
  | 'fur'
  | 'fur-IT'
  | 'ff'
  | 'ff-Arab'
  | 'ff-Latn'
  | 'gaa'
  | 'gd'
  | 'gaa-GH'
  | 'gl'
  | 'gl-ES'
  | 'lg'
  | 'gay'
  | 'gba'
  | 'gez'
  | 'gez-ER'
  | 'gez-ET'
  | 'ka'
  | 'ka-GE'
  | 'de-AT'
  | 'de-BE'
  | 'de-DE'
  | 'gem'
  | 'de-LI'
  | 'de-LU'
  | 'de-NL'
  | 'de-CH'
  | 'gil'
  | 'gon'
  | 'gor'
  | 'grb'
  | 'el'
  | 'el-CY'
  | 'el-GR'
  | 'gn'
  | 'gu'
  | 'gu-IN'
  | 'gwi'
  | 'hai'
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
  | 'haw'
  | 'haw-US'
  | 'he'
  | 'he-Hebr'
  | 'he-IL'
  | 'hz'
  | 'hil'
  | 'him'
  | 'hi'
  | 'hi-IN'
  | 'ho'
  | 'hit'
  | 'hmn'
  | 'hu'
  | 'hu-HU'
  | 'hup'
  | 'iba'
  | 'is'
  | 'is-IS'
  | 'io'
  | 'ig'
  | 'ig-NG'
  | 'ijo'
  | 'ilo'
  | 'smn'
  | 'inc'
  | 'ine'
  | 'id'
  | 'id-Arab'
  | 'id-ID'
  | 'id-Arab-ID'
  | 'inh'
  | 'in'
  | 'in-ID'
  | 'ia'
  | 'ie'
  | 'iu'
  | 'iu-CA'
  | 'ik'
  | 'ira'
  | 'ga'
  | 'ga-IE'
  | 'iro'
  | 'it'
  | 'it-AT'
  | 'it-IT'
  | 'it-CH'
  | 'ja'
  | 'ja-JP'
  | 'jv'
  | 'jv-Java'
  | 'jv-Latn'
  | 'jrb'
  | 'jpr'
  | 'kbd'
  | 'kab'
  | 'kac'
  | 'kl'
  | 'kl-GL'
  | 'xal'
  | 'xal-Cyrl'
  | 'xal-Mong'
  | 'kam'
  | 'kam-KE'
  | 'kn'
  | 'kn-IN'
  | 'kr'
  | 'krc'
  | 'kaa'
  | 'krl'
  | 'kar'
  | 'ks'
  | 'ks-Arab'
  | 'ks-Deva'
  | 'ks-Latn'
  | 'csb'
  | 'kaw'
  | 'kk'
  | 'kk-Arab'
  | 'kk-Cyrl'
  | 'kk-KZ'
  | 'kk-Arab-KZ'
  | 'kk-Cyrl-KZ'
  | 'kk-Latn-KZ'
  | 'kk-Latn'
  | 'kha'
  | 'khi'
  | 'kho'
  | 'ki'
  | 'kmb'
  | 'rw'
  | 'rw-RW'
  | 'ky-Cyrl'
  | 'ky'
  | 'ky-Arab'
  | 'ky-KG'
  | 'ky-Latn'
  | 'tlh'
  | 'kv'
  | 'kg'
  | 'kok'
  | 'kok-IN'
  | 'kok-Knda-IN'
  | 'kok-Latn-IN'
  | 'kok-Mlym-IN'
  | 'kok-Knda'
  | 'kok-Latn'
  | 'kok-Mlym'
  | 'ko'
  | 'ko-KR'
  | 'kfo'
  | 'kfo-CI'
  | 'kos'
  | 'kpe'
  | 'kpe-GN'
  | 'kpe-LR'
  | 'kro'
  | 'kj'
  | 'kum'
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
  | 'kru'
  | 'kut'
  | 'lad'
  | 'lad-Hebr'
  | 'lad-Latn'
  | 'lah'
  | 'lam'
  | 'lo'
  | 'lo-LA'
  | 'la'
  | 'lv'
  | 'lv-LV'
  | 'lez'
  | 'li'
  | 'ln'
  | 'ln-CG'
  | 'ln-CD'
  | 'lt'
  | 'lt-LT'
  | 'jbo'
  | 'dsb'
  | 'nds'
  | 'nds-DE'
  | 'loz'
  | 'lu'
  | 'lua'
  | 'lui'
  | 'smj'
  | 'lun'
  | 'luo'
  | 'lus'
  | 'lb'
  | 'lb-LU'
  | 'mk'
  | 'mk-MK'
  | 'mad'
  | 'mag'
  | 'mai'
  | 'mak'
  | 'mak-Bugi'
  | 'mak-Latn'
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
  | 'mnc'
  | 'mdr'
  | 'man'
  | 'mni'
  | 'mno'
  | 'gv'
  | 'gv-GB'
  | 'mi'
  | 'mr'
  | 'mr-IN'
  | 'chm'
  | 'mh'
  | 'mwr'
  | 'mas'
  | 'myn'
  | 'men'
  | 'mic'
  | 'min'
  | 'mwl'
  | 'moh'
  | 'mdf'
  | 'mo'
  | 'mo-MD'
  | 'lol'
  | 'mn'
  | 'mn-CN'
  | 'mn-Mong-CN'
  | 'mn-Cyrl'
  | 'mn-MN'
  | 'mn-Cyrl-MN'
  | 'mn-Mong'
  | 'mkh'
  | 'mos'
  | 'mul'
  | 'mun'
  | 'nah'
  | 'na'
  | 'nv'
  | 'nd'
  | 'nr'
  | 'nr-ZA'
  | 'ng'
  | 'nap'
  | 'new'
  | 'ne'
  | 'ne-IN'
  | 'ne-NP'
  | 'nia'
  | 'nic'
  | 'ssa'
  | 'niu'
  | 'nqo'
  | 'nog'
  | 'zxx'
  | 'nai'
  | 'frr'
  | 'se'
  | 'se-FI'
  | 'se-NO'
  | 'no'
  | 'no-NO'
  | 'nb'
  | 'nb-NO'
  | 'nn'
  | 'nn-NO'
  | 'nub'
  | 'nym'
  | 'nyn'
  | 'nyo'
  | 'nzi'
  | 'oc'
  | 'oc-FR'
  | 'oj'
  | 'or'
  | 'or-IN'
  | 'om'
  | 'om-ET'
  | 'om-KE'
  | 'osa'
  | 'os'
  | 'os-Cyrl'
  | 'os-Latn'
  | 'oto'
  | 'pal'
  | 'pau'
  | 'pi'
  | 'pi-Deva'
  | 'pi-Sinh'
  | 'pi-Thai'
  | 'pam'
  | 'pam-IN'
  | 'pag'
  | 'pa-Arab'
  | 'pa-Deva'
  | 'pa-Guru'
  | 'pa-Deva-IN'
  | 'pa-Guru-IN'
  | 'pa-Arab-PK'
  | 'pa-Deva-PK'
  | 'pap'
  | 'paa'
  | 'nso'
  | 'nso-ZA'
  | 'fa'
  | 'fa-AF'
  | 'fa-Arab'
  | 'fa-Cyrl'
  | 'fa-IR'
  | 'phi'
  | 'pon'
  | 'pl'
  | 'pl-PL'
  | 'cpp'
  | 'pt-BR'
  | 'pt-PT'
  | 'pra'
  | 'pa'
  | 'pa-PK'
  | 'ps'
  | 'ps-AF'
  | 'ps-Arab'
  | 'qu'
  | 'qu-PE'
  | 'raj'
  | 'raj-Arab'
  | 'raj-Deva'
  | 'rap'
  | 'rar'
  | 'roa'
  | 'ro'
  | 'ro-MD'
  | 'ro-RO'
  | 'rm'
  | 'rom'
  | 'rn'
  | 'ru-LV'
  | 'ru-LT'
  | 'ru-RU'
  | 'ru-UA'
  | 'ru-KZ'
  | 'sal'
  | 'sam'
  | 'sam-Syrc'
  | 'smi'
  | 'sm'
  | 'sad'
  | 'sg'
  | 'sa'
  | 'sa-IN'
  | 'sat'
  | 'sat-Beng'
  | 'sat-Deva'
  | 'sat-Latn'
  | 'sat-Orya'
  | 'sc'
  | 'sas'
  | 'sco'
  | 'sel'
  | 'sem'
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
  | 'sh'
  | 'sh-BA'
  | 'sh-ME'
  | 'sh-CS'
  | 'srr'
  | 'srr-Arab'
  | 'srr-Latn'
  | 'shn'
  | 'sn'
  | 'ii'
  | 'ii-CN'
  | 'ii-Yiii-CN'
  | 'ii-Yiii'
  | 'scn'
  | 'sid'
  | 'sid-ET'
  | 'sid-Ethi'
  | 'sid-Latn'
  | 'sgn'
  | 'bla'
  | 'sd'
  | 'sd-Arab'
  | 'sd-Deva'
  | 'sd-Guru'
  | 'si'
  | 'si-LK'
  | 'sit'
  | 'sio'
  | 'sms'
  | 'den'
  | 'sla'
  | 'sk'
  | 'sk-SK'
  | 'sl'
  | 'sl-SI'
  | 'sog'
  | 'so'
  | 'so-Arab'
  | 'so-DJ'
  | 'so-ET'
  | 'so-KE'
  | 'so-SO'
  | 'son'
  | 'snk'
  | 'snk-Arab'
  | 'snk-Latn'
  | 'wen'
  | 'st'
  | 'st-LS'
  | 'st-ZA'
  | 'sai'
  | 'alt'
  | 'sma'
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
  | 'srn'
  | 'suk'
  | 'sux'
  | 'su'
  | 'su-Arab'
  | 'su-Java'
  | 'su-Latn'
  | 'sus'
  | 'sus-Arab'
  | 'sus-Latn'
  | 'sw'
  | 'sw-KE'
  | 'sw-TZ'
  | 'ss'
  | 'ss-ZA'
  | 'ss-SZ'
  | 'sv'
  | 'sv-FI'
  | 'sv-SE'
  | 'gsw'
  | 'gsw-CH'
  | 'syr'
  | 'syr-Cyrl'
  | 'syr-SY'
  | 'syr-Syrc'
  | 'syr-Cyrl-SY'
  | 'tl'
  | 'ty'
  | 'tai'
  | 'tg'
  | 'tg-Arab'
  | 'tg-Cyrl'
  | 'tg-Latn'
  | 'tg-TJ'
  | 'tg-Arab-TJ'
  | 'tg-Cyrl-TJ'
  | 'tg-Latn-TJ'
  | 'tmh'
  | 'tmh-Arab'
  | 'tmh-Latn'
  | 'tmh-Tfng'
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
  | 'ter'
  | 'tet'
  | 'th'
  | 'th-TH'
  | 'bo'
  | 'bo-CN'
  | 'bo-IN'
  | 'tig'
  | 'tig-ER'
  | 'ti'
  | 'ti-ER'
  | 'ti-ET'
  | 'tem'
  | 'tiv'
  | 'tli'
  | 'tkl'
  | 'tpi'
  | 'tog'
  | 'tog-TO'
  | 'to'
  | 'tsi'
  | 'tsi-ZA'
  | 'ts'
  | 'tn'
  | 'tn-ZA'
  | 'tum'
  | 'tup'
  | 'tr'
  | 'tr-TR'
  | 'tk'
  | 'tk-Arab'
  | 'tk-Cyrl'
  | 'tk-Latn'
  | 'tvl'
  | 'tyv'
  | 'tw'
  | 'kcg'
  | 'kcg-NG'
  | 'udm'
  | 'udm-Cyrl'
  | 'udm-Latn'
  | 'uga'
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
  | 'umb'
  | 'mis'
  | 'und'
  | 'hsb'
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
  | 'vai'
  | 've'
  | 've-ZA'
  | 'vi'
  | 'vi-VN'
  | 'vo'
  | 'vot'
  | 'wak'
  | 'wal'
  | 'wal-ET'
  | 'wa'
  | 'war'
  | 'was'
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
  | 'sah'
  | 'yao'
  | 'yap'
  | 'yi'
  | 'yi-Hebr'
  | 'yo'
  | 'yo-NG'
  | 'ypk'
  | 'znd'
  | 'zap'
  | 'zza'
  | 'zen'

export const possibleLocales: LanguageLocale[] = [
  'en',
  'es',
  'de',
  'fr',
  'pt',
  'ru',
  'zh',
  'ab',
  'ace',
  'ach',
  'ada',
  'ady',
  'aa',
  'aa-DJ',
  'aa-ER',
  'aa-ET',
  'aa-Ethi',
  'afh',
  'af',
  'af-NA',
  'af-ZA',
  'afa',
  'ain',
  'ain-Latn',
  'ak',
  'ak-GH',
  'akk',
  'sq',
  'sq-AL',
  'sq-MK',
  'ale',
  'alg',
  'tut',
  'am',
  'am-ET',
  'anp',
  'apa',
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
  'arp',
  'arn',
  'arw',
  'hy',
  'hy-AM',
  'rup',
  'rup-Grek',
  'rup-Latn',
  'art',
  'as',
  'as-IN',
  'ast',
  'ath',
  'cch',
  'cch-NG',
  'aus',
  'map',
  'av',
  'ae',
  'awa',
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
  'ban',
  'bat',
  'bal',
  'bal-Arab',
  'bm',
  'bai',
  'bad',
  'bnt',
  'bas',
  'ba',
  'eu',
  'eu-FR',
  'eu-ES',
  'btk',
  'bej',
  'be',
  'be-BY',
  'be-Cyrl',
  'be-Latn',
  'bem',
  'bn',
  'bn-bd',
  'bn-IN',
  'ber',
  'bho',
  'bh',
  'bik',
  'bin',
  'bi',
  'byn',
  'byn-ER',
  'zbl',
  'bs',
  'bs-BA',
  'bra',
  'br',
  'bug',
  'bg',
  'bg-BG',
  'bua',
  'my',
  'my-MM',
  'cad',
  'car',
  'ca',
  'ca-ES',
  'cau',
  'ceb',
  'cel',
  'cai',
  'km',
  'km-KH',
  'cmc',
  'cmc-Arab',
  'ch',
  'ce',
  'chr',
  'chy',
  'cnr',
  'cnr-ME',
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
  'chn',
  'chp',
  'cho',
  'cu',
  'chk',
  'cv',
  'kw',
  'kw-GB',
  'co',
  'cr',
  'mus',
  'crp',
  'crh',
  'crh-Cyrl',
  'crh-Latn',
  'hr',
  'hr-HR',
  'cus',
  'cs',
  'cs-CZ',
  'dak',
  'da',
  'da-DK',
  'dar',
  'day',
  'del',
  'din',
  'dv',
  'dv-MV',
  'dv-Thaa',
  'doi',
  'dgr',
  'dra',
  'dua',
  'nl',
  'nl-BE',
  'nl-NL',
  'dyu',
  'dz',
  'dz-BT',
  'frs',
  'efi',
  'eka',
  'en-AR',
  'en-AS',
  'en-AT',
  'en-AE',
  'en-AU',
  'en-BH',
  'en-BR',
  'cpe',
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
  'myv',
  'eo',
  'et',
  'et-EE',
  'et-LV',
  'ee',
  'ee-GH',
  'ee-TG',
  'ewo',
  'fan',
  'fat',
  'fo',
  'fo-FO',
  'fj',
  'fil',
  'fil-PH',
  'fi',
  'fi-FI',
  'fi-Se',
  'fiu',
  'fon',
  'cpf',
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
  'fur',
  'fur-IT',
  'ff',
  'ff-Arab',
  'ff-Latn',
  'gaa',
  'gd',
  'gaa-GH',
  'gl',
  'gl-ES',
  'lg',
  'gay',
  'gba',
  'gez',
  'gez-ER',
  'gez-ET',
  'ka',
  'ka-GE',
  'de-AT',
  'de-BE',
  'de-DE',
  'gem',
  'de-LI',
  'de-LU',
  'de-NL',
  'de-CH',
  'gil',
  'gon',
  'gor',
  'grb',
  'el',
  'el-CY',
  'el-GR',
  'gn',
  'gu',
  'gu-IN',
  'gwi',
  'hai',
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
  'haw',
  'haw-US',
  'he',
  'he-Hebr',
  'he-IL',
  'hz',
  'hil',
  'him',
  'hi',
  'hi-IN',
  'ho',
  'hit',
  'hmn',
  'hu',
  'hu-HU',
  'hup',
  'iba',
  'is',
  'is-IS',
  'io',
  'ig',
  'ig-NG',
  'ijo',
  'ilo',
  'smn',
  'inc',
  'ine',
  'id',
  'id-Arab',
  'id-ID',
  'id-Arab-ID',
  'inh',
  'in',
  'in-ID',
  'ia',
  'ie',
  'iu',
  'iu-CA',
  'ik',
  'ira',
  'ga',
  'ga-IE',
  'iro',
  'it',
  'it-AT',
  'it-IT',
  'it-CH',
  'ja',
  'ja-JP',
  'jv',
  'jv-Java',
  'jv-Latn',
  'jrb',
  'jpr',
  'kbd',
  'kab',
  'kac',
  'kl',
  'kl-GL',
  'xal',
  'xal-Cyrl',
  'xal-Mong',
  'kam',
  'kam-KE',
  'kn',
  'kn-IN',
  'kr',
  'krc',
  'kaa',
  'krl',
  'kar',
  'ks',
  'ks-Arab',
  'ks-Deva',
  'ks-Latn',
  'csb',
  'kaw',
  'kk',
  'kk-Arab',
  'kk-Cyrl',
  'kk-KZ',
  'kk-Arab-KZ',
  'kk-Cyrl-KZ',
  'kk-Latn-KZ',
  'kk-Latn',
  'kha',
  'khi',
  'kho',
  'ki',
  'kmb',
  'rw',
  'rw-RW',
  'ky-Cyrl',
  'ky',
  'ky-Arab',
  'ky-KG',
  'ky-Latn',
  'tlh',
  'kv',
  'kg',
  'kok',
  'kok-IN',
  'kok-Knda-IN',
  'kok-Latn-IN',
  'kok-Mlym-IN',
  'kok-Knda',
  'kok-Latn',
  'kok-Mlym',
  'ko',
  'ko-KR',
  'kfo',
  'kfo-CI',
  'kos',
  'kpe',
  'kpe-GN',
  'kpe-LR',
  'kro',
  'kj',
  'kum',
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
  'kru',
  'kut',
  'lad',
  'lad-Hebr',
  'lad-Latn',
  'lah',
  'lam',
  'lo',
  'lo-LA',
  'la',
  'lv',
  'lv-LV',
  'lez',
  'li',
  'ln',
  'ln-CG',
  'ln-CD',
  'lt',
  'lt-LT',
  'jbo',
  'dsb',
  'nds',
  'nds-DE',
  'loz',
  'lu',
  'lua',
  'lui',
  'smj',
  'lun',
  'luo',
  'lus',
  'lb',
  'lb-LU',
  'mk',
  'mk-MK',
  'mad',
  'mag',
  'mai',
  'mak',
  'mak-Bugi',
  'mak-Latn',
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
  'mnc',
  'mdr',
  'man',
  'mni',
  'mno',
  'gv',
  'gv-GB',
  'mi',
  'mr',
  'mr-IN',
  'chm',
  'mh',
  'mwr',
  'mas',
  'myn',
  'men',
  'mic',
  'min',
  'mwl',
  'moh',
  'mdf',
  'mo',
  'mo-MD',
  'lol',
  'mn',
  'mn-CN',
  'mn-Mong-CN',
  'mn-Cyrl',
  'mn-MN',
  'mn-Cyrl-MN',
  'mn-Mong',
  'mkh',
  'mos',
  'mul',
  'mun',
  'nah',
  'na',
  'nv',
  'nd',
  'nr',
  'nr-ZA',
  'ng',
  'nap',
  'new',
  'ne',
  'ne-IN',
  'ne-NP',
  'nia',
  'nic',
  'ssa',
  'niu',
  'nqo',
  'nog',
  'zxx',
  'nai',
  'frr',
  'se',
  'se-FI',
  'se-NO',
  'no',
  'no-NO',
  'nb',
  'nb-NO',
  'nn',
  'nn-NO',
  'nub',
  'nym',
  'nyn',
  'nyo',
  'nzi',
  'oc',
  'oc-FR',
  'oj',
  'or',
  'or-IN',
  'om',
  'om-ET',
  'om-KE',
  'osa',
  'os',
  'os-Cyrl',
  'os-Latn',
  'oto',
  'pal',
  'pau',
  'pi',
  'pi-Deva',
  'pi-Sinh',
  'pi-Thai',
  'pam',
  'pam-IN',
  'pag',
  'pa-Arab',
  'pa-Deva',
  'pa-Guru',
  'pa-Deva-IN',
  'pa-Guru-IN',
  'pa-Arab-PK',
  'pa-Deva-PK',
  'pap',
  'paa',
  'nso',
  'nso-ZA',
  'fa',
  'fa-AF',
  'fa-Arab',
  'fa-Cyrl',
  'fa-IR',
  'phi',
  'pon',
  'pl',
  'pl-PL',
  'cpp',
  'pt-BR',
  'pt-PT',
  'pra',
  'pa',
  'pa-PK',
  'ps',
  'ps-AF',
  'ps-Arab',
  'qu',
  'qu-PE',
  'raj',
  'raj-Arab',
  'raj-Deva',
  'rap',
  'rar',
  'roa',
  'ro',
  'ro-MD',
  'ro-RO',
  'rm',
  'rom',
  'rn',
  'ru-LV',
  'ru-LT',
  'ru-RU',
  'ru-UA',
  'ru-KZ',
  'sal',
  'sam',
  'sam-Syrc',
  'smi',
  'sm',
  'sad',
  'sg',
  'sa',
  'sa-IN',
  'sat',
  'sat-Beng',
  'sat-Deva',
  'sat-Latn',
  'sat-Orya',
  'sc',
  'sas',
  'sco',
  'sel',
  'sem',
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
  'sh',
  'sh-BA',
  'sh-ME',
  'sh-CS',
  'srr',
  'srr-Arab',
  'srr-Latn',
  'shn',
  'sn',
  'ii',
  'ii-CN',
  'ii-Yiii-CN',
  'ii-Yiii',
  'scn',
  'sid',
  'sid-ET',
  'sid-Ethi',
  'sid-Latn',
  'sgn',
  'bla',
  'sd',
  'sd-Arab',
  'sd-Deva',
  'sd-Guru',
  'si',
  'si-LK',
  'sit',
  'sio',
  'sms',
  'den',
  'sla',
  'sk',
  'sk-SK',
  'sl',
  'sl-SI',
  'sog',
  'so',
  'so-Arab',
  'so-DJ',
  'so-ET',
  'so-KE',
  'so-SO',
  'son',
  'snk',
  'snk-Arab',
  'snk-Latn',
  'wen',
  'st',
  'st-LS',
  'st-ZA',
  'sai',
  'alt',
  'sma',
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
  'srn',
  'suk',
  'sux',
  'su',
  'su-Arab',
  'su-Java',
  'su-Latn',
  'sus',
  'sus-Arab',
  'sus-Latn',
  'sw',
  'sw-KE',
  'sw-TZ',
  'ss',
  'ss-ZA',
  'ss-SZ',
  'sv',
  'sv-FI',
  'sv-SE',
  'gsw',
  'gsw-CH',
  'syr',
  'syr-Cyrl',
  'syr-SY',
  'syr-Syrc',
  'syr-Cyrl-SY',
  'tl',
  'ty',
  'tai',
  'tg',
  'tg-Arab',
  'tg-Cyrl',
  'tg-Latn',
  'tg-TJ',
  'tg-Arab-TJ',
  'tg-Cyrl-TJ',
  'tg-Latn-TJ',
  'tmh',
  'tmh-Arab',
  'tmh-Latn',
  'tmh-Tfng',
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
  'ter',
  'tet',
  'th',
  'th-TH',
  'bo',
  'bo-CN',
  'bo-IN',
  'tig',
  'tig-ER',
  'ti',
  'ti-ER',
  'ti-ET',
  'tem',
  'tiv',
  'tli',
  'tkl',
  'tpi',
  'tog',
  'tog-TO',
  'to',
  'tsi',
  'tsi-ZA',
  'ts',
  'tn',
  'tn-ZA',
  'tum',
  'tup',
  'tr',
  'tr-TR',
  'tk',
  'tk-Arab',
  'tk-Cyrl',
  'tk-Latn',
  'tvl',
  'tyv',
  'tw',
  'kcg',
  'kcg-NG',
  'udm',
  'udm-Cyrl',
  'udm-Latn',
  'uga',
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
  'umb',
  'mis',
  'und',
  'hsb',
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
  'vai',
  've',
  've-ZA',
  'vi',
  'vi-VN',
  'vo',
  'vot',
  'wak',
  'wal',
  'wal-ET',
  'wa',
  'war',
  'was',
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
  'sah',
  'yao',
  'yap',
  'yi',
  'yi-Hebr',
  'yo',
  'yo-NG',
  'ypk',
  'znd',
  'zap',
  'zza',
  'zen',
]

export const isValidLanguageLocale = (
  locale: string,
): locale is LanguageLocale => {
  return possibleLocales.map(String).includes(locale)
}

const iso639Labels: Record<string, string | undefined> = {
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

  return iso639Labels[code] ?? null
}
