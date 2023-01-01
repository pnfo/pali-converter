import { convert, convertMixed, Script } from './index.js'

const roSentence = 'Evaṃ me sutaṃ – ekaṃ samayaṃ bhagavā antarā ca rājagahaṃ antarā ca nāḷandaṃ addhānamaggappaṭipanno hoti mahatā bhikkhusaṅghena saddhiṃ pañcamattehi bhikkhusatehi.',
    thaiSentence = 'เอวํ เม สุตํ – เอกํ สมยํ ภควา อนฺตรา จ ราชคหํ อนฺตรา จ นาฬนฺทํ อทฺธานมคฺคปฺปฏิปนฺโน โหติ มหตา ภิกฺขุสงฺเฆน สทฺธึ ปฺจมตฺเตหิ ภิกฺขุสเตหิ.',
    mySentence = 'ဧဝံ မေ သုတံ – ဧကံ သမယံ ဘဂဝါ အန္တရာ စ ရာဇဂဟံ အန္တရာ စ နာဠန္ဒံ အဒ္ဓါနမဂ္ဂပ္ပဋိပန္နော ဟောတိ မဟတာ ဘိက္ခုသင်္ဃေန သဒ္ဓိံ ပဉ္စမတ္တေဟိ ဘိက္ခုသတေဟိ.',
    siSentence = 'එවං මෙ සුතං – එකං සමයං භගවා අන්තරා ච රාජගහං අන්තරා ච නාළන්දං අද්ධානමග්ගප්පටිපන්නො හොති මහතා භික්ඛුසඞ්ඝෙන සද්ධිං පඤ්චමත්තෙහි භික්ඛුසතෙහි.',
    mixedSentence = 'එවං මෙ සුතං – ဧကံ သမယံ ဘဂဝါ အန္တရာ စ ရာဇဂဟံ အန္တရာ စ นาฬนฺทํ อทฺธานมคฺคปฺปฏิปนฺโน โหติ มหตา ภิกฺขุสงฺเฆน สทฺธึ pañcamattehi bhikkhusatehi.'

describe('single word', () => {
    test('nirvana', () => {
      expect(convert('janaka', Script.SI, Script.RO)).toEqual('ජනක')
      expect(convertMixed('janaka', Script.SI)).toEqual('ජනක')
      expect(convert('නිර්වාන', Script.RO, Script.SI)).toEqual('Nirvāna')
      expect(convertMixed('නිර්වාන', Script.RO)).toEqual('Nirvāna')
    });
})

describe('sentence', () => {
    test('evam me sutam', () => {
        expect(convert(roSentence, Script.THAI, Script.RO)).toEqual(thaiSentence)
        expect(convertMixed(roSentence, Script.THAI)).toEqual(thaiSentence)
        expect(convert(thaiSentence, Script.MY, Script.THAI)).toEqual(mySentence)
        expect(convertMixed(thaiSentence, Script.MY)).toEqual(mySentence)
        expect(convert(mySentence, Script.SI, Script.MY)).toEqual(siSentence)
        expect(convertMixed(mySentence, Script.SI)).toEqual(siSentence)
    })
})

describe('mixed', () => {
    test('mixed evam me sutam', () => {
        expect(convertMixed(mixedSentence, Script.THAI)).toEqual(thaiSentence)
        expect(convertMixed(mixedSentence, Script.RO)).toEqual(roSentence)
        expect(convertMixed(mixedSentence, Script.MY)).toEqual(mySentence)
        expect(convertMixed(mixedSentence, Script.SI)).toEqual(siSentence)
    })
})