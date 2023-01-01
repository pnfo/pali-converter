# @pnfo/pali-converter
convert Pali language text from one script to another

## Usage
* `npm install @pnfo/pali-converter`
* `import { convert, convertMixed } from '@pnfo/pali-converter`
* convert to Sinhala from Roman `convert('janaka', Script.SI, Script.RO)`
* convert to Sinhala from multiple scripts (Roman and Myanmar) `convertMixed('janakaဗမာစာ', Script.SI)`
