import {GetGenerator} from './generator1.js'

export function* ManyGenerators(){
    yield* GetGenerator('AAAAA 1')
    yield* GetGenerator('BBBBB 2')
    yield* GetGenerator('CCCCC 3')
}