import Row from './row'


const Table = (tableData) => {
    const table = document.createElement('div')
    table.style.padding = '10px'
    table.style.border = "1px solid #CCC"

    tableData.forEach(row => {
       table.appendChild(Row(row)) 
    });

    return table
}

export default Table