import Row from './row'


class Table {

    constructor (tableData, editable){
        this.tableData = tableData
        this.editable = editable
        this.draggingElement = null
        this.table = document.createElement('div')
        this.table.style.padding = '10px'
        this.table.style.minWidth = '400px'
        this.table.style.border = "1px solid #CCC"

        this.tableData.forEach(rowData => {
            const row = new Row(rowData, this.editable)
            row.subscribeOnDragStart(this.onDragStart)
            row.subscribeOnDrop(this.onDrop)
            row.subscribeOnDragOver(this.onDragOver)
            this.table.appendChild(row.element) 
        });
    }
    
    get element() {
        return this.table
    }

    onDragStart = (element) => {
        console.log('onDragStart')
        this.draggingElement = element
    }

    onDrop = (element) => {
        console.log('onDrop')
        const target = element
        const source = this.draggingElement
        target.parentElement.insertBefore(source, target.nextSibling)
        this.draggingElement = null
    }

   onDragOver = (e) => {
       e.preventDefault()
       return false;
   }

}

export default Table