import { createElement, useMemo, createFragment } from "../core/mini-react";
import { html } from "../core/html";

export const Viewer = (props) => {
  const { count } = props;

  const textValue = useMemo(() => {
    if (count % 2 === 0) return "четное";
    return "нечетное";
  }, [count]);

  // с использованием createElement и createFragment
  // return createElement("div", null, 
  //   createFragment([
  //     createElement("h2", null, `Счетчик: ${count}`), 
  //     createElement("h3", null, `Это ${textValue} число`)
  //   ]));

  //  Или с использованием html тега
  return html`<div>
    <h2>Счетчик: ${count}</h2>
    <h3>Это ${textValue} число</h3>
  </div>`;
};
