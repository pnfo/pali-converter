package paliconverter

import (
	"bufio"
	"compress/gzip"
	"encoding/json"
	"fmt"
	"os"
	"sort"
	"strings"
	"testing"
)

// TestGolden checks that the Go port converts exactly as the JS converter, on the outputs of index.js written by
// scripts/gen-golden.mjs (npm run golden).
func TestGolden(t *testing.T) {
	f, err := os.Open("testdata/golden.ndjson.gz")
	if err != nil {
		if os.Getenv("CI") != "" {
			t.Fatal("testdata/golden.ndjson.gz missing: npm run golden")
		}
		t.Skip("testdata/golden.ndjson.gz missing: npm run golden")
	}
	defer f.Close()
	gz, err := gzip.NewReader(f)
	if err != nil {
		t.Fatal(err)
	}
	type rec struct {
		In       string            `json:"in"`
		To       map[string]string `json:"to"`
		Back     map[string]string `json:"back"`
		Mix      string            `json:"mix"`
		Mixed    map[string]string `json:"mixed"`
		Fuzz     *string           `json:"fuzz"`
		From     map[string]string `json:"from"`
		FromSinh map[string]string `json:"fromSinh"`
		ToSinh   map[string]string `json:"toSinh"`
		Beautify map[string]string `json:"beautify"`
		Unknown  map[string]string `json:"unknown"`
	}
	checks, fails := map[string]int{}, map[string]int{}
	check := func(kind, in, got, want string) {
		checks[kind]++
		if got != want {
			if fails[kind]++; fails[kind] <= 5 {
				t.Errorf("%s %q:\n got %q\nwant %q", kind, in, got, want)
			}
		}
	}
	sc := bufio.NewScanner(gz)
	sc.Buffer(make([]byte, 1<<20), 64<<20)
	for sc.Scan() {
		var r rec
		if err := json.Unmarshal(sc.Bytes(), &r); err != nil {
			t.Fatal(err)
		}
		if r.Fuzz == nil {
			for s, want := range r.To {
				check("book latn->"+s, r.In, Convert(r.In, s, Latn), want)
				check("book "+s+"->latn", r.To[s], Convert(r.To[s], Latn, s), r.Back[s])
			}
			for s, want := range r.Mixed {
				check("book mixed->"+s, r.Mix, ConvertMixed(r.Mix, s), want)
			}
			continue
		}
		in := *r.Fuzz
		for s := range r.To {
			check("fuzz latn->"+s, in, Convert(in, s, Latn), r.To[s])
			check("fuzz "+s+"->latn", in, Convert(in, Latn, s), r.From[s])
			check("fuzz sinh->"+s, in, Convert(in, s, Sinh), r.FromSinh[s])
			check("fuzz convertFrom "+s, in, ConvertFrom(in, s), r.ToSinh[s])
		}
		for s, want := range r.Mixed {
			check("fuzz mixed->"+s, in, ConvertMixed(in, s), want)
		}
		for k, want := range r.Beautify {
			s, rend, _ := strings.Cut(k, "/")
			check("fuzz beautify "+k, in, Beautify(in, s, rend), want)
		}
		check("fuzz unknown to", in, Convert(in, "xx", Latn), r.Unknown["to"])
		check("fuzz unknown from", in, Convert(in, Latn, "xx"), r.Unknown["from"])
	}
	if err := sc.Err(); err != nil {
		t.Fatal(err)
	}
	kinds := make([]string, 0, len(checks))
	total := 0
	for k, n := range checks {
		kinds = append(kinds, k)
		total += n
	}
	sort.Strings(kinds)
	var failed []string
	for _, k := range kinds {
		if fails[k] > 0 {
			failed = append(failed, fmt.Sprintf("%s: %d/%d", k, fails[k], checks[k]))
		}
	}
	if len(failed) > 0 {
		t.Errorf("mismatches:\n%s", strings.Join(failed, "\n"))
	}
	t.Logf("%d conversions checked against JS (%d kinds)", total, len(kinds))
}
