# @pnfo/pali-converter
convert Pali language text from one script to another

## Usage
* `npm install @pnfo/pali-converter`
* `import { convert, convertMixed } from '@pnfo/pali-converter`
* convert to Sinhala from Roman `convert('janaka', Script.SI, Script.RO)`
* convert to Sinhala from multiple scripts (Roman and Myanmar) `convertMixed('janakaဗမာစာ', Script.SI)`

## Notes
* Roman Pali has no diphthongs: `ai` and `au` in Roman input are two vowels (`sauddesaṃ` → `සඋද්දෙසං`, `सउद्देसं`).
  Sinhala and Devanagari diphthongs (ඓ ඖ ෛ ෞ) still convert to Roman `ai` / `au` (since 1.2.0).
* Letters that do not exist in the target script (Sanskrit vowels in Thai, Myanmar...) are left unconverted,
  `checkUnconverted()` detects them in Sinhala output.

## Go
A port of `index.js` to Go, for servers (tipitaka.app renders its pages in Go). `index.js` stays the source of truth:
the letter tables are generated from it and the tests check that both convert identically.
```go
import paliconverter "github.com/pnfo/pali-converter"

paliconverter.Convert("janaka", paliconverter.Sinh, paliconverter.Latn) // ජනක
paliconverter.ConvertMixed("janakaဗမာစာ", paliconverter.Sinh)
```
The API follows the JS one: `Convert`, `ConvertMixed`, `ConvertTo` / `ConvertFrom` (`TextProcessor.convert` /
`convertFrom`), `Beautify`, `UnBeautify`, `BasicConvert`, `BasicConvertFrom`, `ScriptForCode`, `IsScript`,
`CheckRomanConvert`, `CheckUnconverted`. No dependencies.

When `index.js` changes:
* `npm run gen:go` regenerates `tables_gen.go` (the letter mappings) and `case_gen.go` (the case mappings of the JS
  `toLowerCase` / `toUpperCase`, which Go's `unicode` package does not match exactly); the regex replacements of the
  changed functions are ported by hand to `scripts.go` / `converter.go`
* `npm run golden && npm run test:go` checks the port: `scripts/gen-golden.mjs` writes the JS outputs (not committed,
  ~35 MB) for every paragraph of 4 books and the 20 800 titles of tipitaka.app (`testdata/corpus.txt.gz`) to all 22
  scripts, back to Roman and mixed, and for 5000 random strings (to / from every script, from Sinhala, mixed,
  `beautify` with `rendType`, unknown scripts): 1.8 million conversions that must be identical. `converter_test.go`
  has the tests of `converter.test.js`. CI does all of this.

Speed (`npm run bench`): a page, the 213 paragraphs of the Brahmajālasutta (86 KB of Roman), one `convert` call per
paragraph, ms per page on an Apple M-series CPU (mean of the 21 scripts; Myanmar is the slowest in all three):

| goja (JS in Go) | V8 (node 24) | Go |
|---:|---:|---:|
| 302 | 9.3 | 5.3 |

With all 10 CPUs busy, Go converts 743 pages per second, goja 8.
