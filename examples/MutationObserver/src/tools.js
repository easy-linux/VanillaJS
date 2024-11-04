const drawCanvas = ({ canvas, context, bgColor, textColor, textSize, textFont }) => {
  // Очищаем canvas и применяем фоновый цвет
  context.fillStyle = bgColor;
  context.fillRect(0, 0, canvas.width, canvas.height);

  // Настраиваем текстовый стиль и цвет
  context.font = `${textSize} ${textFont}`;
  context.fillStyle = textColor;

  // Отрисовываем текст
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillText("Привет мир!", canvas.width / 2, canvas.height / 2);
};

export const changeCanvas = ({ canvas, context, div }) => {
  if (canvas && div) {
    console.log("Вызов changeCanvas");
    const divWidth = div.clientWidth;
    const divHeight = div.clientHeight;

    // Устанавливаем размеры canvas такие же, как у div
    canvas.width = divWidth;
    canvas.height = divHeight;

    // Извлекаем стили и сохраняем стили для текста
    const computedStyle = window.getComputedStyle(div);
    const bgColor = computedStyle.backgroundColor;
    const textColor = computedStyle.color;
    const textSize = computedStyle.fontSize;
    const textFont = computedStyle.fontFamily;

    drawCanvas({ canvas, context, div, bgColor, textColor, textSize, textFont });
  }
};
