import data from './data/data.json'
import Table from './components/table'
import store from './redux/store'
import {INIT_STATE} from './redux/actions'

function init(){
    const table = new Table(data, true);
    const table2 = new Table(data, false);
    document.querySelector('#content').appendChild(table.element)
    document.querySelector('#content').appendChild(table2.element)
    store.dispatch({ type: INIT_STATE, payload: data })
}

init()