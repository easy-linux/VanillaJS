

const doStep = (textArray) => {
  let counter = 0
  while (textArray.length > 0 && counter < 10) {
    const idx = Math.floor(Math.random() * textArray.length);
    document.querySelector("#textblock").value = document.querySelector("#textblock").value + textArray.splice(idx, 1)[0]
    counter++
  }
  if(textArray.length){
    setTimeout(()=>doStep(textArray))
  } else {
    console.log('done!')
  }
  console.log(textArray.length)
}

const onClick = () => {
    const text = document.querySelector("#textblock").value;
    const textArray = [...text];

    document.querySelector("#textblock").value = ''
    setTimeout(()=>doStep(textArray))
};

document.querySelector("#btn").addEventListener("click", onClick);