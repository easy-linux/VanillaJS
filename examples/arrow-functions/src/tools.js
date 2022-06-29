export const printToDiv = (data) => {
    const rootDiv = document.getElementById('content')
    const div = document.createElement('div')
    div.textContent = `${data}`
    if(rootDiv){
        rootDiv.appendChild(div)
    }
}

export default {
    printToDiv
}