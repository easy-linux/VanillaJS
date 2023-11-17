let intervalId


const addClock = () => {
console.log('addClock')
    let overlay = document.querySelector('.easyIt-ext')
    if (!overlay) {
        overlay = document.createElement('div')
        overlay.setAttribute('class', 'easyIt-ext')
    }

    overlay.innerHTML = `
         <div class="easyIt-data"></div>
    `

    const style = document.createElement('style')
    style.textContent = `
       .easyIt-ext{
        position: fixed;
        top: 0;
        bottom: 0;
        left: 0;
        right: 0;
        display: flex;
        justify-content: center;
        align-items: flex-end;
        pointer-events: none;
        background: linear-gradient(0deg, rgba(0,0,0, 0.3) 0%, rgba(0,0,0,0) 100%);
        z-index: 1000;
       }

       .easyIt-data{
          font-size: 50px;
          pointer-events: none;
          color: #fff;
          padding: 50px;
       }
    `
    const body = document.querySelector('body')
    body.appendChild(overlay)
    body.appendChild(style)

    intervalId = setInterval(() => {
        const data = document.querySelector('.easyIt-data')
        if (data) {
            const d = new Date()
            const hours = `${d.getHours()}`
            const mins = `${d.getMinutes()}`
            const secs = `${d.getSeconds()}`

            data.textContent = `${hours.padStart(2, '0')}:${mins.padStart(2, '0')}:${secs.padStart(2, '0')}`
        }
    }, 1000)
}

const removeClock = () => {
    clearInterval(intervalId)
    const content = document.querySelector('.easyIt-ext')
    if (content) {
        content.parentNode.removeChild(content)
    }
}

chrome.storage.sync.get(['showClock'], (result) => {
    if (result.showClock) {
        addClock()
    }
});

chrome.storage.onChanged.addListener((changes, namespace) => {
    if (changes?.showClock) {
        if (changes.showClock.newValue) {
            addClock()
        } else {
            removeClock()
        }
    }
});





