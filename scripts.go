package paliconverter

import (
	"regexp"
	"strings"
	"unicode/utf8"
)

// Beautify does the script specific changes after converting from Sinhala (TextProcessor.beautify). rendType is
// "cen" (centered: no double dandas) or "ga..." (gathas: dandas to ; and .).
func Beautify(text, script, rendType string) string {
	switch script {
	case Sinh:
		return beautifyCommon(beautifySinh(text), rendType)
	case Latn:
		return capitalize(beautifyCommon(text, rendType))
	case Thai:
		return beautifyCommon(beautifyThai(swapEO(text, script)), rendType)
	case Laoo:
		return beautifyCommon(swapEO(text, script), rendType)
	case Mymr:
		return beautifyCommon(beautifyMymr(text), rendType)
	case Khmr, Gujr, Telu, Mlym, Cyrl:
		return beautifyCommon(text, rendType)
	case Lana:
		return beautifyLana(text)
	case Taml:
		return beautifyCommon(beautifyTamil(text), rendType)
	case Brah:
		return beautifyCommon(beautifyBrahmi(text), rendType)
	case Tibt:
		return beautifyTibet(text)
	case Asse:
		return beautifyAssamese(text)
	}
	return text
}

// UnBeautify undoes the script specific changes before converting to Sinhala (TextProcessor.un_beautify).
func UnBeautify(text, script string) string {
	switch script {
	case Sinh:
		return unBeautifySinh(cleanupZWJ(text))
	case Deva:
		return cleanupZWJ(text) // original deva script (from tipitaka.org) text has zwj
	case Latn:
		return jsLower(text)
	case Thai:
		return unSwapEO(unBeautifyThai(text), script)
	case Laoo:
		return unSwapEO(text, script)
	case Khmr:
		return unBeautifyKhmer(text)
	case Lana:
		return unBeautifyLana(text)
	case Mymr:
		return unBeautifyMymr(text)
	case Tibt:
		return unBeautifyTibet(text)
	case Asse:
		return unBeautifyAssamese(text)
	case Taml:
		return unBeautifyTamil(text)
	}
	return text
}

func is(set string) func(rune) bool { return func(r rune) bool { return strings.ContainsRune(set, r) } }

func between(lo, hi rune) func(rune) bool { return func(r rune) bool { return r >= lo && r <= hi } }

// replacer is a strings.Replacer that returns the text as it is (without allocating) when it has none of the first
// letters of the keys.
type replacer struct {
	r     *strings.Replacer
	first string
}

func newReplacer(pairs ...string) replacer {
	first := ""
	for i := 0; i < len(pairs); i += 2 {
		if r, _ := utf8.DecodeRuneInString(pairs[i]); !strings.ContainsRune(first, r) {
			first += string(r)
		}
	}
	return replacer{strings.NewReplacer(pairs...), first}
}

func (r replacer) Replace(text string) string {
	if !strings.ContainsAny(text, r.first) {
		return text
	}
	return r.r.Replace(text)
}

// replaceChain applies the replacements one after the other, as a chain of JS replace calls.
func replaceChain(text string, pairs ...string) string {
	for i := 0; i+1 < len(pairs); i += 2 {
		text = strings.ReplaceAll(text, pairs[i], pairs[i+1])
	}
	return text
}

// collapseRuns replaces each run of the letters in set by rep (/[set]+/g).
func collapseRuns(text, set, rep string) string {
	return replaceText(text, is(set), func(out *strings.Builder, rest string) int {
		n := 0
		for _, r := range rest {
			if !strings.ContainsRune(set, r) {
				break
			}
			n += utf8.RuneLen(r)
		}
		out.WriteString(rep)
		return n
	})
}

// signsAt is the length in bytes of the run of Tamil vowel signs / virama / anusvara at the start of s
func signsAt(s string) int {
	n := 0
	for _, r := range s {
		if !isTamilSign(r) {
			break
		}
		n += utf8.RuneLen(r)
	}
	return n
}

var sinhJoiners = newReplacer("\u0DCA\u0DBA", "\u0DCA\u200D\u0DBA", "\u0DCA\u0DBB", "\u0DCA\u200D\u0DBB")

// change joiners before U+0DBA Yayanna and U+0DBB Rayanna to Virama + ZWJ
func beautifySinh(text string) string { return sinhJoiners.Replace(text) }

// long vowels replaced by short vowels as sometimes people type long vowels by mistake
func unBeautifySinh(text string) string {
	return replaceChain(text, "ඒ", "එ", "ඕ", "ඔ", "ේ", "ෙ", "ෝ", "ො")
}

var mymrPunct = newReplacer(",", "၊", ";", "၊")
var mymrMedials = newReplacer("\u1039ယ", "ျ", "\u1039ရ", "ြ", "\u1039ဝ", "ွ", "\u1039ဟ", "ှ")

// new unicode 5.1 spec https://www.unicode.org/notes/tn11/UTN11_3.pdf
func beautifyMymr(text string) string {
	text = mymrPunct.Replace(text)                              // comma/semicolon -> single line
	text = collapseRuns(text, "\u2026\u0964\u0965", "။")        // ellipsis/danda/double danda -> double line
	text = replaceChain(text, "ဉ\u1039ဉ", "ည", "သ\u1039သ", "ဿ") // kn + kna, s + sa have a single char
	// kinzi - ඞ + al
	text = replaceAt(text, 3, is("င"), func(out *strings.Builder, w []rune) int {
		if len(w) < 3 || w[1] != '\u1039' || w[2] < 'က' || w[2] > 'ဠ' {
			return 0
		}
		out.WriteString("င\u103A\u1039")
		out.WriteRune(w[2])
		return 3
	})
	text = mymrMedials.Replace(text) // yansaya, rakar, wahswe, hahto
	// the Sangha is written with niggahita (ဘိက္ခုသံဃေန, သံဃာ) in Myanmar Pali texts, saṅghāṭī saṅghāta etc. keep the kinzi
	// (/သင်္ဃ(?!ာ?[ဋတ]|ရ|ု)/g)
	const sangha = "သင\u103A\u1039ဃ"
	text = replaceAt(text, 7, is("သ"), func(out *strings.Builder, w []rune) int {
		if len(w) < 5 || string(w[:5]) != sangha {
			return 0
		}
		next := w[5:]
		if len(next) > 0 && strings.ContainsRune("ဋတရု", next[0]) || len(next) > 1 && next[0] == '\u102C' && (next[1] == 'ဋ' || next[1] == 'တ') {
			return 0
		}
		out.WriteString("သံဃ")
		return 5
	})
	// following code for tall aa is from https://www.facebook.com/pndaza.mlm
	// aa to tall aa (also after ဝှ: ဇိဝှါ jivhā): /((?:ဝှ|[ခဂငဒပဝ])ေ?)\u102c/g
	text = replaceAt(text, 4, is("ခဂငဒပဝ"), func(out *strings.Builder, w []rune) int {
		start := 1
		if w[0] == 'ဝ' && len(w) > 1 && w[1] == 'ှ' && tallAA(w[2:], '\u102C') > 0 {
			start = 2
		}
		return writeTallAA(out, w, start, '\u102C', '\u102B')
	})
	// restore back tall aa to aa for some pattern: /(က္ခ|န္ဒ|မ္ပ)(ေ?)\u102b/g
	text = replaceAt(text, 5, is("ကနမ"), func(out *strings.Builder, w []rune) int {
		if len(w) < 3 || w[1] != '\u1039' || !strings.Contains("က\u1039ခ န\u1039ဒ မ\u1039ပ", string(w[:3])) {
			return 0
		}
		return writeTallAA(out, w, 3, '\u102B', '\u102C')
	})
	// tall aa also after these stacks (as in Myanmar printed Pali: ပ္ပါ ပ္ဖါ ဂ္ဃါ, the Tipitaka Pali-Myanmar Dictionary)
	// /(ဒ္ဓ|ဒွ|ပ္ပ|ပ္ဖ|ဂ္ဃ)(ေ?)\u102c/g
	return replaceAt(text, 5, is("ဒပဂ"), func(out *strings.Builder, w []rune) int {
		switch {
		case len(w) >= 2 && string(w[:2]) == "ဒွ":
			return writeTallAA(out, w, 2, '\u102C', '\u102B')
		case len(w) >= 3 && strings.Contains("ဒ\u1039ဓ ပ\u1039ပ ပ\u1039ဖ ဂ\u1039ဃ", string(w[:3])) && w[1] == '\u1039':
			return writeTallAA(out, w, 3, '\u102C', '\u102B')
		}
		return 0
	})
}

// tallAA is the length of ေ?<aa> at the start of w, 0 for none
func tallAA(w []rune, aa rune) int {
	if len(w) > 1 && w[0] == 'ေ' && w[1] == aa {
		return 2
	}
	if len(w) > 0 && w[0] == aa {
		return 1
	}
	return 0
}

// writeTallAA matches w[:start] followed by ေ?<from> and writes it with the aa changed to to
func writeTallAA(out *strings.Builder, w []rune, start int, from, to rune) int {
	n := tallAA(w[start:], from)
	if n == 0 {
		return 0
	}
	out.WriteString(string(w[:start+n-1]))
	out.WriteRune(to)
	return start + n
}

func unBeautifyMymr(text string) string { // reverse of beautify above
	return replaceChain(text,
		"\u102B", "\u102C",
		"ှ", "\u1039ဟ", // al + ha - hahto
		"ွ", "\u1039ဝ", // al + wa - wahswe
		"ြ", "\u1039ရ", // rakar - yayit
		"ျ", "\u1039ယ", // yansaya  - yapin
		"\u103A", "", // kinzi
		"ဿ", "သ\u1039သ", // s + sa has a single char (great sa)
		"ည", "ဉ\u1039ဉ", // nnga
		"သံဃ", "သင\u1039ဃ", // nigghahita to ṅ for this word for searching - from Pn Daza
		"၊", ",", // single line -> comma
		"။", ".") // double line -> period
}

var dandasToPeriod = newReplacer("।", ".", "॥", ".")

// beautifyCommon: punctuation of all scripts
func beautifyCommon(text, rendType string) string {
	if rendType == "cen" { // remove double dandas around namo tassa
		text = strings.ReplaceAll(text, "॥", "")
	} else if strings.HasPrefix(rendType, "ga") { // in gathas, single dandas convert to semicolon, double to period
		text = replaceChain(text, "।", ";", "॥", ".")
	}
	// remove Dev abbreviation sign before an ellipsis. We don't want a 4th dot after pe.
	text = replaceChain(text, "॰…", "…", "॰", "·") // abbre sign changed - prevent capitalization in notes
	text = dandasToPeriod.Replace(text)            // all other single and double dandas converted to period
	// cleanup punctuation 1) two spaces to one 2) There should be no spaces before these punctuation marks.
	return replaceAt(text, 2, isJSSpace, func(out *strings.Builder, w []rune) int {
		if len(w) < 2 || !(isJSSpace(w[1]) || strings.ContainsRune(",!;?.", w[1])) {
			return 0
		}
		out.WriteRune(w[1])
		return 2
	})
}

// the adding of <w> tags around the words before the beautification makes it harder - (?:<w>)? added
var (
	capLine     = regexp.MustCompile(`^(?:<w>)?[^` + jsSpaceClass + `]`)
	capSentence = regexp.MustCompile(`([.?][` + jsSpaceClass + `](?:<w>)?)([^` + jsSpaceClass + `])`)
	capQuote    = regexp.MustCompile("([\u201C‘](?:<w>)?)([^" + jsSpaceClass + "])")
)

// capitalize roman text: the beginning of the text, of sentences and quotes
func capitalize(text string) string {
	if m := capLine.FindStringIndex(text); m != nil {
		text = upperBMP(text[:m[1]]) + text[m[1]:]
	}
	for _, re := range []*regexp.Regexp{capSentence, capQuote} {
		ms := re.FindAllStringSubmatchIndex(text, -1)
		if ms == nil {
			continue
		}
		var out strings.Builder
		out.Grow(len(text) + 8)
		last := 0
		for _, m := range ms {
			out.WriteString(text[last:m[4]])
			out.WriteString(upperBMP(text[m[4]:m[5]]))
			last = m[5]
		}
		out.WriteString(text[last:])
		text = out.String()
	}
	return text
}

// e / o are written before the consonant in thai and lao
func swapEO(text, script string) string {
	conso, eo := between('ก', 'ฮ'), is("เโ")
	if script == Laoo {
		conso, eo = between('ກ', 'ຮ'), is("ເໂ")
	}
	text = replaceAt(text, 2, conso, func(out *strings.Builder, w []rune) int {
		if len(w) < 2 || !eo(w[1]) {
			return 0
		}
		out.WriteRune(w[1])
		out.WriteRune(w[0])
		return 2
	})
	if script == Laoo {
		return text
	}
	// in Thai Pali texts e / o go before a cluster whose second letter is ห ว ร ย น ล ม (not a double): เมฺห เทฺว เตฺร
	// (the Siam Rath edition), and before the last letter of the other clusters (ตฺโต นฺเต)
	return replaceAt(text, 4, conso, func(out *strings.Builder, w []rune) int {
		if len(w) < 4 || w[1] != 'ฺ' || !eo(w[2]) || !strings.ContainsRune(thaiClusterSecond, w[3]) {
			return 0
		}
		if w[0] == w[3] {
			out.WriteString(string(w))
		} else {
			out.WriteRune(w[2])
			out.WriteRune(w[0])
			out.WriteRune('ฺ')
			out.WriteRune(w[3])
		}
		return 4
	})
}

const thaiClusterSecond = "หวรยนลม"

// to be used when converting from
func unSwapEO(text, script string) string {
	if script == Laoo {
		return replaceAt(text, 2, is("ເໂ"), func(out *strings.Builder, w []rune) int {
			if len(w) < 2 || w[1] < 'ກ' || w[1] > 'ຮ' {
				return 0
			}
			out.WriteRune(w[1])
			out.WriteRune(w[0])
			return 2
		})
	}
	// one pass (a moved vowel is not moved again): before a cluster -> after it, else after the next letter
	// /([เโ])([ก-ฮ])(?:ฺ([หวรยนลม]))?/g
	return replaceAt(text, 4, is("เโ"), func(out *strings.Builder, w []rune) int {
		if len(w) < 2 || w[1] < 'ก' || w[1] > 'ฮ' {
			return 0
		}
		v, c1 := w[0], w[1]
		if len(w) < 4 || w[2] != 'ฺ' || !strings.ContainsRune(thaiClusterSecond, w[3]) {
			out.WriteRune(c1)
			out.WriteRune(v)
			return 2
		}
		if c1 != w[3] {
			out.WriteRune(c1)
			out.WriteRune('ฺ')
			out.WriteRune(w[3])
			out.WriteRune(v)
		} else {
			out.WriteRune(c1)
			out.WriteRune(v)
			out.WriteRune('ฺ')
			out.WriteRune(w[3])
		}
		return 4
	})
}

// 'iṃ' is written with its own vowel ึ in Thai Pali texts (the Siam Rath edition: สทฺธึ, กึ - never ิํ)
func beautifyThai(text string) string { return strings.ReplaceAll(text, "\u0E34\u0E4D", "\u0E36") }

func unBeautifyThai(text string) string {
	return replaceChain(text,
		"ฎ", "ฏ", // sometimes people use ฎ instead of the correct ฏ which is used in the tipitaka
		"\u0E36", "\u0E34\u0E4D", // 'iṃ' has a single unicode in thai which is split into two here
		"\uF70F", "ญ",
		"\uF700", "ฐ")
}

func unBeautifyKhmer(text string) string {
	return replaceChain(text,
		"\u17B9", "\u17B7\u17C6", // 'iṃ' has a single unicode in khmer which is split into two here
		"\u17D1", "\u17D2") // end of word virama is different in khmer
}

func beautifyBrahmi(text string) string { // just replace deva danda with brahmi danda
	return replaceChain(text, "।", "𑁇", "॥", "𑁈", "–", "𑁋")
}

func beautifyLana(text string) string {
	return replaceChain(text,
		"\u1A60\u1A41", "\u1A55", // medial ra - rakar
		"\u1A48\u1A60\u1A48", "\u1A54", // great sa - ssa
		"।", "\u1AA8",
		"॥", "\u1AA9")
}

func unBeautifyLana(text string) string { // reverse of beautify_lana
	return replaceChain(text,
		"\u1A55", "\u1A60\u1A41", // medial ra
		"\u1A54", "\u1A48\u1A60\u1A48", // great sa
		"\u1AA8", "।",
		"\u1AA9", "॥",
		"ᩤ", "ᩣ") // tall aa with normal a
}

// the subjoined consonants: halant + consonant (U+0F40 + i) -> U+0F90 + i, for i 0..39 (each of the JS replaces
// removes the halant of its pairs, so they do not interact and can be done in one pass)
var tibetSubjoin, tibetUnsubjoin = func() (replacer, replacer) {
	var join, unjoin []string
	for i := rune(0); i <= 39; i++ {
		join = append(join, string([]rune{0x0F84, 0x0F40 + i}), string(0x0F90+i))
		unjoin = append(unjoin, string(0x0F90+i), string([]rune{0x0F84, 0x0F40 + i}))
	}
	return newReplacer(join...), newReplacer(unjoin...)
}()

func beautifyTibet(text string) string { // copied form csharp - consider removing subjoined as it makes it hard to read
	text = replaceChain(text, "।", "།", "॥", "༎") // tibet dandas
	text = tibetSubjoin.Replace(text)
	text = replaceChain(text,
		// exceptions: yya and vva use the "fixed-form subjoined consonants as the 2nd one
		"\u0F61\u0FB1", "\u0F61\u0FBB", //yya
		"\u0F5D\u0FAD", "\u0F5D\u0FBA", //vva
		// exceptions: jjha, yha and vha use explicit (visible) halant between
		"\u0F5B\u0FAC", "\u0F5B\u0F84\u0F5C", //jjha
		"\u0F61\u0FB7", "\u0F61\u0F84\u0F67", //yha
		"\u0F5D\u0FB7", "\u0F5D\u0F84\u0F67") //vha
	// the intersyllabic tsheg: before every syllable but the first of a word (a base, not subjoined, consonant after a
	// letter, vowel sign or the ḷ mark; not after an explicit halant) - as in the VRI Tibetan edition (ན་མོ་ ཨ་ཏྟ་ནཱ)
	// /(?<=[༹ཀ-ྃ྅-ྼ])(?=[ཀ-ཬ])/g
	syllable := func(r rune) bool { return r == 0x0F39 || r >= 0x0F40 && r <= 0x0F83 || r >= 0x0F85 && r <= 0x0FBC }
	return replaceAt(text, 2, syllable, func(out *strings.Builder, w []rune) int {
		if len(w) < 2 || w[1] < 0x0F40 || w[1] > 0x0F6C {
			return 0
		}
		out.WriteRune(w[0])
		out.WriteRune(0x0F0B)
		return 1
	})
}

func unBeautifyTibet(text string) string { // undo beautify_tibet: tsheg, subjoined consonants, dandas
	text = replaceChain(text, "\u0F0B", "", "\u0F61\u0FBB", "\u0F61\u0FB1", "\u0F5D\u0FBA", "\u0F5D\u0FAD") // yya, vva fixed forms
	text = tibetUnsubjoin.Replace(text)
	return replaceChain(text, "།", "।", "༎", "॥")
}

// can unbeautify but not useful since it is not possible to identify assamese since it uses the same unicode block as bangla
// rules taken from sumitta.dhan@gmail.com email message
func beautifyAssamese(text string) string {
	return replaceChain(text, "ৰ", "ৱ", "র", "ৰ", "ল়", "ড়")
}

func unBeautifyAssamese(text string) string { // reverse of beautify_assamese (ra ৰ, va ৱ, ḷa ড়)
	return replaceChain(text, "ড়", "ল়", "ৰ", "র", "ৱ", "ৰ")
}

// Tamil has one letter for each row of stops (k kh g gh = க): the Pali convention marks the others with superscript
// digits, placed after the syllable's vowel sign / virama (த⁴ம்மம் dhammaṃ, பி⁴க்க²வே bhikkhave, தா⁴ dhā). niggahita is ம்
// as usual in Tamil (the Tamil anusvara ஂ looks like the virama); back from Tamil ம் is m before ம ப ஹ (dhamma, sambuddha,
// amhākaṃ), else ṃ

func isTamilSign(r rune) bool { return r >= 0x0BBE && r <= 0x0BCD || r == 0x0B82 }

func isTamilLetter(r rune) bool { return r >= 0x0B95 && r <= 0x0BB9 }

func beautifyTamil(text string) string {
	text = replaceAt(text, 1, between(0x0D00, 0x0D7F), func(out *strings.Builder, w []rune) int {
		if t, ok := mlTa[w[0]]; ok {
			out.WriteString(t)
		} else {
			out.WriteRune(w[0])
		}
		return 1
	})
	// the superscript after the signs that follow the letter: /([²³⁴])([\u0BBE-\u0BCD\u0B82]+)/g -> '$2$1'
	text = replaceText(text, is(tamilSup), func(out *strings.Builder, rest string) int {
		_, sz := utf8.DecodeRuneInString(rest)
		n := signsAt(rest[sz:])
		if n == 0 {
			return 0
		}
		out.WriteString(rest[sz : sz+n])
		out.WriteString(rest[:sz])
		return sz + n
	})
	// Tamil spelling: the dental na ந begins a word or comes before ta (ந்த), elsewhere na is written ன (VRI's Tamil too)
	// /(?<=[\u0B82-\u0BCD²³⁴])ந(?!்த)/g
	var out strings.Builder
	prev, started := rune(0), false
	for i, r := range text {
		if r == 'ந' && (prev >= 0x0B82 && prev <= 0x0BCD || strings.ContainsRune(tamilSup, prev)) && !strings.HasPrefix(text[i+len("ந"):], "\u0BCDத") {
			if !started {
				out.Grow(len(text))
				out.WriteString(text[:i])
				started = true
			}
			out.WriteRune('ன')
		} else if started {
			out.WriteRune(r)
		}
		prev = r
	}
	if !started {
		return text
	}
	return out.String()
}

func unBeautifyTamil(text string) string {
	text = strings.ReplaceAll(text, "ன", "ந")
	// superscript back to the letter: /([\u0B95-\u0BB9])([\u0BBE-\u0BCD\u0B82]*)([²³⁴])/g -> '$1$3$2'
	text = replaceText(text, isTamilLetter, func(out *strings.Builder, rest string) int {
		_, sz := utf8.DecodeRuneInString(rest)
		n := signsAt(rest[sz:])
		sup, supSz := utf8.DecodeRuneInString(rest[sz+n:])
		if supSz == 0 || !strings.ContainsRune(tamilSup, sup) {
			return 0
		}
		out.WriteString(rest[:sz])
		out.WriteRune(sup)
		out.WriteString(rest[sz : sz+n])
		return sz + n + supSz
	})
	// niggahita: /ம்(?![மபஹ])/g -> 'ம\u0B82'
	text = replaceAt(text, 3, is("\u0BAE"), func(out *strings.Builder, w []rune) int {
		if len(w) < 2 || w[1] != '\u0BCD' || len(w) > 2 && strings.ContainsRune("\u0BAEப\u0BB9", w[2]) {
			return 0
		}
		out.WriteString("\u0BAE\u0B82")
		return 2
	})
	text = replaceChain(text, "\u0BAE\u0B82", "ം", "\u0B82", "ം")
	// /[க-ஹ][²³⁴]|[஀-௿]/g -> TA_ML[c] ?? c
	return replaceAt(text, 2, between(0x0B80, 0x0BFF), func(out *strings.Builder, w []rune) int {
		n := 1
		if isTamilLetter(w[0]) && len(w) > 1 && strings.ContainsRune(tamilSup, w[1]) {
			n = 2
		}
		c := string(w[:n])
		if m, ok := taMl[c]; ok {
			c = m
		}
		out.WriteString(c)
		return n
	})
}
