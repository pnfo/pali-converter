// Package paliconverter converts Pāḷi text from one script to another.
//
// It is a port of index.js (@pnfo/pali-converter), which stays the source of truth: the letter tables are generated
// from it (scripts/gen-go.mjs) and the tests check that both convert identically, on a few books in every script and
// on random text (scripts/gen-golden.mjs writes the JS outputs). Conversion goes through Sinhala, as in JS: the text
// is converted from its script to Sinhala, then from Sinhala to the target script.
package paliconverter

import (
	"strings"
	"unicode/utf16"
	"unicode/utf8"
)

// ScriptInfo describes a script (PaliScriptInfo in JS).
type ScriptInfo struct {
	Code       string // ISO 15924 code, lower case
	Name       string // English name
	NativeName string
	ranges     [][2]int // UTF-16 code unit ranges, as in JS
}

// Scripts returns the scripts in the order of PaliScriptInfo.
func Scripts() []ScriptInfo { return append([]ScriptInfo(nil), scriptInfo...) }

// ScriptCodes returns the script codes in the order of the JS Script enum.
func ScriptCodes() []string { return append([]string(nil), scriptCodes...) }

// IsScript reports whether name is a script code, in any case (isScript in JS).
func IsScript(name string) bool {
	up := jsUpper(name)
	for _, c := range scriptCodes {
		if jsUpper(c) == up {
			return true
		}
	}
	return false
}

// ScriptForCode returns the script of a UTF-16 code unit, "" for none (getScriptForCode, -1 in JS).
func ScriptForCode(code int) string {
	for _, info := range scriptInfo {
		for _, r := range info.ranges {
			if code >= r[0] && code <= r[1] {
				return info.Code
			}
		}
	}
	return ""
}

// Convert converts text in fromScript to toScript, e.g. Convert("janaka", Sinh, Latn) is "ජනක".
func Convert(text, toScript, fromScript string) string {
	return ConvertTo(ConvertFrom(text, fromScript), toScript)
}

// ConvertMixed converts text in several scripts (each letter is taken to be in the script of its Unicode block) to
// toScript, e.g. ConvertMixed("janakaဗမာစာ", Sinh).
func ConvertMixed(text, toScript string) string {
	return ConvertTo(ConvertFromMixed(text), toScript)
}

// ConvertTo converts Sinhala text to script, with the script specific beautification (TextProcessor.convert).
func ConvertTo(sinhText, script string) string {
	return Beautify(BasicConvert(sinhText, script), script, "")
}

// ConvertFrom converts text in script to Sinhala (TextProcessor.convertFrom).
func ConvertFrom(text, script string) string {
	return BasicConvertFrom(UnBeautify(text, script), script)
}

// ConvertFromMixed converts text in several scripts to Sinhala, each run of letters of one script on its own
// (TextProcessor.convertFromMixed).
func ConvertFromMixed(mixed string) string {
	mixed = cleanupZWJ(mixed)
	var out strings.Builder
	out.Grow(len(mixed) + len(mixed)/2)
	cur, start := "", 0
	for i, r := range mixed {
		var s string
		if cur == Taml && strings.ContainsRune(tamilSup, r) { // the superscripts of Tamil (²³⁴) belong to the Tamil run
			s = Taml
		} else {
			s = scriptForRune(r)
		}
		if s != cur {
			out.WriteString(ConvertFrom(mixed[start:i], cur))
			cur, start = s, i
		}
	}
	out.WriteString(ConvertFrom(mixed[start:], cur))
	return out.String()
}

// noScript is the run of a letter outside the BMP whose two UTF-16 code units are in different scripts in JS
// (Brahmi: the high surrogate is in the Chakma range): the halves are runs of their own there, never converted.
const noScript = "\x00"

// scriptForRune is the script of a letter in convertFromMixed, which looks at the UTF-16 code units.
func scriptForRune(r rune) string {
	if r < 0x10000 {
		return ScriptForCode(int(r))
	}
	hi, lo := utf16.EncodeRune(r)
	if s := ScriptForCode(int(hi)); s == ScriptForCode(int(lo)) {
		return s
	}
	return noScript
}

// BasicConvert converts Sinhala text to script, without beautification (TextProcessor.basicConvert).
func BasicConvert(text, script string) string {
	switch script {
	case Sinh:
		return text
	case Latn, Cyrl:
		return replaceByMaps(insertA(text, script), mapsTo(script))
	}
	return replaceByMaps(text, mapsTo(script))
}

// BasicConvertFrom converts text in script to Sinhala, without unbeautification (TextProcessor.basicConvertFrom).
func BasicConvertFrom(text, script string) string {
	switch script {
	case Sinh:
		return text
	case Latn:
		text = replaceByMaps(text, mapsFrom(script))
		return removeA(strings.ReplaceAll(text, "ṁ", "ං")) // fix_m_above (per ven anandajothi request)
	case Cyrl:
		return removeA(replaceByMaps(text, mapsFrom(script)))
	}
	return replaceByMaps(text, mapsFrom(script))
}

// letter maps (prepareHashMaps)

type letterMap struct {
	m    map[string]string
	grow int        // the output is at most about grow times the input
	lens [256][]int // key lengths in bytes for each first byte, longest first
}

var maps = struct{ to, from map[string]*letterMap }{map[string]*letterMap{}, map[string]*letterMap{}}

var emptyMap = &letterMap{m: map[string]string{}}

func init() {
	for _, s := range scriptCodes {
		maps.to[s] = prepareMap("to", s, true)
		maps.from[s] = prepareMap("from", s, s != Latn && s != Cyrl) // without the vowels for roman / cyrillic
	}
}

func mapsTo(script string) *letterMap {
	if m := maps.to[script]; m != nil {
		return m
	}
	return emptyMap
}

func mapsFrom(script string) *letterMap {
	if m := maps.from[script]; m != nil {
		return m
	}
	return emptyMap
}

func prepareMap(direction, script string, useVowels bool) *letterMap {
	col := func(s string) int {
		if i, ok := scriptIndex[s]; ok {
			return i
		}
		return -1
	}
	from, to := col(Sinh), col(script)
	if direction == "from" {
		from, to = to, from
	}
	lm := &letterMap{m: map[string]string{}}
	rows := append(append(append([][]string{}, consos...), specials...), vowels...)
	if !useVowels {
		rows = rows[:len(consos)+len(specials)]
	}
	for _, chars := range rows {
		if from < 0 || from >= len(chars) || chars[from] == "" { // empty '' from mapping - occurs in latn/cyrl
			continue
		}
		if to < 0 || to >= len(chars) { // no such letter in the target script (sanskrit letters) - left unconverted
			continue
		}
		key := chars[from]
		if direction == "from" && script == Latn && (key == romanDiphthongs[0] || key == romanDiphthongs[1]) {
			continue
		}
		lm.m[key] = chars[to] // a later row wins, as in a JS Map
	}
	lm.grow = 1
	for k, v := range lm.m {
		if g := (len(v) + len(k) - 1) / len(k); g > lm.grow {
			lm.grow = min(g, 3)
		}
	}
	for key := range lm.m {
		b, l := key[0], len(key)
		i := 0
		for i < len(lm.lens[b]) && lm.lens[b][i] > l {
			i++
		}
		if i == len(lm.lens[b]) || lm.lens[b][i] != l {
			lm.lens[b] = append(lm.lens[b][:i], append([]int{l}, lm.lens[b][i:]...)...)
		}
	}
	return lm
}

// replaceByMaps replaces the longest key at each position (two keys that match at one position are a prefix of the
// other, so the longest by bytes is the longest by UTF-16 units of JS).
func replaceByMaps(s string, lm *letterMap) string {
	if len(lm.m) == 0 || s == "" {
		return s
	}
	var out strings.Builder
	out.Grow(len(s)*lm.grow + 16)
	for i := 0; i < len(s); {
		matched := false
		for _, l := range lm.lens[s[i]] {
			if i+l <= len(s) {
				if v, ok := lm.m[s[i:i+l]]; ok {
					out.WriteString(v) // can be an empty string too
					i += l
					matched = true
					break
				}
			}
		}
		if !matched {
			_, size := utf8.DecodeRuneInString(s[i:])
			out.WriteString(s[i : i+size])
			i += size
		}
	}
	return out.String()
}

// Sinhala consonants (ක-ෆ in the JS regexes)
func isSinhConso(r rune) bool { return r >= 'ක' && r <= 'ෆ' }

// insertA inserts 'a' after the consonants that are not followed by a virama, a dependent vowel or 'a' (roman and
// cyrillic, insert_a).
func insertA(text, script string) string {
	a := 'a'
	if script == Cyrl {
		a = '\u0430'
	}
	notVowel := func(w []rune) bool { return !(w[1] >= '\u0DCF' && w[1] <= '\u0DDF' || w[1] == '\u0DCA' || w[1] == a) }
	pass := func(text string) string {
		return replaceAt(text, 2, isSinhConso, func(out *strings.Builder, w []rune) int {
			if len(w) < 2 || !notVowel(w) {
				return 0
			}
			out.WriteRune(w[0])
			out.WriteRune(a)
			out.WriteRune(w[1])
			return 2
		})
	}
	text = pass(pass(text)) // done twice to match successive consos
	if r, _ := utf8.DecodeLastRuneInString(text); isSinhConso(r) {
		text += string(a) // conso at the end of string
	}
	return text
}

// removeA adds the virama to the consonants not followed by a vowel and joins the independent vowels after a
// consonant to it (remove_a).
func removeA(text string) string {
	isIV := func(r rune) bool { _, ok := ivToDv[r]; return ok }
	pass := func(text string) string {
		return replaceAt(text, 2, isSinhConso, func(out *strings.Builder, w []rune) int {
			if len(w) < 2 || isIV(w[1]) || w[1] == '\u0DCA' {
				return 0
			}
			out.WriteRune(w[0])
			out.WriteRune('\u0DCA')
			out.WriteRune(w[1])
			return 2
		})
	}
	text = pass(pass(text)) // done twice to match successive hal
	if r, _ := utf8.DecodeLastRuneInString(text); isSinhConso(r) {
		text += "\u0DCA" // last conso
	}
	return replaceAt(text, 2, isSinhConso, func(out *strings.Builder, w []rune) int {
		if len(w) < 2 || !isIV(w[1]) {
			return 0
		}
		out.WriteRune(w[0])
		out.WriteString(ivToDv[w[1]])
		return 2
	})
}

func cleanupZWJ(text string) string { return zwjRemover.Replace(text) }

var zwjRemover = newReplacer("\u200C", "", "\u200D", "")

// CheckRomanConvert reports whether Sinhala text has letters that would be ambiguous in Roman: a virama before an
// independent vowel (ක්අ = ක in Roman) or an aspirated consonant written as consonant + virama + h (checkRomanConvert).
func CheckRomanConvert(text string) bool {
	prev := rune(0)
	for i, r := range text {
		if prev == '\u0DCA' && r >= 'අ' && r <= 'ඔ' {
			return true
		}
		if strings.ContainsRune("කගචපජබතදටඩ", r) && strings.HasPrefix(text[i+utf8.RuneLen(r):], "\u0DCAහ\u0DCA") {
			return true
		}
		prev = r
	}
	return false
}

// CheckUnconverted reports whether text has Sinhala letters (checkUnconverted).
func CheckUnconverted(text string) bool {
	for _, r := range text {
		if r >= 0x0D80 && r <= 0x0DFF {
			return true
		}
	}
	return false
}
