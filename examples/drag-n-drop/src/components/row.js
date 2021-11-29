import Cell from './cell'

let DraggingElement = null

function onDragStart(e){
    console.log('onDragStart')
    DraggingElement = this
}

function onDrop(e){
    console.log('onDrop')
    const target = this
    const source = DraggingElement
    target.parentElement.insertBefore(source, target.nextSibling)
}

function onDragOver(e){
    e.preventDefault()
    return false;
}



const Row = (rowData) => {
    const row = document.createElement('div')
    row.style.display = 'flex'
    row.style.justifyContent = 'space-between'
    row.draggable = true;

    Object.keys(rowData).forEach(key => {
        const d = rowData[key]
        row.appendChild(Cell(d)) 
    });
    row.addEventListener('dragstart', onDragStart)
    row.addEventListener('drop', onDrop)
    row.addEventListener('dragover', onDragOver)
    return row
}

export default Row