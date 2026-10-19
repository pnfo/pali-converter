// Loads index.js in a vm context and returns its internal tables (not exported by the module) along with its exports.
// Used by gen-go.mjs (the Go tables) - index.js stays the source of truth.
import fs from 'node:fs'
import vm from 'node:vm'

export function loadConverter(file = new URL('../index.js', import.meta.url)) {
    const src = fs.readFileSync(file, 'utf8').replace(/^export\s+(const|function|class|let|var)\s/gm, '$1 ')
    if (/^\s*(import|export)\s/m.test(src)) throw new Error('unexpected module syntax in index.js')
    const names = ['Script', 'PaliScriptInfo', 'script_index', 'specials', 'consos', 'vowels', 'ML_TA', 'TA_ML', 'TAMIL_SUP',
        'IV_TO_DV', 'romanDiphthongs', 'convert']
    const ctx = vm.createContext({ console })
    return vm.runInContext(`${src}\n;({ ${names.join(', ')} })`, ctx, { filename: 'index.js' })
}
