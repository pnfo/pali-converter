import { checkRomanConvert, checkUnconverted, convert, convertMixed, Script } from './index.js'

const roSentence = 'Evaṃ me sutaṃ – ekaṃ samayaṃ bhagavā antarā ca rājagahaṃ antarā ca nāḷandaṃ addhānamaggappaṭipanno hoti mahatā bhikkhusaṅghena saddhiṃ pañcamattehi bhikkhusatehi.',
    thaiSentence = 'เอวํ เม สุตํ – เอกํ สมยํ ภควา อนฺตรา จ ราชคหํ อนฺตรา จ นาฬนฺทํ อทฺธานมคฺคปฺปฏิปนฺโน โหติ มหตา ภิกฺขุสงฺเฆน สทฺธิํ ปญฺจมตฺเตหิ ภิกฺขุสเตหิ.',
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

describe('vowel pairs a+i, a+u', () => {
    // pali has no diphthongs - roman 'ai' 'au' are two vowels, as written in the VRI devanagari text (सउद्देसं)
    const words = 'sauddesaṃ naubhayabyābādhāya puttaiccādito',
        expected = {
            [Script.SINH]: 'සඋද්දෙසං නඋභයබ්‍යාබාධාය පුත්තඉච්චාදිතො',
            [Script.DEVA]: 'सउद्देसं नउभयब्याबाधाय पुत्तइच्चादितो',
            [Script.THAI]: 'สอุทฺเทสํ นอุภยพฺยาพาธาย ปุตฺตอิจฺจาทิโต',
            [Script.MYMR]: 'သဥဒ္ဒေသံ နဥဘယဗျာဗာဓာယ ပုတ္တဣစ္စာဒိတော',
            [Script.KHMR]: 'សឧទ្ទេសំ នឧភយព្យាពាធាយ បុត្តឥច្ចាទិតោ',
        }
    test('roman to other scripts', () => {
        for (const [script, text] of Object.entries(expected)) {
            expect(convert(words, script, Script.LATN)).toEqual(text)
            expect(convertMixed(words, script)).toEqual(text)
        }
    })
    test('round trip through roman', () => {
        for (const [script, text] of Object.entries(expected)) {
            expect(convert(convert(text, Script.LATN, script), script, Script.LATN)).toEqual(text)
        }
    })
    test('at the start of a word', () => {
        expect(convert('aiccā', Script.SINH, Script.LATN)).toEqual('අඉච්චා')
        expect(convert('Auddhacca', Script.DEVA, Script.LATN)).toEqual('अउद्धच्च')
    })
    test('no "undefined" in any script', () => {
        for (const script of Object.values(Script)) {
            expect(convert(words, script, Script.LATN)).not.toMatch(/undefined/)
        }
    })
    test('sanskrit diphthongs still convert to roman', () => {
        expect(convert('කෛලාස', Script.LATN, Script.SINH)).toEqual('Kailāsa')
        expect(convert('कौशल', Script.LATN, Script.DEVA)).toEqual('Kauśala')
    })
})

describe('letters missing in the target script', () => {
    test('are left unconverted, not "undefined"', () => {
        const thai = convert('කෛලාස', Script.THAI, Script.SINH)
        expect(thai).not.toMatch(/undefined/)
        expect(checkUnconverted(thai)).toBeTruthy()
    })
})

describe('script fixes (checked against the VRI editions and Myanmar printed Pali)', () => {
    const roundTrip = (w, s) => convert(convert(w, s, Script.LATN), Script.LATN, s).toLowerCase()
    const words = ['brahmajālasuttaṃ', 'tassa', 'saṅgho', 'arahato', 'appā', 'bhikkhave', 'dhammaṃ', 'sīlakkhandhavaggapāḷi', 'paribbājakakathā', 'majjhimasīlaṃ']
    test('myanmar tall aa after ပ္ပ ပ္ဖ ဂ္ဃ', () => {
        expect(convert('appā', Script.MYMR, Script.LATN)).toEqual('အပ္ပါ')
        expect(convert('papphāsa', Script.MYMR, Script.LATN)).toEqual('ပပ္ဖါသ')
        expect(convert('agghā', Script.MYMR, Script.LATN)).toEqual('အဂ္ဃါ')
        expect(convert('sikkhā sampā', Script.MYMR, Script.LATN)).toEqual('သိက္ခာ သမ္ပာ') // unchanged
    })
    test('tibetan tsheg between syllables', () => {
        expect(convert('namo attanā', Script.TIBT, Script.LATN)).toEqual('ན་མོ ཨ་ཏྟ་ནཱ')
        expect(convert('majjhima', Script.TIBT, Script.LATN).normalize('NFD')).toEqual('མ་ཛ྄ཛྷི་མ'.normalize('NFD')) // jjha: explicit halant
    })
    test('tamil letters with superscripts', () => {
        expect(convert('dhammaṃ bhikkhave buddho', Script.TAML, Script.LATN)).toEqual('த⁴ம்மம் பி⁴க்க²வே பு³த்³தோ⁴')
        expect(convert('dīghanikāyo vandana', Script.TAML, Script.LATN)).toEqual('தீ³க⁴னிகாயோ வந்த³ன')
        expect(convertMixed('த⁴ம்மம்', Script.LATN)).toEqual('Dhammaṃ')
        expect(convert('அம்ஹாகம் ஸம்பு³த்³த⁴', Script.LATN, Script.TAML)).toEqual('Amhākaṃ sambuddha')
    })
    test('converting back from tibetan, assamese, tai tham, chakma, tamil', () => {
        for (const s of [Script.TIBT, Script.ASSE, Script.LANA, Script.CAKM, Script.TAML, Script.MYMR])
            for (const w of words) expect(roundTrip(w, s)).toEqual(w)
    })
})
