/**
 * Copyright Path Nirvana (path.nirvana@gmail.com) 2018
 * The code and character mapping defined in this file can not be used for any commercial purposes.
 * Permission from the auther is required for all other purposes.
 * Edit 2021 - added (non pali) sanskrit consonents and vowels
 * Edit 2024 - changed script code names to be iso, added cache for hashMaps, added cakm, java, bali
 */

"use strict";

// list of script codes from https://en.wikipedia.org/wiki/ISO_15924
// todo - add chakma https://en.wikipedia.org/wiki/Chakma_script (0.3m speakers)
// also consider balinese (3m speakers) and javanese (80m speakers)
export const Script = Object.freeze({
    SINH: 'sinh',
    DEVA: 'deva',
    LATN: 'latn',
    THAI: 'thai',
    MYMR: 'mymr',
    KHMR: 'khmr',
    LAOO: 'laoo',
    BENG: 'beng',
    TIBT: 'tibt',
    CYRL: 'cyrl',
    GURU: 'guru',
    GUJR: 'gujr',
    TELU: 'telu',
    KNDA: 'knda',
    MLYM: 'mlym',
    TAML: 'taml', // Tamil extended - same range/chars as Malayalam but different font
    ASSE: 'asse', // related to BENG (no code in iso list)
    LANA: 'lana', // Tai Tham (Lanna) - northern thai script
    BRAH: 'brah', // Brahmi no speakers
    CAKM: 'cakm', // Chakma 0.3m speakers
    JAVA: 'java', // Javanese 80m speakers
    BALI: 'bali', // Balinese 3m speakers
});
export const isScript = (name) => !!Script[name.toUpperCase()]

export const PaliScriptInfo = new Map ([
    [Script.SINH,  ['Sinhala',    'සිංහල',        [[0x0D80, 0x0DFF]],                 {f: 'sri-lanka.svg'}     ]],
    [Script.DEVA,  ['Devanagari', 'देवनागरी',       [[0x0900, 0x097F]],                 {f: 'india.svg'}         ]],
    [Script.LATN,  ['Roman',      'Roman',       [[0x0000, 0x017F], [0x1E00, 0x1EFF]], {f: 'uk.svg'}          ]], // latin extended and latin extended additional blocks
    [Script.THAI,  ['Thai',       'ไทย',         [[0x0E00, 0x0E7F]],                 {f: 'thailand.svg'}      ]], 
    [Script.MYMR,  ['Myanmar',    'ဗမာစာ',       [[0x1000, 0x107F]],                 {f: 'myanmar.svg'}       ]],
    [Script.KHMR,  ['Khmer',      'ភាសាខ្មែរ',      [[0x1780, 0x17FF]],                 {f: 'cambodia.svg'}      ]],
    [Script.LAOO,  ['Laos',       'ລາວ',         [[0x0E80, 0x0EFF]],                 {f: 'laos.svg'}           ]],
    [Script.BENG,  ['Bengali',    'বাংলা',        [[0x0980, 0x09FF]],                 {f: 'bangladesh.svg'} ]],
    [Script.TIBT,  ['Tibetan',    'བོད་སྐད།',        [[0x0F00, 0x0FFF]],                 {f: 'tibet.svg', c: 'larger'} ]],
    [Script.CYRL,  ['Cyrillic',   'кириллица',   [[0x0400, 0x04FF], [0x0300, 0x036F]], {f: 'russia.svg'} ]], // also adding the "Combining Diacritical Marks" block 
    [Script.GURU,  ['Gurmukhi',   'ਗੁਰਮੁਖੀ',       [[0x0A00, 0x0A7F]],                  {f: 'india.svg'}                  ]],
    [Script.GUJR,  ['Gujarati',   'ગુજરાતી',       [[0x0A80, 0x0AFF]],                 {f: 'india.svg'}                   ]],
    [Script.TELU,  ['Telugu',     'తెలుగు',       [[0x0C00, 0x0C7F]],                  {f: 'india.svg'}                  ]],
    [Script.KNDA,  ['Kannada',    'ಕನ್ನಡ',        [[0x0C80, 0x0CFF]],                  {f: 'india.svg'}                  ]],
    [Script.MLYM,  ['Malayalam',  'മലയാളം',      [[0x0D00, 0x0D7F]],                 {f: 'india.svg'}                   ]],
    [Script.TAML,  ['Tamil',      'தமிழ்',         [],                                {f: 'india.svg'}                    ]], // Tamil extended - uses different font from Malayalam
    [Script.ASSE,  ['Assamese',   'অসমীয়া',      [],                                  {f: 'bangladesh.svg'} ]], // assamese uses the same bangla unicode block and most of its letters
    [Script.LANA,  ['Tai Tham',   'ᨲ᩠ᩅᩫᨵᩢᨾ᩠ᨾ᩼',         [[0x1A20, 0x1AAF]],                  {f: 'thailand.svg' } ]],
    [Script.CAKM,  ['Chakma',     '𑄌𑄋𑄴𑄟𑄳𑄦',        [[0xD804, 0xD804], [0xDD00, 0xDD7F]],    {f: 'bangladesh.svg' } ]], // two codes same as brah [0x11100, 0x1114F]
    [Script.JAVA,  ['Javanese',   'ꦗꦮ',         [[0xA980, 0xA9DF]],                  {f: 'indonesia.svg' } ]],
    [Script.BALI,  ['Balinese',   'ᬩᬮᬶ',        [[0x1B00, 0x1B7F]],                  {f: 'indonesia.svg' } ]],
    [Script.BRAH,  ['Brahmi',     'Brāhmī',      [[0xD804, 0xD804], [0xDC00, 0xDC7F]], {f: 'empty.svg'}               ]], //charCodeAt returns two codes for each letter [[0x11000, 0x1107F]]
]);

export function getScriptForCode(charCode) {
    for (let info of PaliScriptInfo) {
        for (let range of info[1][2]) {
            if (Array.isArray(range) && charCode >= range[0] && charCode <= range[1]) return info[0];
            if (Number.isInteger(range) && charCode == range) return info[0];
        }
    }
    return -1;
}

const script_index = { 
    [Script.SINH]:  0, 
    [Script.DEVA]:  1,
    [Script.LATN]:  2,
    [Script.THAI]:  3, 
    [Script.LAOO]:  4,
    [Script.MYMR]:  5,
    [Script.KHMR]:  6,
    [Script.BENG]:  7, 
    [Script.ASSE]:  7, // use same convert func
    [Script.GURU]:  8,
    [Script.LANA]:  9,
    [Script.GUJR]: 10,
    [Script.TELU]: 11,
    [Script.KNDA]: 12,
    [Script.MLYM]: 13,
    [Script.TAML]: 13, // same as malayalam
    [Script.BRAH]: 14,
    [Script.TIBT]: 15,
    [Script.CAKM]: 16,
    [Script.JAVA]: 17,
    [Script.BALI]: 18,
    [Script.CYRL]: 19,
};

const specials = [ 
    // independent vowels
    ['අ',   'अ',   'a',   'อ',   'ອ',   'အ',   'អ',    'অ',   'ਅ',   'ᩋ',   'અ',   'అ',   'ಅ',   'അ',   '𑀅',   'ཨ',   '𑄃',   'ꦄ',   'ᬅ',   'а'],
    ['ආ',   'आ',   'ā',   'อา',  'ອາ',  'အာ',  'អា',   'আ',   'ਆ',   'ᩌ',  'આ',   'ఆ',   'ಆ',   'ആ',   '𑀆',   'ཨཱ',   '𑄃𑄂',   'ꦄꦴ',  'ᬆ',   'а̄'],
    ['ඉ',   'इ',   'i',   'อิ',   'ອິ',   'ဣ',   'ឥ',    'ই',   'ਇ',   'ᩍ',    'ઇ',   'ఇ',   'ಇ',   'ഇ',     '𑀇',   'ཨི',   '𑄄',   'ꦆ',   'ᬇ',   'и'],
    ['ඊ',   'ई',   'ī',   'อี',   'ອີ',   'ဤ',   'ឦ',   'ঈ',   'ਈ',   'ᩎ',   'ઈ',   'ఈ',   'ಈ',   'ഈ',   '𑀈',   'ཨཱི',   '𑄃𑄩',   'ꦇ',   'ᬈ',   'ӣ'],
    ['උ',   'उ',   'u',   'อุ',   'ອຸ',   'ဥ',    'ឧ',    'উ',   'ਉ',   'ᩏ',    'ઉ',   'ఉ',   'ಉ',   'ഉ',    '𑀉',   'ཨུ',   '𑄅',    'ꦈ',   'ᬉ',    'у'],
    ['ඌ',   'ऊ',   'ū',   'อู',   'ອູ',   'ဦ',    'ឩ',   'ঊ',   'ਊ',   'ᩐ',    'ઊ',   'ఊ',   'ಊ',   'ഊ',  '𑀊',   'ཨཱུ',   '𑄃𑄫',   'ꦈꦴ',  'ᬊ',   'ӯ'],
    ['එ',   'ए',   'e',   'อเ',   'ອເ',   'ဧ',   'ឯ',    'এ',   'ਏ',   'ᩑ',   'એ',   'ఏ',   'ಏ',   'ഏ',    '𑀏',   'ཨེ',   '𑄆',    'ꦌ',   'ᬏ',   'е'],
    ['ඔ',   'ओ',   'o',   'อโ',   'ອໂ',  'ဩ',   'ឱ',   'ও',   'ਓ',   'ᩒ',   'ઓ',   'ఓ',   'ಓ',   'ഓ',   '𑀑',   'ཨོ',   '𑄃𑄮',   'ꦎ',   'ᬑ',   'о'],
    // various signs  
    ['ං',   'ं',   'ṃ',   'ํ',   'ໍ',   'ံ',   'ំ',   'ং',   'ਂ',   'ᩴ',   'ં',   'ం',   'ಂ',   'ം',   '𑀁',   'ཾ',   '𑄁',   'ꦁ',   'ᬂ',   'м̣'], // niggahita - anusawara
    // visarga - not in pali but deva original text has it (thai/lao/tt - not found. using the closest equivalent per wikipedia)
    ['ඃ',   'ः',   'ḥ',   'ะ',   'ະ',   'း',   'ះ',   'ঃ',   'ਃ',   'ᩡ',   'ઃ',   'ః',   'ಃ',   'ഃ',   '𑀂',   'ཿ',   '𑄂',   'ꦃ',   'ᬄ',   'х̣'],
    // virama (al - hal). roman/cyrillic need special handling
    ['්',   '्',   '',   'ฺ',   '຺',   '္',   '្',   '্',   '੍',   '᩠',   '્',   '్',   '್',   '്',   '𑁆',   '྄',   '𑄴',   '꧀',   '᭄',   ''],
    // digits
    ['0',   '०',   '0',   '๐',   '໐',   '၀',   '០',   '০',   '੦',   '᪐',   '૦',   '౦',   '೦',   '൦',   '𑁦',   '༠',    '𑄶',   '꧐',   '᭐',   '0'],
    ['1',   '१',   '1',   '๑',   '໑',   '၁',   '១',   '১',   '੧',   '᪑',   '૧',   '౧',   '೧',   '൧',   '𑁧',   '༡',   '𑄷',   '꧑',   '᭑',   '1'],
    ['2',   '२',   '2',   '๒',   '໒',   '၂',   '២',   '২',   '੨',   '᪒',   '૨',   '౨',   '೨',   '൨',   '𑁨',   '༢',   '𑄸',   '꧒',   '᭒',   '2'],
    ['3',   '३',   '3',   '๓',   '໓',   '၃',   '៣',   '৩',   '੩',   '᪓',   '૩',   '౩',   '೩',   '൩',   '𑁩',   '༣',  '𑄹',   '꧓',  '᭓',   '3'],
    ['4',   '४',   '4',   '๔',   '໔',   '၄',   '៤',   '৪',   '੪',   '᪔',   '૪',   '౪',   '೪',   '൪',   '𑁪',   '༤',   '𑄺',   '꧔',   '᭔',   '4'],
    ['5',   '५',   '5',   '๕',   '໕',   '၅',   '៥',   '৫',   '੫',   '᪕',   '૫',   '౫',   '೫',   '൫',   '𑁫',   '༥',   '𑄻',   '꧕',   '᭕',   '5'],
    ['6',   '६',   '6',   '๖',   '໖',   '၆',   '៦',   '৬',   '੬',   '᪖',   '૬',   '౬',   '೬',   '൬',   '𑁬',   '༦',   '𑄼',   '꧖',   '᭖',   '6'],
    ['7',   '७',   '7',   '๗',   '໗',   '၇',   '៧',   '৭',   '੭',   '᪗',   '૭',   '౭',   '೭',   '൭',   '𑁭',   '༧',   '𑄽',   '꧗',   '᭗',   '7'],
    ['8',   '८',   '8',   '๘',   '໘',   '၈',   '៨',   '৮',   '੮',   '᪘',   '૮',   '౮',   '೮',   '൮',   '𑁮',   '༨',   '𑄾',   '꧘',   '᭘',   '8'],
    ['9',   '९',   '9',   '๙',   '໙',   '၉',   '៩',   '৯',   '੯',   '᪙',   '૯',   '౯',   '೯',   '൯',   '𑁯',   '༩',   '𑄿',  '꧙',   '᭙',   '9'],
    // sanskrit independent vowels - short o and short e does not occur in pali/sinskrit the long version is listed above
    ['ඓ',   'ऐ',   'ai'],
    ['ඖ',   'औ',   'au'],
    ['ඍ',   'ऋ',   'ṛ'],
    ['ඎ',   'ॠ',   'ṝ'],
    ['ඏ',   'ऌ',   'l̥'], // roman changed since otherwise conflicting with ළ් ḷ 
    ['ඐ',   'ॡ',   'ḹ']
];

const consos = [
    // velar stops
    ['ක',   'क',   'k',   'ก',   'ກ',   'က',   'ក',   'ক',   'ਕ',   'ᨠ',   'ક',   'క',   'ಕ',   'ക',   '𑀓',   'ཀ',   '𑄇',   'ꦏ',   'ᬓ',   'к'],
    ['ඛ',   'ख',   'kh',   'ข',   'ຂ',   'ခ',   'ខ',   'খ',   'ਖ',   'ᨡ',   'ખ',   'ఖ',   'ಖ',   'ഖ',   '𑀔',   'ཁ',   '𑄈',   'ꦑ',   'ᬔ',   'кх'],
    ['ග',   'ग',   'g',   'ค',   'ຄ',   'ဂ',   'គ',   'গ',   'ਗ',   'ᨣ',   'ગ',   'గ',   'ಗ',   'ഗ',   '𑀕',   'ག',   '𑄉',   'ꦒ',   'ᬕ',   'г'],
    ['ඝ',   'घ',   'gh',   'ฆ',   'ຆ',   'ဃ',   'ឃ',   'ঘ',   'ਘ',   'ᨥ',   'ઘ',   'ఘ',   'ಘ',   'ഘ',   '𑀖',   'གྷ',   '𑄊',   'ꦓ',   'ᬖ',   'гх'],
    ['ඞ',   'ङ',   'ṅ',   'ง',   'ງ',   'င',   'ង',   'ঙ',   'ਙ',   'ᨦ',   'ઙ',   'ఙ',   'ಙ',   'ങ',   '𑀗',   'ང',   '𑄋',   'ꦔ',   'ᬗ',   'н̇'],
    // palatal stops
    ['ච',   'च',   'c',   'จ',   'ຈ',   'စ',   'ច',   'চ',   'ਚ',   'ᨧ',   'ચ',   'చ',   'ಚ',   'ച',   '𑀘',   'ཙ',   '𑄌',   'ꦕ',   'ᬘ',   'ч'],
    ['ඡ',   'छ',   'ch',   'ฉ',   'ຉ',   'ဆ',   'ឆ',   'ছ',   'ਛ',   'ᨨ',   'છ',   'ఛ',   'ಛ',   'ഛ',   '𑀙',   'ཚ',   '𑄍',   'ꦖ',   'ᬙ',   'чх'],
    ['ජ',   'ज',   'j',   'ช',   'ຊ',   'ဇ',   'ជ',   'জ',   'ਜ',   'ᨩ',   'જ',   'జ',   'ಜ',   'ജ',   '𑀚',   'ཛ',   '𑄎',   'ꦗ',   'ᬚ',   'дж'],
    ['ඣ',   'झ',   'jh',   'ฌ',   'ຌ',   'ဈ',   'ឈ',   'ঝ',   'ਝ',   'ᨫ',   'ઝ',   'ఝ',   'ಝ',   'ഝ',   '𑀛',   'ཛྷ',   '𑄏',   'ꦙ',   'ᬛ',   'джх'],
    ['ඤ',   'ञ',   'ñ',   'ญ',   'ຎ',   'ဉ',   'ញ',   'ঞ',   'ਞ',   'ᨬ',   'ઞ',   'ఞ',   'ಞ',   'ഞ',   '𑀜',   'ཉ',   '𑄐',   'ꦚ',   'ᬜ',   'н̃'],
    // retroflex stops
    ['ට',   'ट',   'ṭ',   'ฏ',   'ຏ',   'ဋ',   'ដ',   'ট',   'ਟ',   'ᨭ',   'ટ',   'ట',   'ಟ',   'ട',   '𑀝',   'ཊ',   '𑄑',   'ꦛ',   'ᬝ',   'т̣'],
    ['ඨ',   'ठ',   'ṭh',   'ฐ',   'ຐ',   'ဌ',   'ឋ',   'ঠ',   'ਠ',   'ᨮ',   'ઠ',   'ఠ',   'ಠ',   'ഠ',   '𑀞',   'ཋ',   '𑄒',   'ꦜ',   'ᬞ',   'т̣х'],
    ['ඩ',   'ड',   'ḍ',   'ฑ',   'ຑ',   'ဍ',   'ឌ',   'ড',   'ਡ',   'ᨯ',   'ડ',   'డ',   'ಡ',   'ഡ',   '𑀟',   'ཌ',   '𑄓',   'ꦝ',   'ᬟ',   'д̣'],
    ['ඪ',   'ढ',   'ḍh',   'ฒ',   'ຒ',   'ဎ',   'ឍ',   'ঢ',   'ਢ',   'ᨰ',   'ઢ',   'ఢ',   'ಢ',   'ഢ',   '𑀠',   'ཌྷ',   '𑄔',   'ꦞ',   'ᬠ',   'д̣х'],
    ['ණ',   'ण',   'ṇ',   'ณ',   'ຓ',   'ဏ',   'ណ',   'ণ',   'ਣ',   'ᨱ',   'ણ',   'ణ',   'ಣ',   'ണ',   '𑀡',   'ཎ',   '𑄕',   'ꦟ',   'ᬡ',   'н̣'],
    // dental stops
    ['ත',   'त',   't',   'ต',   'ຕ',   'တ',   'ត',   'ত',   'ਤ',   'ᨲ',   'ત',   'త',   'ತ',   'ത',   '𑀢',   'ཏ',   '𑄖',   'ꦠ',   'ᬢ',   'т'],
    ['ථ',   'थ',   'th',   'ถ',   'ຖ',   'ထ',   'ថ',   'থ',   'ਥ',   'ᨳ',   'થ',   'థ',   'ಥ',   'ഥ',   '𑀣',   'ཐ',   '𑄗',   'ꦡ',   'ᬣ',   'тх'],
    ['ද',   'द',   'd',   'ท',   'ທ',   'ဒ',   'ទ',   'দ',   'ਦ',   'ᨴ',   'દ',   'ద',   'ದ',   'ദ',   '𑀤',   'ད',   '𑄘',   'ꦢ',   'ᬤ',   'д'],
    ['ධ',   'ध',   'dh',   'ธ',   'ຘ',   'ဓ',   'ធ',   'ধ',   'ਧ',   'ᨵ',   'ધ',   'ధ',   'ಧ',   'ധ',   '𑀥',   'དྷ',   '𑄙',   'ꦣ',   'ᬥ',   'дх'],
    ['න',   'न',   'n',   'น',   'ນ',   'န',   'ន',   'ন',   'ਨ',   'ᨶ',   'ન',   'న',   'ನ',   'ന',   '𑀦',   'ན',   '𑄚',   'ꦤ',   'ᬦ',   'н'],
    // labial stops
    ['ප',   'प',   'p',   'ป',   'ປ',   'ပ',   'ប',   'প',   'ਪ',   'ᨸ',   'પ',   'ప',   'ಪ',   'പ',   '𑀧',   'པ',   '𑄛',   'ꦥ',   'ᬧ',   'п'],
    ['ඵ',   'फ',   'ph',   'ผ',   'ຜ',   'ဖ',   'ផ',   'ফ',   'ਫ',   'ᨹ',   'ફ',   'ఫ',   'ಫ',   'ഫ',   '𑀨',   'ཕ',   '𑄜',   'ꦦ',   'ᬨ',   'пх'],
    ['බ',   'ब',   'b',   'พ',   'ພ',   'ဗ',   'ព',   'ব',   'ਬ',   'ᨻ',   'બ',   'బ',   'ಬ',   'ബ',   '𑀩',   'བ',   '𑄝',   'ꦧ',   'ᬩ',   'б'],
    ['භ',   'भ',   'bh',   'ภ',   'ຠ',   'ဘ',   'ភ',   'ভ',   'ਭ',   'ᨽ',   'ભ',   'భ',   'ಭ',   'ഭ',   '𑀪',   'བྷ',   '𑄞',   'ꦨ',   'ᬪ',   'бх'],
    ['ම',   'म',   'm',   'ม',   'ມ',   'မ',   'ម',   'ম',   'ਮ',   'ᨾ',   'મ',   'మ',   'ಮ',   'മ',   '𑀫',   'མ',   '𑄟',   'ꦩ',   'ᬫ',   'м'],
    // liquids, fricatives, etc.
    ['ය',   'य',   'y',   'ย',   'ຍ',   'ယ',   'យ',   'য',   'ਯ',   'ᨿ',   'ય',   'య',   'ಯ',   'യ',   '𑀬',   'ཡ',   '𑄡',   'ꦪ',   'ᬬ',   'й'],
    ['ර',   'र',   'r',   'ร',   'ຣ',   'ရ',   'រ',   'র',   'ਰ',   'ᩁ',   'ર',   'ర',   'ರ',   'ര',   '𑀭',   'ར',   '𑄢',   'ꦫ',   'ᬭ',   'р'],
    ['ල',   'ल',   'l',   'ล',   'ລ',   'လ',   'ល',   'ল',   'ਲ',   'ᩃ',   'લ',   'ల',   'ಲ',   'ല',   '𑀮',   'ལ',   '𑄣',   'ꦭ',   'ᬮ',   'л'],
    ['ළ',   'ळ',   'ḷ',   'ฬ',   'ຬ',   'ဠ',   'ឡ',   'ল়',   'ਲ਼',   'ᩊ',   'ળ',   'ళ',   'ಳ',   'ള',   '𑀴',   'ལ༹',   '𑅄',   'ꦭ꦳',   'ᬮ᬴',   'л̣'],
    ['ව',   'व',   'v',   'ว',   'ວ',   'ဝ',   'វ',   'ৰ',   'ਵ',   'ᩅ',   'વ',   'వ',   'ವ',   'വ',   '𑀯',   'ཝ',   '𑄤',   'ꦮ',   'ᬯ',   'в'],
    ['ස',   'स',   's',   'ส',   'ສ',   'သ',   'ស',   'স',   'ਸ',   'ᩈ',   'સ',   'స',   'ಸ',   'സ',   '𑀲',   'ས',   '𑄥',   'ꦱ',   'ᬲ',   'с'],
    ['හ',   'ह',   'h',   'ห',   'ຫ',   'ဟ',   'ហ',   'হ',   'ਹ',   'ᩉ',   'હ',   'హ',   'ಹ',   'ഹ',   '𑀳',   'ཧ',   '𑄦',   'ꦲ',   'ᬳ',   'х'],
    
    // sanskrit consonants
    ['ශ',   'श',   'ś'],
    ['ෂ',   'ष',   'ş']
];

const vowels = [
    ['ා',   'ा',   'ā',   'า',   'າ',   'ာ',   'ា',   'া',   'ਾ',  'ᩣ',  'ા',   'ా',   'ಾ',   'ാ',   '𑀸',   'ཱ',   '𑄧',   'ꦴ',   'ᬵ',   'а̄'], // for cakma swapping aa and a might be needed
    ['ි',   'ि',   'i',   'ิ',    'ິ',   'ိ',    'ិ',   'ি',   'ਿ',   'ᩥ',   'િ',   'ి',   'ಿ',    'ി',   '𑀺',    'ི',   '𑄨',   'ꦶ',    'ᬶ',    'и'],
    ['ී',   'ी',   'ī',   'ี',    'ີ',   'ီ',    'ី',   'ী',   'ੀ',   'ᩦ',   'ી',   'ీ',   'ೀ',   'ീ',   '𑀻',    'ཱི',   '𑄩',   'ꦷ',   'ᬷ',   'ӣ'],
    ['ු',   'ु',   'u',    'ุ',    'ຸ',   'ု',    'ុ',   'ু',   'ੁ',   'ᩩ',   'ુ',   'ు',   'ು',    'ു',   '𑀼',   'ུ',   '𑄪',   'ꦸ',    'ᬸ',   'у'],
    ['ූ',   'ू',   'ū',    'ู',    'ູ',   'ူ',    'ូ',   'ূ',   'ੂ',   'ᩪ',   'ૂ',   'ూ',   'ೂ',   'ൂ',   '𑀽',   'ཱུ',   '𑄫',   'ꦹ',   'ᬹ',   'ӯ'],
    ['ෙ',   'े',   'e',   'เ',   'ເ',   'ေ',   'េ',   'ে',  'ੇ',  'ᩮ',   'ે',   'ే',   'ೇ',    'േ',   '𑁂',   'ེ',   '𑄬',   'ꦺ',   'ᬾ',   'е'], //for th/lo - should appear in front
    ['ො',   'ो',   'o',  'โ',   'ໂ',   'ော',   'ោ',  'ো',  'ੋ',  'ᩮᩣ',   'ો',  'ో',   'ೋ',  'ോ',   '𑁄',   'ོ',   '𑄮',   'ꦺꦴ',  'ᭀ',   'о'], //for th/lo - should appear in front
    // for lana/java the o is two chars but it is ok to have them only on the right side of the conso
    // sanskrit dependant vowels
    ['ෛ',   'ै',   'ai'],
    ['ෞ',   'ौ',   'au'],
    ['ෘ',   'ृ',   'ṛ'],
    ['ෲ',   'ॄ',   'ṝ'],
    ['ෟ',   'ॢ',   'l̥'], // roman changed since otherwise conflicting with ළ් ḷ 
    ['ෳ',   'ॣ',   'ḹ']
];
const sinh_conso_range = 'ක-ෆ';
const thai_conso_range = 'ก-ฮ';
const lao_conso_range = 'ກ-ຮ';
const mymr_conso_range = 'က-ဠ';
function format() { // helper function to format char arrays
    console.log("[\n['" + consos.map((chars, i) => [...chars].join("',   '")).join("'],\n['") + "']\n];")
}
//format()


function beautify_sinh(text, script, rendType = '') {
    // change joiners before U+0DBA Yayanna and U+0DBB Rayanna to Virama + ZWJ
    return text.replace(/\u0DCA([\u0DBA\u0DBB])/g, '\u0DCA\u200D$1');
}
function un_beautify_sinh(text) { // long vowels replaced by short vowels as sometimes people type long vowels by mistake
    text = text.replace(/ඒ/g, 'එ').replace(/ඕ/g, 'ඔ');
    return text.replace(/ේ/g, 'ෙ').replace(/ෝ/g, 'ො');
}
function beautify_mymr(text, script, rendType = '') { // new unicode 5.1 spec https://www.unicode.org/notes/tn11/UTN11_3.pdf 
    text = text.replace(/[,;]/g, '၊'); // comma/semicolon -> single line
    text = text.replace(/[\u2026\u0964\u0965]+/g, '။'); // ellipsis/danda/double danda -> double line

    text = text.replace(/ဉ\u1039ဉ/g, 'ည'); // kn + kna has a single char
    text = text.replace(/သ\u1039သ/g, 'ဿ'); // s + sa has a single char (great sa)
    text = text.replace(/င္([က-ဠ])/g, 'င\u103A္$1'); // kinzi - ඞ + al
    text = text.replace(/္ယ/g, 'ျ'); // yansaya  - yapin
    text = text.replace(/္ရ/g, 'ြ'); // rakar - yayit
    text = text.replace(/္ဝ/g, 'ွ'); // al + wa - wahswe
    text = text.replace(/္ဟ/g, 'ှ'); // al + ha - hahto
    // following code for tall aa is from https://www.facebook.com/pndaza.mlm
    text = text.replace(/([ခဂငဒပဝ]ေ?)\u102c/g, "$1\u102b"); // aa to tall aa
    text = text.replace(/(က္ခ|န္ဒ|ပ္ပ|မ္ပ)(ေ?)\u102b/g, "$1$2\u102c"); // restore back tall aa to aa for some pattern
    return text.replace(/(ဒ္ဓ|ဒွ)(ေ?)\u102c/g, "$1$2\u102b");
}
function un_beautify_mymr(text) {  // reverse of beautify above
    text = text.replace(/\u102B/g, 'ာ');
    text = text.replace(/ှ/g, '္ဟ'); // al + ha - hahto
    text = text.replace(/ွ/g, '္ဝ'); // al + wa - wahswe
    text = text.replace(/ြ/g, '္ရ'); // rakar - yayit
    text = text.replace(/ျ/g, '္ယ'); // yansaya  - yapin
    text = text.replace(/\u103A/g, ''); // kinzi
    text = text.replace(/ဿ/g, 'သ\u1039သ'); // s + sa has a single char (great sa)
    text = text.replace(/ည/g, 'ဉ\u1039ဉ'); // nnga
    text = text.replace(/သံဃ/g, 'သင္ဃ'); // nigghahita to ṅ for this word for searching - from Pn Daza

    text = text.replace(/၊/g, ','); // single line -> comma
    return text.replace(/။/g, '.'); // double line -> period
}
/**
 * Each script need additional steps when rendering on screen
 * e.g. for sinh needs converting dandas/abbrev, removing spaces, and addition ZWJ
 */
function beautify_common(text, script, rendType = '') {
    if (rendType == 'cen') {  // remove double dandas around namo tassa
        text = text.replace(/॥/g, '');
    } else if (rendType.startsWith('ga')) { // in gathas, single dandas convert to semicolon, double to period
        text = text.replace(/।/g, ';');
        text = text.replace(/॥/g, '.');
    }

    // remove Dev abbreviation sign before an ellipsis. We don't want a 4th dot after pe.
    text = text.replace(/॰…/g, '…');

    text = text.replace(/॰/g, '·'); // abbre sign changed - prevent capitalization in notes
    text = text.replace(/[।॥]/g, '.'); //all other single and double dandas converted to period

    // cleanup punctuation 1) two spaces to one
    // 2) There should be no spaces before these punctuation marks. 
    text = text.replace(/\s([\s,!;\?\.])/g, '$1');
    return text;
}
// for roman text only
function capitalize(text, script) {
    // the adding of <w> tags around the words before the beautification makes it harder - (?:<w>)? added
    text = text.replace(/^((?:<w>)?\S)/g, (_1, p1) => { // begining of a line
        return p1.toUpperCase();
    });
    text = text.replace(/([\.\?]\s(?:<w>)?)(\S)/g, (_1, p1, p2) => { // beginning of sentence
        return `${p1}${p2.toUpperCase()}`;
    });
    return text.replace(/([\u201C‘](?:<w>)?)(\S)/g, (_1, p1, p2) => { // starting from a quote
        return `${p1}${p2.toUpperCase()}`;
    });
}
const un_capitalize = (text) => text.toLowerCase();
// for thai text - this can also be done in the convert stage
const swap_e_o = (text, script) => {
    switch (script) {
        case Script.THAI:
            return text.replace(/([ก-ฮ])([เโ])/g, '$2$1');
        case Script.LAOO:
            return text.replace(/([ກ-ຮ])([ເໂ])/g, '$2$1');
        default:
            throw new Error(`Unsupported script ${script} for swap_e_o method.`);
    }
};
// to be used when converting from
const un_swap_e_o = (text, script) => {
    switch (script) {
        case Script.THAI:
            return text.replace(/([เโ])([ก-ฮ])/g, '$2$1');
        case Script.LAOO:
            return text.replace(/([ເໂ])([ກ-ຮ])/g, '$2$1');
        default:
            throw new Error(`Unsupported script ${script} for un_swap_e_o method.`);
    }
};

// in thai pali these two characters have special glyphs (using the encoding used in the THSarabunNew Font)
const beautify_thai = (text, script) => {
    return text // new buddhawajana font does not need special glyphs
    // text = text.replace(/\u0E34\u0E4D/g, '\u0E36'); // 'iṃ' has a single unicode in Thai
    // text = text.replace(/ญ/g, '\uF70F');
    // return text.replace(/ฐ/g, '\uF700');
};

function un_beautify_thai(text, script) { 
    text = text.replace(/ฎ/g, 'ฏ'); // sometimes people use ฎ instead of the correct ฏ which is used in the tipitaka
    text = text.replace(/\u0E36/g, '\u0E34\u0E4D'); // 'iṃ' has a single unicode in thai which is split into two here
    text = text.replace(/\uF70F/g, 'ญ');
    return text.replace(/\uF700/g, 'ฐ');
}

function un_beautify_khmer(text, script) {
    text = text.replace(/\u17B9/g, '\u17B7\u17C6'); // 'iṃ' has a single unicode in khmer which is split into two here
    return text.replace(/\u17D1/g, '\u17D2'); // end of word virama is different in khmer
}
/* zero-width joiners - replace both ways
['\u200C', ''], // ZWNJ (remove) not in sinh (or deva?)
['\u200D', ''], // ZWJ (remove) will be added when displaying*/
function cleanup_zwj(inputText) {
    return inputText.replace(/\u200C|\u200D/g, '');
}

function beautify_brahmi(text) { // just replace deva danda with brahmi danda
    text = text.replace(/।/g,'𑁇');
    text = text.replace(/॥/g,'𑁈');
    return text.replace(/–/g,'𑁋');
}
function beautify_lana(text) { // todo - unbeautify needed
    // text = text.replace(/([ᨠ-ᩌ])ᩮᩣ/g, 'ᩮ$1ᩣ') // looks like not needed - font renders correctly
    text = text.replace(/\u1A60\u1A41/g, '\u1A55'); // medial ra - rakar
    text = text.replace(/\u1A48\u1A60\u1A48/g, '\u1A54'); // great sa - ssa
    text = text.replace(/।/g, '\u1AA8');
    return text.replace(/॥/g, '\u1AA9');
}
function un_beautify_lana(text) {
    return text.replace(/ᩤ/g, 'ᩣ') // tall aa with normal a
}

function beautify_tibet(text) { // copied form csharp - consider removing subjoined as it makes it hard to read
    // not adding the intersyllabic tsheg between "syllables" (done in csharp code) since no visible change
    text = text.replace(/।/g,'།'); // tibet dandas
    text = text.replace(/॥/g,'༎');
    // Iterate over all of the consonants, looking for tibetan halant + consonant.
    // Replace with the corresponding subjoined consonant (without halant)
    for (let i = 0; i <= 39; i++) {
        text = text.replace(new RegExp(String.fromCharCode(0x0F84, 0x0F40 + i), 'g'), String.fromCharCode(0x0F90 + i));
    }
    // exceptions: yya and vva use the "fixed-form subjoined consonants as the 2nd one
    text = text.replace(/\u0F61\u0FB1/g, '\u0F61\u0FBB'); //yya
    text = text.replace(/\u0F5D\u0FAD/g, '\u0F5D\u0FBA'); //vva

    // exceptions: jjha, yha and vha use explicit (visible) halant between
    text = text.replace(/\u0F5B\u0FAC/g, '\u0F5B\u0F84\u0F5C'); //jjha
    text = text.replace(/\u0F61\u0FB7/g, '\u0F61\u0F84\u0F67'); //yha
    return text.replace(/\u0F5D\u0FB7/g, '\u0F5D\u0F84\u0F67'); //vha
}
function un_beautify_tibet(text) {
    return text; // todo undo the subjoining done above
}
function beautify_assamese(text) { 
    // can unbeautify but not useful since it is not possible to identify assamese since it uses the same unicode block as bangla
    // rules taken from sumitta.dhan@gmail.com email message 
    text = text.replace(/ৰ/g, 'ৱ');
    text = text.replace(/র/g, 'ৰ');
    text = text.replace(/ল়/g, 'ড়');
    return text;
}

const beautify_func_default = [];
const beautify_func = {
    [Script.SINH]: [beautify_sinh, beautify_common],
    [Script.LATN]: [beautify_common, capitalize],
    [Script.THAI]: [swap_e_o, beautify_thai, beautify_common],
    [Script.LAOO]: [swap_e_o, beautify_common],
    [Script.MYMR]: [beautify_mymr, beautify_common],
    [Script.KHMR]: [beautify_common],
    [Script.LANA]: [beautify_lana],
    [Script.GUJR]: [beautify_common],
    [Script.TELU]: [beautify_common],
    [Script.MLYM]: [beautify_common],
    [Script.BRAH]: [beautify_brahmi, beautify_common],
    [Script.TIBT]: [beautify_tibet],
    [Script.CYRL]: [beautify_common],
    [Script.ASSE]: [beautify_assamese],
};
// when converting from another script, have to unbeautify before converting
const un_beautify_func_default = [];
const un_beautify_func = {
    [Script.SINH] : [cleanup_zwj, un_beautify_sinh],
    [Script.DEVA] : [cleanup_zwj],   // original deva script (from tipitaka.org) text has zwj
    [Script.LATN]: [un_capitalize],
    [Script.THAI]: [un_beautify_thai, un_swap_e_o],
    [Script.LAOO]: [un_swap_e_o],
    [Script.KHMR]: [un_beautify_khmer],
    [Script.LANA]: [un_beautify_lana],
    [Script.MYMR]: [un_beautify_mymr],
    [Script.TIBT]: [un_beautify_tibet],
}

const hashMapsCache = {to: {}, from: {}}
function prepareHashMaps(direction, script, useVowels = true) { // not use vowels only when convert from latn/cyrl
    if (hashMapsCache[direction][script]) {
        return hashMapsCache[direction][script]
    }
    const fromIndex = direction === 'to' ? script_index[Script.SINH] : script_index[script],
        toIndex = direction === 'to' ? script_index[script] : script_index[Script.SINH]
    const combinedArrays = consos.concat(specials, useVowels ? vowels : []), mapsByLength = [[], [], []]; //max 3
    combinedArrays.forEach(chars => {
        if (chars[fromIndex]) { // empty '' from mapping - occurs in latn/cyrl
            mapsByLength[chars[fromIndex].length - 1].push([chars[fromIndex], chars[toIndex]]);
        }
    });
    return hashMapsCache[direction][script] = mapsByLength.filter(ar => ar.length).map(ar => [ar[0][0].length, new Map(ar)]).reverse(); // longest is first
}

const replaceByMaps = (inputText, hashMaps) => {
    let output = '';
    let index = 0;

    while (index < inputText.length) {
        let match = false;

        for (const [len, hashMap] of hashMaps) {
            const substring = inputText.substr(index, len);

            if (hashMap.has(substring)) {
                output += hashMap.get(substring); // can be an empty string too
                index += len;
                match = true;
                break;
            }
        }

        if (!match) { // if no matches were found
            output += inputText.charAt(index);
            index++;
        }
    }

    return output;
};

// for roman/cyrl text - insert 'a' after all consonants that are not followed by virama, dependent vowel or 'a'
// cyrillic mapping extracted from https://dhamma.ru/scripts/transdisp.js - TODO capitalize cyrl too
function insert_a(text, script) {
    const a = (script == Script.CYRL) ? '\u0430' : 'a'; // roman a or cyrl a
    text = text.replace(new RegExp(`([ක-ෆ])([^\u0DCF-\u0DDF\u0DCA${a}])`, 'g'), `$1${a}$2`); // done twice to match successive consos
    text = text.replace(new RegExp(`([ක-ෆ])([^\u0DCF-\u0DDF\u0DCA${a}])`, 'g'), `$1${a}$2`);
    return text.replace(/([ක-ෆ])$/g, `$1${a}`); // conso at the end of string not matched by regex above
}
const IV_TO_DV = {'අ': '', 'ආ': 'ා', 'ඉ': 'ි', 'ඊ': 'ී', 'උ': 'ු', 'ඌ': 'ූ', 'එ': 'ෙ', 'ඔ': 'ො'}; 
function remove_a(text, script) {
    text = text.replace(/([ක-ෆ])([^අආඉඊඋඌඑඔ\u0DCA])/g, '$1\u0DCA$2'); // done twice to match successive hal
    text = text.replace(/([ක-ෆ])([^අආඉඊඋඌඑඔ\u0DCA])/g, '$1\u0DCA$2');
    text = text.replace(/([ක-ෆ])$/g, '$1\u0DCA'); // last conso not matched by above
    text = text.replace(/([ක-ෆ])([අආඉඊඋඌඑඔ])/g, (_1, p1, p2) => p1 + IV_TO_DV[p2]);
    return text;
}
const fix_m_above = (text) => text.replace(/ṁ/g, 'ං'); // per ven anandajothi request

const convert_to_func_default = [convert_to];
const convert_to_func = { // from sinh to another script
    [Script.SINH] : [], // nothing to do since already sinh
    [Script.LATN] : [insert_a, convert_to],
    [Script.CYRL] : [insert_a, convert_to],
}

const convert_from_func_default = [convert_from];
const convert_from_func = { // from other script to sinh
    [Script.SINH] : [], // nothing to do since already sinh
    [Script.LATN] : [convert_from_w_v, fix_m_above, remove_a],
    [Script.CYRL] : [convert_from_w_v, remove_a],
}

function convert_to(text, script) {
    const hashMaps = prepareHashMaps('to', script);
    return replaceByMaps(text, hashMaps);
}
function convert_from(text, script) {
    const hashMaps = prepareHashMaps('from', script);
    return replaceByMaps(text, hashMaps);
}
function convert_from_w_v(text, script) {
    const hashMaps = prepareHashMaps('from', script, false); // without vowels for roman
    return replaceByMaps(text, hashMaps);
}

/**
 * Use the functions in this class for more fine grained control of the convertion process
 * e.g. if you do not want the beautification such as capitalization of Roman letters, you 
 * could use the basicConvert functions from this class
 */
export class TextProcessor {
    // convert from sinhala to another script
    static basicConvert(text, script) {
        (convert_to_func[script] || convert_to_func_default).forEach(func => text = func(text, script));
        return text;
    }
    // convert from another script to sinhala
    static basicConvertFrom(text, script) {
        (convert_from_func[script] || convert_from_func_default).forEach(func => text = func(text, script));
        return text;
    }
    // script specific beautification
    static beautify(text, script, rendType = '') {
        (beautify_func[script] || beautify_func_default).forEach(func => text = func(text, script, rendType));
        return text;
    }
    // script specific unbeautification 
    static un_beautify(text, script) {
        (un_beautify_func[script] || un_beautify_func_default).forEach(func => text = func(text, script));
        return text
    }
    // from Sinhala to other script
    static convert(text, script, options = {}) {
        if (options.checkRomanConvert) checkRomanConvert(text)
        text = this.basicConvert(text, script);
        if (options.checkUnconverted) checkUnconverted(text)
        return this.beautify(text, script);
    }
    // from other script to Sinhala - one script
    static convertFrom(text, script) {
        text = this.un_beautify(text, script)
        return this.basicConvertFrom(text, script)
    }
    // from other scripts (mixed) to Sinhala
    static convertFromMixed(mixedText) {
        mixedText = cleanup_zwj(mixedText) + ' '; // zwj messes with computing runs + hack to process last char
        let curScript = -1, run = '', output = '';
        for(let i = 0; i < mixedText.length; i++) {
            const newScript = getScriptForCode(mixedText.charCodeAt(i));
            if (newScript != curScript || (i == mixedText.length - 1)) { // make sure to process the last run
                output += this.convertFrom(run, curScript);
                curScript = newScript;
                run = mixedText.charAt(i);
            } else {
                run += mixedText.charAt(i);
            }
        }
        //console.log(`convert from mixed: "${mixedText}" => "${output}"`);
        return output;
    }
}

/** 
 * convert text in one particular script to another script
 * e.g. convert to Sinhala from Roman 
 * convert('janaka', Script.SI, Script.RO) 
 */
export function convert(text, toScript, fromScript, options = {}) {
    text = TextProcessor.convertFrom(text, fromScript) // convert to sinh
    return TextProcessor.convert(text, toScript, options) // from sinh
}

/** 
 * convert text in many different scripts to a one particular script
 * e.g. convert to Sinhala from multiple scripts (Roman and Myanmar) 
 * convert('janakaဗမာစာ', Script.SI) 
 */
export function convertMixed(mixedText, toScript, options = {}) {
    let text = TextProcessor.convertFromMixed(mixedText) // convert to sinh
    return TextProcessor.convert(text, toScript, options)
}


// occurances of the following patterns in Pali text would result in ambiguity in Roman text
const alPlusIndeptVowel = /\u0dca[අ-ඔ]/g, // ka = ක්අ = ක
    aspiratedHalPlusH = /[කගචපජබතදටඩ]\u0dcaහ්/g // dh = ද්හ් = ධ් for 10 aspirated consos

export function checkRomanConvert(text) {
    let hasErrors = false
    if (alPlusIndeptVowel.test(text)) {
        console.log(`al + indeptVowel occurs in ${text}`)
        hasErrors = true
    }
    if (aspiratedHalPlusH.test(text)) {
        console.log(`aspirated al + h occurs in ${text}`)
        hasErrors = true
    }
    return hasErrors
}

export function checkUnconverted(text) {
    if (/[\u0D80-\u0DFF]/g.test(text)) {
        console.log(`unconverted sinhala letters found in ${text}`)
        return true
    }
    return false
}


// for es6 - browser
// export {TextProcessor, Script, paliScriptInfo, getScriptForCode};

// for node
//module.exports = {TextProcessor: TextProcessor, Script: Script};

/**
 * how to use this library
 * first step - convert from source script to sinhala
 * const sinhText = TextProcessor.convertFrom(romanText, Script.RO) // convert from one specific script to sinhala
 * const sinhText = TextProcessor.convertFromMixed(mixedPaliText) // convert from any script to Sinhala
 * second step - convert to your destination script from sinhala
 * const finalText = TextProcessor.convert(sinhText, Script.MY)
 */

function errorCheckMapping() {
    const num_scripts = [3, 20]
    consos.concat(specials, vowels).forEach(ar => {
        console.assert(num_scripts.includes(ar.length), `${ar} length not one of ${num_scripts}`);
        ar.forEach((ch, i) => {
            if (ch) {
                const charCode = ch.charCodeAt(0)
                const script = Object.keys(script_index).find(s => script_index[s] === i); // find script for index
                const ranges = PaliScriptInfo.get(script)[2] // ranges of the above script
                // sinhala digits are in roman range - hence the isNan check
                console.assert(ranges.some(range => charCode >= range[0] && charCode <= range[1]) || !isNaN(ch), 
                    `char ${ch} code ${charCode}: not within the range for script ${script}`);
            }
        });
        const uniq = ar.filter((v, i, a) => a.indexOf(v) === i || v === '');
        if (uniq.length != ar.length && isNaN(ar[0])) console.error(`duplicates in mapping: ${ar} : ${uniq}`);
    });
}
errorCheckMapping();


/*

const deva_specials = [
    ['\u0D82','\u0902'], // niggahita - anusawara
    ['\u0D83','\u0903'], // visarga - not in pali but deva original text has it

    // independent vowels
    ['\u0D85','\u0905'], // a
    ['\u0D86','\u0906'], // aa
    ['\u0D89','\u0907'], // i
    ['\u0D8A','\u0908'], // ii
    ['\u0D8B','\u0909'], // u
    ['\u0D8C','\u090A'], // uu
    ['\u0D91','\u090F'], // e
    ['\u0D94','\u0913'], // o

    // various signs
    ['\u0DCA','\u094D'], // Sinhala virama -> Dev. virama (al - hal)

    // digits
    ['0', '\u0966'],
    ['1', '\u0967'],
    ['2', '\u0968'],
    ['3', '\u0969'],
    ['4', '\u096A'],
    ['5', '\u096B'],
    ['6', '\u096C'],
    ['7', '\u096D'],
    ['8', '\u096E'],
    ['9', '\u096F'],
];*/
/*const deva_conso = [
    // velar stops
    ['\u0D9A','\u0915'], // ka
    ['\u0D9B','\u0916'], // kha
    ['\u0D9C','\u0917'], // ga
    ['\u0D9D','\u0918'], // gha
    ['\u0D9E','\u0919'], // n overdot a

    // palatal stops
    ['\u0DA0','\u091A'], // ca
    ['\u0DA1','\u091B'], // cha
    ['\u0DA2','\u091C'], // ja
    ['\u0DA3','\u091D'], // jha
    ['\u0DA4','\u091E'], // �a

    // retroflex stops
    ['\u0DA7','\u091F'], // t underdot a
    ['\u0DA8','\u0920'], // t underdot ha
    ['\u0DA9','\u0921'], // d underdot a
    ['\u0DAA','\u0922'], // d underdot ha
    ['\u0DAB','\u0923'], // n underdot a

    // dental stops
    ['\u0DAD','\u0924'], // ta
    ['\u0DAE','\u0925'], // tha
    ['\u0DAF','\u0926'], // da
    ['\u0DB0','\u0927'], // dha
    ['\u0DB1','\u0928'], // na

    // labial stops
    ['\u0DB4','\u092A'], // pa
    ['\u0DB5','\u092B'], // pha
    ['\u0DB6','\u092C'], // ba
    ['\u0DB7','\u092D'], // bha
    ['\u0DB8','\u092E'], // ma

    // liquids, fricatives, etc.
    ['\u0DBA','\u092F'], // ya
    ['\u0DBB','\u0930'], // ra
    ['\u0DBD','\u0932'], // la
    ['\u0DC0','\u0935'], // va
    ['\u0DC3','\u0938'], // sa
    ['\u0DC4','\u0939'], // ha
    ['\u0DC5','\u0933'], // l underdot a
];*/
/*const deva_vowels = [
    // dependent vowel signs
    ['\u0DCF','\u093E'], // aa
    ['\u0DD2','\u093F'], // i
    ['\u0DD3','\u0940'], // ii
    ['\u0DD4','\u0941'], // u
    ['\u0DD6','\u0942'], // uu
    ['\u0DD9','\u0947'], // e
    ['\u0DDC','\u094B'], // o
];*/