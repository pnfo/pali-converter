// node v8.mjs - ms per page in V8 for each script (see main.go), printed as JSON
import fs from 'node:fs'
import zlib from 'node:zlib'
import { convert, Script } from '../index.js'

const page = zlib.gunzipSync(fs.readFileSync(new URL('../testdata/corpus.txt.gz', import.meta.url))).toString('utf8').split('\n').slice(3, 216)
const run = script => {
    const start = process.hrtime.bigint()
    for (const p of page) convert(p, script, Script.LATN)
    return Number(process.hrtime.bigint() - start) / 1e6
}
const result = {}
for (const script of Object.values(Script).filter(s => s !== Script.LATN)) {
    for (let i = 0; i < 20; i++) run(script) // warm up (JIT)
    const times = []
    for (let total = 0; total < 1000 || times.length < 5;) {
        const t = run(script)
        times.push(t)
        total += t
    }
    times.sort((a, b) => a - b)
    result[script] = times[times.length >> 1]
}
console.log(JSON.stringify(result))
