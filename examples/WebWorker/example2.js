let worker;

const onMessage = (e) => {
  if (e?.data) {
    document.querySelector("#result").textContent = JSON.stringify(e.data, null, 2);
  }
};

const reCreate = () => {
  if (worker) {
    worker.terminate();
  }
  const scriptText = document.querySelector("#textblock").value;
  const blob = new Blob([scriptText], { type: "text/javascript" });
  worker = new Worker(window.URL.createObjectURL(blob));

  worker.onmessage = onMessage;
};

const onClickTodo = () => {
  worker.postMessage({ type: "todo", id: 1 });
};
const onClickUser = () => {
  worker.postMessage({ type: "user", id: 2 });
};
const onClickRecreate = () => {
  reCreate()
};

document.querySelector("#btn1").addEventListener("click", onClickTodo);
document.querySelector("#btn2").addEventListener("click", onClickUser);
document.querySelector("#btn3").addEventListener("click", onClickRecreate);

reCreate()
