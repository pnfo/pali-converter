// Command bench compares the speed of the converter in goja (the JS in a Go JavaScript interpreter), V8 (node) and
// the Go port, on a page: the 213 paragraphs of the Brahmajālasutta (DN 1, 74 KB of Roman text), one convert call
// per paragraph, as server side rendering does.
//
//	cd bench && go run .          (needs node for V8)
package main

import (
	"compress/gzip"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"os"
	"os/exec"
	"regexp"
	"runtime"
	"sort"
	"strings"
	"sync"
	"time"

	"github.com/dop251/goja"
	paliconverter "github.com/pnfo/pali-converter"
)

type engine struct {
	name    string
	convert func(text, to string) string
}

func main() {
	page := loadPage()
	size := 0
	for _, p := range page {
		size += len(p)
	}
	var scripts []string
	for _, s := range paliconverter.ScriptCodes() {
		if s != paliconverter.Latn {
			scripts = append(scripts, s)
		}
	}
	fmt.Printf("page: %d paragraphs, %d KB; %s %s/%s, %d CPUs\n\n", len(page), size/1024, runtime.Version(), runtime.GOOS, runtime.GOARCH, runtime.NumCPU())

	native := engine{"go", func(text, to string) string { return paliconverter.Convert(text, to, paliconverter.Latn) }}
	gojaEngine := newGoja()
	for _, s := range scripts { // same outputs
		for _, p := range page {
			if a, b := native.convert(p, s), gojaEngine.convert(p, s); a != b {
				log.Fatalf("%s: go and goja differ on %q:\n%q\n%q", s, p, a, b)
			}
		}
	}

	v8 := runV8()
	results := map[string]map[string]float64{"go": {}, "goja": {}, "v8": v8}
	for _, e := range []engine{native, gojaEngine} {
		for _, s := range scripts {
			results[e.name][s] = msPerPage(e, s, page)
		}
	}

	fmt.Println("ms per page, one thread")
	fmt.Println()
	fmt.Println("| script | goja | V8 (node) | Go | goja / Go | V8 / Go |")
	fmt.Println("|---|---:|---:|---:|---:|---:|")
	var sum = map[string]float64{}
	for _, s := range scripts {
		g, v, n := results["goja"][s], results["v8"][s], results["go"][s]
		sum["goja"] += g
		sum["v8"] += v
		sum["go"] += n
		fmt.Printf("| %s | %.1f | %.2f | %.2f | %.0f× | %.1f× |\n", s, g, v, n, g/n, v/n)
	}
	k := float64(len(scripts))
	fmt.Printf("| **mean** | **%.1f** | **%.2f** | **%.2f** | **%.0f×** | **%.1f×** |\n", sum["goja"]/k, sum["v8"]/k, sum["go"]/k, sum["goja"]/sum["go"], sum["v8"]/sum["go"])

	fmt.Println()
	fmt.Println("pages per second, all CPUs (every script in turn)")
	fmt.Println()
	fmt.Printf("| goja | Go |\n|---:|---:|\n| %.0f | %.0f |\n", pagesPerSecond(gojaEngine, scripts, page), pagesPerSecond(native, scripts, page))
}

func loadPage() []string {
	f, err := os.Open("../testdata/corpus.txt.gz")
	if err != nil {
		log.Fatal(err)
	}
	defer f.Close()
	gz, err := gzip.NewReader(f)
	if err != nil {
		log.Fatal(err)
	}
	all, err := io.ReadAll(gz)
	if err != nil {
		log.Fatal(err)
	}
	return strings.Split(string(all), "\n")[3:216]
}

// msPerPage: warm up, then the median of runs for at least a second
func msPerPage(e engine, script string, page []string) float64 {
	run := func() time.Duration {
		start := time.Now()
		for _, p := range page {
			e.convert(p, script)
		}
		return time.Since(start)
	}
	for i := 0; i < 3; i++ {
		run()
	}
	var times []time.Duration
	for total := time.Duration(0); total < time.Second || len(times) < 5; {
		d := run()
		times = append(times, d)
		total += d
	}
	sort.Slice(times, func(i, j int) bool { return times[i] < times[j] })
	return float64(times[len(times)/2].Microseconds()) / 1000
}

func pagesPerSecond(e engine, scripts []string, page []string) float64 {
	var n int64
	var mu sync.Mutex
	deadline := time.Now().Add(3 * time.Second)
	var wg sync.WaitGroup
	start := time.Now()
	for w := 0; w < runtime.NumCPU(); w++ {
		wg.Add(1)
		go func(w int) {
			defer wg.Done()
			for i := w; time.Now().Before(deadline); i++ {
				for _, p := range page {
					e.convert(p, scripts[i%len(scripts)])
				}
				mu.Lock()
				n++
				mu.Unlock()
			}
		}(w)
	}
	wg.Wait()
	return float64(n) / time.Since(start).Seconds()
}

// newGoja runs index.js in goja as tipitaka.app did before the Go port: a pool of runtimes, convert exported to a
// Go func.
func newGoja() engine {
	src, err := os.ReadFile("../index.js")
	if err != nil {
		log.Fatal(err)
	}
	js := regexp.MustCompile(`(?m)^export\s+(const|function|class|let|var)\s`).ReplaceAllString(string(src), "$1 ")
	program, err := goja.Compile("index.js", js+"\n;({ convert })", true)
	if err != nil {
		log.Fatal(err)
	}
	pool := sync.Pool{New: func() any {
		vm := goja.New()
		console := vm.NewObject()
		for _, m := range []string{"log", "warn", "error", "info", "debug", "assert"} {
			console.Set(m, func(goja.FunctionCall) goja.Value { return goja.Undefined() })
		}
		vm.Set("console", console)
		v, err := vm.RunProgram(program)
		if err != nil {
			log.Fatal(err)
		}
		var fn func(text, to, from string) string
		if err := vm.ExportTo(v.ToObject(vm).Get("convert"), &fn); err != nil {
			log.Fatal(err)
		}
		return fn
	}}
	return engine{"goja", func(text, to string) string {
		fn := pool.Get().(func(text, to, from string) string)
		defer pool.Put(fn)
		return fn(text, to, "latn")
	}}
}

// runV8 runs v8.mjs (the same page in node) and returns ms per page for each script
func runV8() map[string]float64 {
	out, err := exec.Command("node", "v8.mjs").Output()
	if err != nil {
		log.Fatalf("node v8.mjs: %v", err)
	}
	var r map[string]float64
	if err := json.Unmarshal(out, &r); err != nil {
		log.Fatal(err)
	}
	return r
}
