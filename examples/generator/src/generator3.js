export function* GetGenerator(){
    for (let i=0; i < 10; i++){
        yield `${this.name} ${i+1}`
    }
}