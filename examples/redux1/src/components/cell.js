import store from '../redux/store'
import { CHANGE_CELL } from '../redux/actions'

class Cell {
    constructor(cellData, editable){
        this.cellData = cellData
        this.editable = editable
        this.cell = document.createElement('div')
        this.cell.style.padding = '10px'
        this.cell.textContent = this.cellData.data
        this.cell.style.border = "1px solid #CCC"
        this.cell.style.width = '25%'
        if(this.editable){
            this.cell.setAttribute('contenteditable','true');
            this.cell.addEventListener('input', this.onChange)
        }
        store.subscribe(this.onStateChanged)
    }

    selectorCellData = (state) => {
        const user = state.find(user => user.id === this.cellData.id)
        return user
    }

    onStateChanged = () => {
        const state = store.getState()
        if(state){
           const user = this.selectorCellData(state)
           if(this.cellData.data !== user[this.cellData.key]){
            this.cellData.data = user[this.cellData.key]
            this.cell.textContent = this.cellData.data
           }
        }
    }

    onChange = (e) => {
        const newValue = e.target.textContent
        store.dispatch({
            type: CHANGE_CELL,
            payload: {
                ...this.cellData,
                data: newValue
            }
        })
    }


    get element(){
        return this.cell
    }
    
}

export default Cell