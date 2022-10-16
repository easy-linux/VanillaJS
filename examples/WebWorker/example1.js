
const worker = new Worker('webworker.js')

const defaultText = document.querySelector("#textblock").value

worker.onmessage = (e) => {
  if(e?.data){
    const { type, result } = e.data
    if(type === 'result'){
      document.querySelector("#textblock").value = result
      console.timeEnd('worker')
    }
  }
}

const onClickLocal = () => {
  document.querySelector("#textblock").value = defaultText
    console.time('local')
    const text = document.querySelector("#textblock").value;
    const longText = [...Array(5)].map(()=>text).join('')
    const textArray = [...longText];
    let result = "";
    while (textArray.length > 0) {
      const idx = Math.floor(Math.random() * textArray.length);
      result = result + textArray.splice(idx, 1)[0];
    }
    document.querySelector("#textblock").value = result
    console.timeEnd('local')
};

const onClickWorker = () => {
  document.querySelector("#textblock").value = defaultText
  console.time('worker')
  const text = document.querySelector("#textblock").value;
  const longText = [...Array(5)].map(()=>text).join('')
  worker.postMessage({text: longText})
};

document.querySelector("#btn1").addEventListener("click", onClickLocal);
document.querySelector("#btn2").addEventListener("click", onClickWorker);