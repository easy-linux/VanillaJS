function answer(data) {
  postMessage(data);
}

const calculate = (data) => {
  if (data?.text) {
    const textArray = [...data.text];
    let result = "";
    while (textArray.length > 0) {
      const idx = Math.floor(Math.random() * textArray.length);
      result = result + textArray.splice(idx, 1)[0];
    }
    answer({ type: "result", result });
    return 
  }
  answer({ type: "defailt", result: data });
};

onmessage = (event) => {
  if (event?.data) {
    calculate(event.data);
  } else {
    answer({ type: "defailt", result: event });
  }
};
