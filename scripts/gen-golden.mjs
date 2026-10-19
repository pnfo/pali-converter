// node scripts/gen-golden.mjs - writes testdata/golden.ndjson.gz: the outputs of the JS converter (index.js) that the
// Go port must reproduce exactly (golden_test.go). Not committed (~25 MB), generated in CI.
//   book lines   every line of testdata/corpus.txt.gz (the paragraphs of a few books of the Tipiṭaka and the titles of
//                tipitaka.app, Roman): to every script, back to Roman, and a mix of the scripts word by word
//   fuzz lines   random text from the letters of each script, punctuation, upper case, spaces, ZWJ etc.: to and from
//                every script, from Sinhala, mixed, beautify with rendType
import fs from 'node:fs'
import zlib from 'node:zlib'
import { convert, convertMixed, Script, TextProcessor } from '../index.js'
import { loadConverter } from './load.mjs'

const root = new URL('..', import.meta.url)
const scripts = Object.values(Script)
const out = zlib.createGzip({ level: 6 })
const done = new Promise((resolve, reject) => out.pipe(fs.createWriteStream(new URL('testdata/golden.ndjson.gz', root))).on('finish', resolve).on('error', reject))
let records = 0
const write = rec => { out.write(JSON.stringify(rec) + '\n'); records++ }
const each = fn => Object.fromEntries(scripts.map(s => [s, fn(s)]))

const corpus = zlib.gunzipSync(fs.readFileSync(new URL('testdata/corpus.txt.gz', root))).toString('utf8').split('\n').filter(Boolean)
corpus.forEach((line, n) => {
    const to = each(s => convert(line, s, Script.LATN))
    const back = each(s => convert(to[s], Script.LATN, s))
    // word i of the line in script (n + i) % 22
    const words = Object.fromEntries(scripts.map(s => [s, to[s].split(' ')]))
    const mix = line.split(' ').map((w, i) => words[scripts[(n + i) % scripts.length]][i] ?? w).join(' ')
    write({ in: line, to, back, mix, mixed: { sinh: convertMixed(mix, Script.SINH), latn: convertMixed(mix, Script.LATN) } })
})

// random text: a seeded PRNG (mulberry32) so that the file is the same on every run
let seed = 0x9e3779b9
const rand = () => {
    seed = (seed + 0x6D2B79F5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
}
const pick = a => a[Math.floor(rand() * a.length)]

const C = loadConverter()
const column = s => [...new Set(C.consos.concat(C.specials, C.vowels).map(r => r[C.script_index[s]]).filter(Boolean))]
const common = [' ', ' ', ' ', ' ', '.', ',', ';', ':', '?', '!', '…', '।', '॥', '॰', '॰…', '‘', '’', '“', '”', '–', '-', '\n', '\t',
    ' ', ' ', '　', '<w>', '</w>', '²', '³', '⁴', '‍', '‌', '|', '*', '(', ')', '0', '1', '7', 'ṁ', '🔀', '🐀', '😀',
    '\u{11180}', '𑀓', '𑄇']
const extras = {
    latn: [...'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'Ā', 'Ī', 'Ū', 'Ṃ', 'Ṅ', 'Ñ', 'Ṭ', 'Ḍ', 'Ṇ', 'Ḷ', 'Ṁ', 'ß', 'ŉ', 'İ', 'Σ', 'σ', 'Α', 'ω', 'ά',
        '\u0307', '\u0345', '\u0301', 'ﬁ', 'ǅ', 'ai', 'au', 'ṭh', 'l̥', 'saṅghāta', 'saṅghāṭi', 'saṅghena', 'saṅgharakkhita', 'saṅghu', '\u{10428}', '\u{10400}'],
    sinh: ['ඒ', 'ඕ', 'ේ', 'ෝ', '\u0DCA', '\u0DCAය', '\u0DCAර', '\u200D', 'ෆ', 'ශ', 'ෂ', 'ෛ'],
    mymr: ['ါ', 'ှ', 'ွ', 'ြ', 'ျ', '\u103A', 'ဿ', 'ည', '၊', '။', 'သင\u103A္ဃ', 'သင\u103A္ဃာ', 'သင\u103A္ဃာတ', 'သင\u103A္ဃာဋ', 'သင\u103A္ဃု', 'သင\u103A္ဃရ', 'သင္ဃ', 'ဋ', 'ု', 'ဝှ', 'ေ', '္', 'င္', 'ဉ္ဉ', 'သ္သ', 'ဒ္ဓ', 'ဒွ', 'ပ္ပ', 'ပ္ဖ', 'ဂ္ဃ', 'က္ခ', 'န္ဒ', 'မ္ပ'],
    thai: ['ฎ', 'ึ', '\uF70F', '\uF700', 'ฺ', 'เ', 'โ', 'ห', 'ว', 'ฺห', 'ฺว', 'ิํ'],
    laoo: ['ເ', 'ໂ', '຺'],
    khmr: ['\u17B9', '\u17D1', '\u17D2'],
    tibt: ['\u0F0B', '\u0F90', '\u0FB1', '\u0FBB', '\u0FBA', '\u0FAD', '\u0F84', '།', '༎', '\u0F39', '\u0FAC', '\u0FB7', '\u0F6C', '\u0F83'],
    lana: ['\u1A55', '\u1A54', '\u1AA8', '\u1AA9', 'ᩤ', '\u1A60', '\u1A41', '\u1A48'],
    asse: ['ৰ', 'ৱ', 'ড়', 'র', 'ল়'],
    beng: ['ৰ', 'ৱ', 'ড়', 'র', 'ল়'],
    taml: ['ன', 'ந', 'ம', '்', 'ஂ', 'த', 'க', 'ா', 'ி', 'ே', 'ொ', 'ம்', 'ப', 'ஹ', 'ங', 'ந்த', 'க²', 'க³', 'க⁴', 'ஜ²', 'ங²', '\u0B80', '\u0BFA'],
    mlym: ['\u0D00', '\u0D7F', 'ൺ'],
    brah: ['𑁇', '𑁈', '𑁋'],
    cyrl: ['А', 'Б', 'Ӣ', '\u0301'],
}
const themes = [...scripts, 'all']
const alphabets = Object.fromEntries(scripts.map(s => [s, column(s).concat(extras[s] ?? [])]))
const all = [...new Set(Object.values(alphabets).flat())]
const randomText = () => {
    const theme = pick(themes)
    const own = theme === 'all' ? all : alphabets[theme]
    const len = 1 + Math.floor(rand() * 40)
    let s = ''
    for (let i = 0; i < len; i++) {
        const x = rand()
        s += pick(x < 0.55 ? own : x < 0.65 ? alphabets.sinh : x < 0.75 ? alphabets.latn : x < 0.8 ? all : common)
    }
    return s
}
const rendTypes = ['cen', 'ga', 'gatha1']
for (let i = 0; i < 5000; i++) {
    const s = randomText()
    write({
        fuzz: s,
        to: each(x => convert(s, x, Script.LATN)),
        from: each(x => convert(s, Script.LATN, x)),
        fromSinh: each(x => convert(s, x, Script.SINH)),
        toSinh: each(x => TextProcessor.convertFrom(s, x)),
        mixed: { sinh: convertMixed(s, Script.SINH), latn: convertMixed(s, Script.LATN), thai: convertMixed(s, Script.THAI) },
        beautify: Object.fromEntries(['latn', 'sinh', 'mymr', 'thai', 'taml', 'brah', 'tibt'].flatMap(x => rendTypes.map(r => [`${x}/${r}`, TextProcessor.beautify(s, x, r)]))),
        unknown: { to: convert(s, 'xx', Script.LATN), from: convert(s, Script.LATN, 'xx') },
    })
}
out.end()
await done
console.log(`wrote testdata/golden.ndjson.gz: ${records} records (${corpus.length} corpus lines)`)
