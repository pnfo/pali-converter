package paliconverter

import (
	"strings"
	"testing"
)

// The tests of converter.test.js, for the Go port.

const (
	roSentence    = "Evaṃ me sutaṃ – ekaṃ samayaṃ bhagavā antarā ca rājagahaṃ antarā ca nāḷandaṃ addhānamaggappaṭipanno hoti mahatā bhikkhusaṅghena saddhiṃ pañcamattehi bhikkhusatehi."
	thaiSentence  = "เอว\u0E4D เม สุต\u0E4D – เอก\u0E4D สมย\u0E4D ภควา อนฺตรา จ ราชคห\u0E4D อนฺตรา จ นาฬนฺท\u0E4D อทฺธานมคฺคปฺปฏ\u0E34ปนฺโน โหต\u0E34 มหตา ภ\u0E34กฺขุสงฺเฆน สทฺธ\u0E36 ปญฺจมตฺเตห\u0E34 ภ\u0E34กฺขุสเตห\u0E34."
	mySentence    = "ဧဝံ မေ သုတံ – ဧကံ သမယံ ဘဂဝ\u102B အန\u1039တရ\u102C စ ရ\u102Cဇဂဟံ အန\u1039တရ\u102C စ န\u102Cဠန\u1039ဒံ အဒ\u1039ဓ\u102Bနမဂ\u1039ဂပ\u1039ပဋိပန\u1039နေ\u102C ဟေ\u102Cတိ မဟတ\u102C ဘိက\u1039ခုသံဃေန သဒ\u1039ဓိံ ပဉ\u1039စမတ\u1039တေဟိ ဘိက\u1039ခုသတေဟိ."
	siSentence    = "එවං මෙ සුතං – එකං සම\u0DBAං භගව\u0DCF අන\u0DCAත\u0DBB\u0DCF ච \u0DBB\u0DCFජගහං අන\u0DCAත\u0DBB\u0DCF ච න\u0DCFළන\u0DCAදං අද\u0DCAධ\u0DCFනමග\u0DCAගප\u0DCAපටිපන\u0DCAනො හොති මහත\u0DCF භික\u0DCAඛුසඞ\u0DCAඝෙන සද\u0DCAධිං පඤ\u0DCAචමත\u0DCAතෙහි භික\u0DCAඛුසතෙහි."
	mixedSentence = "එවං මෙ සුතං – ဧကံ သမယံ ဘဂဝ\u102B အန\u1039တရ\u102C စ ရ\u102Cဇဂဟံ အန\u1039တရ\u102C စ นาฬนฺท\u0E4D อทฺธานมคฺคปฺปฏ\u0E34ปนฺโน โหต\u0E34 มหตา ภ\u0E34กฺขุสงฺเฆน สทฺธ\u0E36 pañcamattehi bhikkhusatehi."
)

func eq(t *testing.T, got, want string) {
	t.Helper()
	if got != want {
		t.Errorf("\n got %q\nwant %q", got, want)
	}
}

func TestSingleWord(t *testing.T) {
	eq(t, Convert("janaka", Sinh, Latn), "ජනක")
	eq(t, ConvertMixed("janaka", Sinh), "ජනක")
	eq(t, Convert("නි\u0DBB\u0DCAව\u0DCFන", Latn, Sinh), "Nirvāna")
	eq(t, ConvertMixed("නි\u0DBB\u0DCAව\u0DCFන", Latn), "Nirvāna")
}

func TestSentence(t *testing.T) {
	eq(t, Convert(roSentence, Thai, Latn), thaiSentence)
	eq(t, ConvertMixed(roSentence, Thai), thaiSentence)
	eq(t, Convert(thaiSentence, Mymr, Thai), mySentence)
	eq(t, ConvertMixed(thaiSentence, Mymr), mySentence)
	eq(t, Convert(mySentence, Sinh, Mymr), siSentence)
	eq(t, ConvertMixed(mySentence, Sinh), siSentence)
}

func TestMixed(t *testing.T) {
	eq(t, ConvertMixed(mixedSentence, Thai), thaiSentence)
	eq(t, ConvertMixed(mixedSentence, Latn), roSentence)
	eq(t, ConvertMixed(mixedSentence, Mymr), mySentence)
	eq(t, ConvertMixed(mixedSentence, Sinh), siSentence)
}

func TestCheckRomanConvert(t *testing.T) {
	// alPlusIndeptVowel
	if !CheckRomanConvert("සල\u0DCAඋ\u0DBAනෙ") { // sinhala word with al+indeptvowel
		t.Error("සල\u0DCAඋ\u0DBAනෙ")
	}
	if CheckRomanConvert("සල\u0DCA උ\u0DBAනෙ") { // normal
		t.Error("සල\u0DCA උ\u0DBAනෙ")
	}
	eq(t, Convert("සල\u0DCAඋ\u0DBAනෙ", Latn, Sinh), "Saluyane")
	eq(t, Convert("Saluyane", Sinh, Latn), "සලු\u0DBAනෙ") // note we are getting a different word
	// aspiratedHalPlusH
	if CheckRomanConvert("‘ස\u0DBBි\u0DBAබ\u0DCA\u0DBB\u0DCAහ\u0DCAමි") { // ra not aspirated
		t.Error("‘ස\u0DBBි\u0DBAබ\u0DCA\u0DBB\u0DCAහ\u0DCAමි")
	}
	if !CheckRomanConvert("‘ස\u0DBBි\u0DBAබ\u0DCAක\u0DCAහ\u0DCAමි") { // ka is aspirated
		t.Error("‘ස\u0DBBි\u0DBAබ\u0DCAක\u0DCAහ\u0DCAමි")
	}
	eq(t, Convert("‘ස\u0DBBි\u0DBAබ\u0DCAක\u0DCAහ\u0DCAමි", Latn, Sinh), "‘Sariyabkhmi")
	eq(t, Convert("‘Sariyabkhmi", Sinh, Latn), "‘ස\u0DBBි\u0DBAබ\u0DCAඛ\u0DCAමි") // note we are getting a different word
}

func TestCheckUnconverted(t *testing.T) {
	if !CheckUnconverted(Convert("ඇලුම\u0DCAඇති", Latn, Sinh)) { // has non pali vowels which will not be converted
		t.Error("ඇලුම\u0DCAඇති")
	}
	if CheckUnconverted(Convert("පස\u0DCAදෙනෙක\u0DCA", Latn, Sinh)) {
		t.Error("පස\u0DCAදෙනෙක\u0DCA")
	}
}

// pali has no diphthongs - roman 'ai' 'au' are two vowels, as written in the VRI devanagari text (सउद्देसं)
func TestVowelPairs(t *testing.T) {
	const words = "sauddesaṃ naubhayabyābādhāya puttaiccādito"
	expected := map[string]string{
		Sinh: "සඋද\u0DCAදෙසං නඋභ\u0DBAබ\u0DCA\u200D\u0DBA\u0DCFබ\u0DCFධ\u0DCF\u0DBA පුත\u0DCAතඉච\u0DCAච\u0DCFදිතො",
		Deva: "सउद्देसं नउभयब्याबाधाय पुत्तइच्चादितो",
		Thai: "สอุทฺเทส\u0E4D นอุภยพฺยาพาธาย ปุตฺตอ\u0E34จฺจาท\u0E34โต",
		Mymr: "သဥဒ\u1039ဒေသံ နဥဘယဗျ\u102Cဗ\u102Cဓ\u102Cယ ပုတ\u1039တဣစ\u1039စ\u102Cဒိတေ\u102C",
		Khmr: "សឧទ\u17D2ទេស\u17C6 នឧភយព\u17D2យាពាធាយ បុត\u17D2តឥច\u17D2ចាទ\u17B7តោ",
	}
	for script, text := range expected { // roman to other scripts
		eq(t, Convert(words, script, Latn), text)
		eq(t, ConvertMixed(words, script), text)
	}
	for script, text := range expected { // round trip through roman
		eq(t, Convert(Convert(text, Latn, script), script, Latn), text)
	}
	// at the start of a word
	eq(t, Convert("aiccā", Sinh, Latn), "අඉච\u0DCAච\u0DCF")
	eq(t, Convert("Auddhacca", Deva, Latn), "अउद्धच्च")
	for _, script := range ScriptCodes() { // no "undefined" in any script
		if out := Convert(words, script, Latn); strings.Contains(out, "undefined") {
			t.Errorf("%s: %s", script, out)
		}
	}
	// sanskrit diphthongs still convert to roman
	eq(t, Convert("කෛල\u0DCFස", Latn, Sinh), "Kailāsa")
	eq(t, Convert("कौशल", Latn, Deva), "Kauśala")
}

func TestMissingLetters(t *testing.T) { // are left unconverted, not "undefined"
	thai := Convert("කෛල\u0DCFස", Thai, Sinh)
	if strings.Contains(thai, "undefined") || !CheckUnconverted(thai) {
		t.Error(thai)
	}
}

// script fixes (checked against the VRI editions and Myanmar printed Pali)
func TestScriptFixes(t *testing.T) {
	roundTrip := func(w, s string) string { return jsLower(Convert(Convert(w, s, Latn), Latn, s)) }
	words := []string{"brahmajālasuttaṃ", "tassa", "saṅgho", "arahato", "appā", "bhikkhave", "dhammaṃ", "sīlakkhandhavaggapāḷi", "paribbājakakathā", "majjhimasīlaṃ"}
	t.Run("myanmar tall aa after ပ\u1039ပ ပ\u1039ဖ ဂ\u1039ဃ", func(t *testing.T) {
		eq(t, Convert("appā", Mymr, Latn), "အပ\u1039ပ\u102B")
		eq(t, Convert("papphāsa", Mymr, Latn), "ပပ\u1039ဖ\u102Bသ")
		eq(t, Convert("agghā", Mymr, Latn), "အဂ\u1039ဃ\u102B")
		eq(t, Convert("sikkhā sampā", Mymr, Latn), "သိက\u1039ခ\u102C သမ\u1039ပ\u102C") // unchanged
	})
	t.Run("thai as in the Siam Rath edition: iṃ \u0E36, e/o before ห ว ร ย น ล ม clusters", func(t *testing.T) {
		eq(t, Convert("saddhiṃ kiṃ", Thai, Latn), "สทฺธ\u0E36 ก\u0E36")
		eq(t, Convert("dve tumhe anveti tresu", Thai, Latn), "เทฺว ตุเมฺห อเนฺวต\u0E34 เตฺรสุ")
		eq(t, Convert("sallakkhetvā bhikkhave", Thai, Latn), "สลฺลกฺเขตฺวา ภ\u0E34กฺขเว") // unchanged
		for _, w := range []string{"dve", "tumhe", "anveti", "tveva", "tresu", "saddhiṃ"} {
			eq(t, roundTrip(w, Thai), w)
		}
	})
	t.Run("myanmar as in Myanmar Pali texts: tall aa after ဝှ, the Sangha with niggahita", func(t *testing.T) {
		eq(t, Convert("jivhā mantavho", Mymr, Latn), "ဇိဝှ\u102B မန\u1039တဝှေ\u102B")
		eq(t, Convert("bhikkhusaṅghena saṅghāṭiṃ saṅghātaṃ", Mymr, Latn), "ဘိက\u1039ခုသံဃေန သင\u103A\u1039ဃ\u102Cဋိံ သင\u103A\u1039ဃ\u102Cတံ")
	})
	t.Run("tibetan tsheg between syllables", func(t *testing.T) {
		eq(t, Convert("namo attanā", Tibt, Latn), "ན\u0F0Bམོ ཨ\u0F0Bཏྟ\u0F0Bནཱ")
		eq(t, Convert("majjhima", Tibt, Latn), "མ\u0F0B\u0F5B\u0F84\u0F5Cི\u0F0Bམ") // jjha: explicit halant
	})
	t.Run("tamil letters with superscripts", func(t *testing.T) {
		eq(t, Convert("dhammaṃ bhikkhave buddho", Taml, Latn), "த⁴\u0BAE\u0BCD\u0BAE\u0BAE\u0BCD பி⁴\u0B95\u0BCD\u0B95²வே பு³த\u0BCD³தோ⁴")
		eq(t, Convert("dīghanikāyo vandana", Taml, Latn), "தீ³\u0B95⁴னி\u0B95\u0BBEயோ வந\u0BCDத³ன")
		eq(t, ConvertMixed("த⁴\u0BAE\u0BCD\u0BAE\u0BAE\u0BCD", Latn), "Dhammaṃ")
		eq(t, Convert("அ\u0BAE\u0BCD\u0BB9\u0BBE\u0B95\u0BAE\u0BCD ஸ\u0BAE\u0BCDபு³த\u0BCD³த⁴", Latn, Taml), "Amhākaṃ sambuddha")
	})
	t.Run("converting back from tibetan, assamese, tai tham, chakma, tamil", func(t *testing.T) {
		for _, s := range []string{Tibt, Asse, Lana, Cakm, Taml, Mymr} {
			for _, w := range words {
				eq(t, roundTrip(w, s), w)
			}
		}
	})
}

// Go API
func TestAPI(t *testing.T) {
	if len(ScriptCodes()) != 22 || len(Scripts()) != 22 {
		t.Fatal(len(ScriptCodes()), len(Scripts()))
	}
	for _, s := range []string{"sinh", "SINH", "Latn", "bali"} {
		if !IsScript(s) {
			t.Error(s)
		}
	}
	for _, s := range []string{"", "xx", "sinhala", "ro"} {
		if IsScript(s) {
			t.Error(s)
		}
	}
	for code, want := range map[int]string{'a': Latn, 'ක': Sinh, 0x0BAE: Taml, 0xD804: Cakm, 0xDC13: Brah, 0x2074: ""} {
		if got := ScriptForCode(code); got != want {
			t.Errorf("%x: %q, want %q", code, got, want)
		}
	}
	eq(t, Convert("", Sinh, Latn), "")
	eq(t, Convert("dhamma", "xx", Latn), "ධම\u0DCAම") // unknown target script: Sinhala, as in JS
}

func TestJSCase(t *testing.T) {
	eq(t, jsLower("ΟΔΟΣ ΟΔΟΣ. Σ ΑΣ́Β"), "οδος οδος. σ ασ́β") // final sigma, a lone sigma, a case-ignorable mark
	eq(t, jsLower("İSTANBUL"), "i̇stanbul")
	eq(t, jsUpper("straße ŉ ﬁ"), "STRASSE ʼN FI")
	eq(t, upperBMP("<w>a\U00010428"), "<W>A\U00010428")
}
