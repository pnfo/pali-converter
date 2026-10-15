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
