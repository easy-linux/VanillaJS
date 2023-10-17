import init from "./generator5.js";

const dataHub = init();

const output = document.querySelector(".output");

const getData = async (query) => {
  const data = await dataHub.getData(query);
  if (data) {
    data.forEach((row) => {
      const div = document.createElement("div");
      div.className = "row";

      div.innerHTML = Object.entries(row)
        .map(([key, value]) => {
          if(typeof(value) !== 'object'){
            return `<div class="col">${value}</div>`;
          }
          return ''
        })
        .join("");

      output.appendChild(div);
    });
  }
};

document.querySelector(".buttons").addEventListener("click",  (e) => {
  if(e.target.hasAttribute('data')){
    output.innerHTML = '';
    const data = e.target.getAttribute('data')
    if(data === 'stop'){
      dataHub.stop()
    } else if(data === 'error'){
      dataHub.error()
    } else{
      getData(data)
    }
  }
  e.stopPropagation()
});
