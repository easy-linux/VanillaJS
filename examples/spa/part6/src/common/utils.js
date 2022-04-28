
const padZero = (str, len) => {
    len = len || 2;
    var zeros = new Array(len).join('0');
    return (zeros + str).slice(-len);
}

export const invertColor = (hex) => {
    if (hex.indexOf('#') === 0) {
        hex = hex.slice(1);
    }
    
    if (hex.length === 3) {
        hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    }
    if (hex.length !== 6) {
        throw new Error('Invalid HEX color.');
    }
    
    var r = (255 - parseInt(hex.slice(0, 2), 16)).toString(16),
        g = (255 - parseInt(hex.slice(2, 4), 16)).toString(16),
        b = (255 - parseInt(hex.slice(4, 6), 16)).toString(16);
    
    return '#' + padZero(r) + padZero(g) + padZero(b);
}

export const randomColor = () => {
    return `#${padZero(Math.floor(Math.random() * 16777215).toString(16), 6)}`
}

export const getUserInitials = (userName) => {
    if (userName) {
        const data = userName.split('.')
        return `${data[0][0]}${data[1][0]}`
    }
    return ''
}

export const dateFormat = (date) => {
    const d = new Date(date)
    return `${padZero(d.getHours(), 2)}:${padZero(d.getMinutes(), 2)} ${padZero(d.getDate(), 2)}.${padZero(d.getMonth() + 1, 2)}.${d.getFullYear()}`
}

export const highlightText = (text = '', search = '') => {
    let result = text
    const s = new RegExp(search, 'ig')
    const foundStr = text.match(s);
    if (foundStr) {
        foundStr.forEach(text => {
            result = result.replaceAll(text, `<span class="highlight">${text}</span>`)
        })
    }
    return result
}

