

const onClick = () => {
    const text = document.querySelector("#textblock").value;
    const textArray = [...text];

    document.querySelector("#textblock").value = ''
    while (textArray.length > 0) {
      const idx = Math.floor(Math.random() * textArray.length);
      document.querySelector("#textblock").value = document.querySelector("#textblock").value + textArray.splice(idx, 1)[0]
    }

};

document.querySelector("#btn").addEventListener("click", onClick);