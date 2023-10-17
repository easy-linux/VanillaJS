export function* GetGenerator(text){
    for (let i=0; i < 10; i++){
        yield `${text} ${i+1}`
    }
}