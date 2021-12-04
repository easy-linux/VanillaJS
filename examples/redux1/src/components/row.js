import Cell from './cell'


class Row {

    constructor (rowData, editable){
        this.rowData = rowData
        this.editable = editable
        this.row = document.createElement('div')
        this.row.style.display = 'flex'
        this.row.style.justifyContent = 'space-between'
        this.row.draggable = true;

        Object.keys(rowData).forEach(key => {
            if(key !== 'id'){
                const d = rowData[key]
                const cell = new Cell({
                    id: rowData.id, 
                    key, 
                    data: d
                }, this.editable)
                this.row.appendChild(cell.element) 
            }
            
        });
    }

    subscribeOnDragStart(handler){
        this.row.addEventListener('dragstart', () => handler(this.element))
    }

    subscribeOnDrop(handler){
        this.row.addEventListener('drop', () => handler(this.element))
    }

    subscribeOnDragOver(handler){
        this.row.addEventListener('dragover', handler)
    }
    
    get element(){
        return this.row
    }
}

export default Row