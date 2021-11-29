import data from './components/data.json'
import Table from './components/table'


function init(){
    const table = Table(data);

    document.querySelector('body').appendChild(table)

    const div = document.getElementById('content')
    div.textContent = 'Bla bla bla!!!';
}

init()