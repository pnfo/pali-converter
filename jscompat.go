package paliconverter

import (
	"sort"
	"strings"
	"unicode/utf8"
)

// replaceText does what a JS global regex replace does: it scans text left to right and at each position where
// first(letter) holds, calls f with the text from there on. f returns how many bytes it matched, after writing their
// replacement to out, or 0 (no match, out untouched). After a match the scan goes on after it (matches do not
// overlap; an empty match is not possible), else at the next letter.
//
// JS regexes without the u flag see UTF-16 code units, Go letters: the patterns ported this way only start with BMP
// letters, so they match in the same places.
func replaceText(text string, first func(rune) bool, f func(out *strings.Builder, rest string) int) string {
	var out strings.Builder
	copied, started := 0, false
	for i := 0; i < len(text); {
		r, sz := utf8.DecodeRuneInString(text[i:])
		if !first(r) {
			i += sz
			continue
		}
		if !started {
			out.Grow(len(text) + len(text)/4)
			started = true
		}
		out.WriteString(text[copied:i])
		copied = i
		if m := f(&out, text[i:]); m > 0 {
			i += m
			copied = i
		} else {
			i += sz
		}
	}
	if !started {
		return text
	}
	out.WriteString(text[copied:])
	return out.String()
}

// replaceAt is replaceText for patterns of at most n letters: f gets the letters from the position on (up to n, fewer
// at the end of the text) and returns how many letters it matched.
func replaceAt(text string, n int, first func(rune) bool, f func(out *strings.Builder, w []rune) int) string {
	return replaceText(text, first, func(out *strings.Builder, rest string) int {
		var w [8]rune
		var size [8]int
		k := 0
		for j := 0; k < n && j < len(rest); k++ {
			w[k], size[k] = utf8.DecodeRuneInString(rest[j:])
			j += size[k]
		}
		m := f(out, w[:k])
		bytes := 0
		for _, s := range size[:m] {
			bytes += s
		}
		return bytes
	})
}

// isJSSpace is \s of JS regexes (WhiteSpace and LineTerminator), \s of Go is ASCII only.
func isJSSpace(r rune) bool {
	switch r {
	case '\t', '\n', '\v', '\f', '\r', ' ', 0xA0, 0x1680, 0x2028, 0x2029, 0x202F, 0x205F, 0x3000, 0xFEFF:
		return true
	}
	return r >= 0x2000 && r <= 0x200A
}

// jsSpaceClass is the inside of a regexp character class for \s of JS.
const jsSpaceClass = `\t\n\v\f\r \x{A0}\x{1680}\x{2000}-\x{200A}\x{2028}\x{2029}\x{202F}\x{205F}\x{3000}\x{FEFF}`

// Case mappings of String.prototype.toLowerCase / toUpperCase, from the tables of case_gen.go (the JS engine's,
// rather than the Unicode version of Go): a dense table for the first code points, a sorted search for the rest.

const denseCase = 0x2000

var lowerDense, upperDense [denseCase]rune

type casePair struct{ from, to rune }

var lowerSparse, upperSparse []casePair

func init() {
	for _, t := range []struct {
		pairs   []rune
		special map[rune]string
		dense   *[denseCase]rune
		sparse  *[]casePair
	}{{lowerPairs, lowerSpecial, &lowerDense, &lowerSparse}, {upperPairs, upperSpecial, &upperDense, &upperSparse}} {
		for i := 0; i+1 < len(t.pairs); i += 2 {
			if t.pairs[i] < denseCase {
				t.dense[t.pairs[i]] = t.pairs[i+1]
			} else {
				*t.sparse = append(*t.sparse, casePair{t.pairs[i], t.pairs[i+1]})
			}
		}
		for r := range t.special {
			if r < denseCase {
				t.dense[r] = specialCase
			}
		}
	}
}

// specialCase marks a letter of the dense tables that maps to more than one code point (lowerSpecial, upperSpecial)
const specialCase = -1

// writeCase writes the mapping of r (not ASCII)
func writeCase(out *strings.Builder, r rune, dense *[denseCase]rune, sparse []casePair, special map[rune]string) {
	if r < denseCase {
		switch m := dense[r]; m {
		case 0:
			out.WriteRune(r)
		case specialCase:
			out.WriteString(special[r])
		default:
			out.WriteRune(m)
		}
		return
	}
	if m, ok := special[r]; ok {
		out.WriteString(m)
		return
	}
	i := sort.Search(len(sparse), func(i int) bool { return sparse[i].from >= r })
	if i < len(sparse) && sparse[i].from == r {
		out.WriteRune(sparse[i].to)
	} else {
		out.WriteRune(r)
	}
}

func inRanges(r rune, ranges []rune) bool {
	i := sort.Search(len(ranges)/2, func(i int) bool { return ranges[2*i+1] >= r })
	return i < len(ranges)/2 && ranges[2*i] <= r
}

// jsLower is String.prototype.toLowerCase.
func jsLower(s string) string {
	i := 0
	for i < len(s) && s[i] < utf8.RuneSelf && (s[i] < 'A' || s[i] > 'Z') {
		i++
	}
	if i == len(s) {
		return s
	}
	var out strings.Builder
	out.Grow(len(s) + 8)
	out.WriteString(s[:i])
	for i < len(s) {
		if c := s[i]; c < utf8.RuneSelf {
			if c >= 'A' && c <= 'Z' {
				c += 'a' - 'A'
			}
			out.WriteByte(c)
			i++
			continue
		}
		r, size := utf8.DecodeRuneInString(s[i:])
		switch {
		case r == 0x03A3: // Σ: final sigma ς at the end of a word
			if finalSigma(s, i, size) {
				out.WriteRune(0x03C2)
			} else {
				out.WriteRune(0x03C3)
			}
		case r == utf8.RuneError && size == 1:
			out.WriteByte(s[i])
		default:
			writeCase(&out, r, &lowerDense, lowerSparse, lowerSpecial)
		}
		i += size
	}
	return out.String()
}

// finalSigma is the Final_Sigma condition of toLowerCase (as ICU checks it: a case-ignorable letter is skipped even
// when it is also cased): Σ after a cased letter and not before one, skipping the case-ignorable letters.
func finalSigma(s string, i, size int) bool {
	cased := func(r rune) (stop, isCased bool) {
		if inRanges(r, caseIgnorableRanges) {
			return false, false
		}
		return true, inRanges(r, casedRanges)
	}
	after := false
	for j := i + size; j < len(s); {
		r, n := utf8.DecodeRuneInString(s[j:])
		if stop, c := cased(r); stop {
			after = c
			break
		}
		j += n
	}
	if after {
		return false
	}
	for j := i; j > 0; {
		r, n := utf8.DecodeLastRuneInString(s[:j])
		if stop, c := cased(r); stop {
			return c
		}
		j -= n
	}
	return false
}

// jsUpper is String.prototype.toUpperCase.
func jsUpper(s string) string {
	var out strings.Builder
	out.Grow(len(s) + 8)
	for _, r := range s {
		writeUpper(&out, r)
	}
	return out.String()
}

func writeUpper(out *strings.Builder, r rune) {
	if r < utf8.RuneSelf {
		if r >= 'a' && r <= 'z' {
			r -= 'a' - 'A'
		}
		out.WriteByte(byte(r))
		return
	}
	writeCase(out, r, &upperDense, upperSparse, upperSpecial)
}

// upperBMP upper cases as JS does a string matched by \S without the u flag: a letter outside the BMP is matched as
// its high surrogate alone, which has no upper case.
func upperBMP(s string) string {
	var out strings.Builder
	out.Grow(len(s) + 8)
	for _, r := range s {
		if r > 0xFFFF {
			out.WriteRune(r)
		} else {
			writeUpper(&out, r)
		}
	}
	return out.String()
}
