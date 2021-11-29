const Cell = (data) => {
    const cell = document.createElement('div')
    cell.style.padding = '10px'
    cell.textContent = data
    cell.style.border = "1px solid #CCC"
    cell.style.width = '25%'
    return cell
}

export default Cell