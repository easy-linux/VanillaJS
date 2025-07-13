document.addEventListener('DOMContentLoaded', function() {
  debugger
  const startBtn = document.getElementById('startBtn');
  const stopBtn = document.getElementById('stopBtn');
  const status = document.getElementById('status');
  const aggressiveness = document.getElementById('aggressiveness');
  const aggressivenessValue = document.getElementById('aggressivenessValue');
  const avoidDistance = document.getElementById('avoidDistance');
  const attackDistance = document.getElementById('attackDistance');
  const reactionSpeed = document.getElementById('reactionSpeed');
  const reactionSpeedValue = document.getElementById('reactionSpeedValue');

  // Обновление значений слайдеров
  aggressiveness.addEventListener('input', function() {
    aggressivenessValue.textContent = this.value;
  });

  reactionSpeed.addEventListener('input', function() {
    reactionSpeedValue.textContent = this.value;
  });

  // Загрузка сохраненных настроек
  chrome.storage.sync.get([
    'aggressiveness',
    'avoidDistance',
    'reactionSpeed',
    'attackDistance'
  ], function(result) {
    if (result.aggressiveness !== undefined) {
      aggressiveness.value = result.aggressiveness;
      aggressivenessValue.textContent = result.aggressiveness;
    }
    if (result.avoidDistance !== undefined) {
      avoidDistance.value = result.avoidDistance;
    }
    if (result.reactionSpeed !== undefined) {
      reactionSpeed.value = result.reactionSpeed;
      reactionSpeedValue.textContent = result.reactionSpeed;
    }
    if (result.attackDistance !== undefined) {
      attackDistance.value = result.attackDistance;
    } 
  });

  // Проверка статуса бота
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    chrome.tabs.sendMessage(tabs[0].id, {action: 'getStatus'}, function(response) {
      if (response && response.active) {
        updateUI(true);
      }
    });
  });

  // Обработчики кнопок
  startBtn.addEventListener('click', function() {
    // Сохраняем настройки
    chrome.storage.sync.set({
      aggressiveness: parseInt(aggressiveness.value),
      avoidDistance: parseInt(avoidDistance.value),
      reactionSpeed: parseInt(reactionSpeed.value),
      attackDistance: parseInt(attackDistance.value)
    });

    // Запускаем бота
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {
        action: 'start',
        settings: {
          aggressiveness: parseInt(aggressiveness.value),
          avoidDistance: parseInt(avoidDistance.value),
          reactionSpeed: parseInt(reactionSpeed.value),
          attackDistance: parseInt(attackDistance.value)
        }
      }, function(response) {
        if (response && response.success) {
          updateUI(true);
        }
      });
    });
  });

  stopBtn.addEventListener('click', function() {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {action: 'stop'}, function(response) {
        if (response && response.success) {
          updateUI(false);
        }
      });
    });
  });

  function updateUI(isActive) {
    if (isActive) {
      status.textContent = 'Бот активен';
      status.className = 'status active';
      startBtn.style.display = 'none';
      stopBtn.style.display = 'block';
    } else {
      status.textContent = 'Бот остановлен';
      status.className = 'status inactive';
      startBtn.style.display = 'block';
      stopBtn.style.display = 'none';
    }
  }
});