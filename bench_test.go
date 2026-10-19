package paliconverter

import (
	"compress/gzip"
	"io"
	"os"
	"strings"
	"testing"
)

// BenchmarkPage converts a page: the 213 paragraphs of the Brahmajālasutta (DN 1, 74 KB of Roman text), one
// Convert call each, as server side rendering does.
//
//	go test -run XXX -bench Page -benchmem
func BenchmarkPage(b *testing.B) {
	page := BenchPage(b)
	size := 0
	for _, p := range page {
		size += len(p)
	}
	for _, s := range []string{Sinh, Deva, Thai, Mymr, Khmr, Taml, Tibt, Lana, Brah} {
		b.Run(s, func(b *testing.B) {
			b.SetBytes(int64(size))
			for i := 0; i < b.N; i++ {
				for _, p := range page {
					Convert(p, s, Latn)
				}
			}
		})
	}
}

// BenchPage returns the paragraphs of DN 1 from testdata/corpus.txt.gz (lines 3-215).
func BenchPage(tb testing.TB) []string {
	f, err := os.Open("testdata/corpus.txt.gz")
	if err != nil {
		tb.Fatal(err)
	}
	defer f.Close()
	gz, err := gzip.NewReader(f)
	if err != nil {
		tb.Fatal(err)
	}
	all, err := io.ReadAll(gz)
	if err != nil {
		tb.Fatal(err)
	}
	return strings.Split(string(all), "\n")[3:216]
}
