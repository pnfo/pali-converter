import { checkRomanConvert, checkUnconverted, convert, convertMixed, Script } from './index.js'

const roSentence = 'Evaṃ me sutaṃ – ekaṃ samayaṃ bhagavā antarā ca rājagahaṃ antarā ca nāḷandaṃ addhānamaggappaṭipanno hoti mahatā bhikkhusaṅghena saddhiṃ pañcamattehi bhikkhusatehi.',
    thaiSentence = 'เอวํ เม สุตํ – เอกํ สมยํ ภควา อนฺตรา จ ราชคหํ อนฺตรา จ นาฬนฺทํ อทฺธานมคฺคปฺปฏิปนฺโน โหติ มหตา ภิกฺขุสงฺเฆน สทฺธึ ปฺจมตฺเตหิ ภิกฺขุสเตหิ.',
    mySentence = 'ဧဝံ မေ သုတံ – ဧကံ သမယံ ဘဂဝါ အန္တရာ စ ရာဇဂဟံ အန္တရာ စ နာဠန္ဒံ အဒ္ဓါနမဂ္ဂပ္ပဋိပန္နော ဟောတိ မဟတာ ဘိက္ခုသင်္ဃေန သဒ္ဓိံ ပဉ္စမတ္တေဟိ ဘိက္ခုသတေဟိ.',
    siSentence = 'එවං මෙ සුතං – එකං සමයං භගවා අන්තරා ච රාජගහං අන්තරා ච නාළන්දං අද්ධානමග්ගප්පටිපන්නො හොති මහතා භික්ඛුසඞ්ඝෙන සද්ධිං පඤ්චමත්තෙහි භික්ඛුසතෙහි.',
    mixedSentence = 'එවං මෙ සුතං – ဧကံ သမယံ ဘဂဝါ အန္တရာ စ ရာဇဂဟံ အန္တရာ စ นาฬนฺทํ อทฺธานมคฺคปฺปฏิปนฺโน โหติ มหตา ภิกฺขุสงฺเฆน สทฺธึ pañcamattehi bhikkhusatehi.'

describe('single word', () => {
    test('nirvana', () => {
      expect(convert('janaka', Script.SINH, Script.LATN)).toEqual('ජනක')
      expect(convertMixed('janaka', Script.SINH)).toEqual('ජනක')
      expect(convert('නිර්වාන', Script.LATN, Script.SINH)).toEqual('Nirvāna')
      expect(convertMixed('නිර්වාන', Script.LATN)).toEqual('Nirvāna')
    });
})

describe('sentence', () => {
    test('evam me sutam', () => {
        expect(convert(roSentence, Script.THAI, Script.LATN)).toEqual(thaiSentence)
        expect(convertMixed(roSentence, Script.THAI)).toEqual(thaiSentence)
        expect(convert(thaiSentence, Script.MYMR, Script.THAI)).toEqual(mySentence)
        expect(convertMixed(thaiSentence, Script.MYMR)).toEqual(mySentence)
        expect(convert(mySentence, Script.SINH, Script.MYMR)).toEqual(siSentence)
        expect(convertMixed(mySentence, Script.SINH)).toEqual(siSentence)
    })
})

describe('mixed', () => {
    test('mixed evam me sutam', () => {
        expect(convertMixed(mixedSentence, Script.THAI)).toEqual(thaiSentence)
        expect(convertMixed(mixedSentence, Script.LATN)).toEqual(roSentence)
        expect(convertMixed(mixedSentence, Script.MYMR)).toEqual(mySentence)
        expect(convertMixed(mixedSentence, Script.SINH)).toEqual(siSentence)
    })
})

describe('checkRomanConvert', () => {
    test('alPlusIndeptVowel', () => {
        expect(checkRomanConvert('සල්උයනෙ')).toBeTruthy() // sinhala word with al+indeptvowel
        expect(checkRomanConvert('සල් උයනෙ')).toBeFalsy() // normal
        expect(convert('සල්උයනෙ', Script.LATN, Script.SINH, {'checkRomanConvert' : true}))
            .toEqual('Saluyane')
        expect(convert('Saluyane', Script.SINH, Script.LATN)).toEqual('සලුයනෙ') // note we are getting a different word
    })
    test('aspiratedHalPlusH', () => {
        expect(checkRomanConvert('‘සරියබ්ර්හ්මි')).toBeFalsy() // ra not aspirated 
        expect(checkRomanConvert('‘සරියබ්ක්හ්මි')).toBeTruthy() // ka is aspirated
        expect(convert('‘සරියබ්ක්හ්මි', Script.LATN, Script.SINH, {'checkRomanConvert' : true}))
            .toEqual('‘Sariyabkhmi')
        expect(convert('‘Sariyabkhmi', Script.SINH, Script.LATN)).toEqual('‘සරියබ්ඛ්මි') // note we are getting a different word
    })
})

describe('checkUnconverted', () => {
    test('function', () => {
        expect(checkUnconverted(convert('ඇලුම්ඇති', Script.LATN, Script.SINH))).toBeTruthy() // has non pali vowels which will not be converted
        expect(checkUnconverted(convert('පස්දෙනෙක්', Script.LATN, Script.SINH))).toBeFalsy()
    })
})