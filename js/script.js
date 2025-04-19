const outputContainer = document.getElementById("output");
const history = [];
let lastCopiedIndex = null;
let draggedIndex = null;

function convertBearing() {
  const ns = document.getElementById("nsSelect").value;
  const ew = document.getElementById("ewSelect").value;
  const deg = parseInt(document.getElementById("deg").value) || 0;
  const min = parseInt(document.getElementById("min").value) || 0;
  const sec = parseInt(document.getElementById("sec").value) || 0;

  if (deg > 90 || min >= 60 || sec >= 60 || deg < 0 || min < 0 || sec < 0) {
    outputContainer.innerHTML = `<div class="output-line"><span class="output-text">Invalid input values.</span></div>`;
    return;
  }

  const angle = deg + min / 60 + sec / 3600;
  let azimuth;
  if (ns === 'N' && ew === 'E') azimuth = angle;
  else if (ns === 'S' && ew === 'E') azimuth = 180 - angle;
  else if (ns === 'S' && ew === 'W') azimuth = 180 + angle;
  else if (ns === 'N' && ew === 'W') azimuth = 360 - angle;
  else {
    outputContainer.innerHTML = `<div class="output-line"><span class="output-text">Invalid direction combination.</span></div>`;
    return;
  }

  const bearingStr = `${ns}${deg}°${min}'${sec}"${ew}`;
  const azimuthStr = `${azimuth.toFixed(6)}°`;
  const index = history.length;

  const resultHTML = {
    bearingStr: bearingStr,
    azimuthStr: azimuthStr
  };

  history.unshift(resultHTML);
  renderHistory();
}

function renderHistory() {
  outputContainer.innerHTML = history.map((item, index) => `
    <div class="output-line" data-index="${index}" draggable="true" 
         ondragstart="dragStart(event, ${index})" 
         ondragover="dragOver(event)" ondrop="drop(event)">
      <span class="output-text">${item.bearingStr} → ${item.azimuthStr}</span>
      <div>
        <button class="copy-btn" id="copy-btn-${index}" onclick="copyToClipboard('${item.azimuthStr.replace('Azimuth: ', '').replace('°', '')}', ${index})">Copy</button>
        <button class="remove-btn" onclick="removeEntry(${index})">×</button>
      </div>
    </div>
  `).join('');
}

function copyToClipboard(text, index) {
  navigator.clipboard.writeText(text).then(() => {
    const copyButtons = document.querySelectorAll('.copy-btn');
    copyButtons.forEach(button => button.textContent = 'Copy');

    const copiedButton = document.getElementById(`copy-btn-${index}`);
    if (copiedButton) {
      copiedButton.textContent = 'Copied';
    }
  });
}

function dragStart(event, index) {
  draggedIndex = index;
  event.dataTransfer.setData('text', event.target.innerHTML);
}

function dragOver(event) {
  event.preventDefault();
}

function drop(event) {
  event.preventDefault();
  const target = event.target.closest('.output-line');
  const targetIndex = target ? parseInt(target.dataset.index) : -1;
  if (draggedIndex !== targetIndex && targetIndex !== -1) {
    const [draggedItem] = history.splice(draggedIndex, 1);
    history.splice(targetIndex, 0, draggedItem);
    renderHistory();
  }
}

function exportToCSV() {
  const csvContent = "data:text/csv;charset=utf-8,Bearing,Azimuth\n" +
    history.map(item => `${item.bearingStr.replace('°', '')},${item.azimuthStr.replace('°', '').replace('Azimuth: ', '')}`).join("\n");
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', 'bearing_to_azimuth_history.csv');
  document.body.appendChild(link);
  link.click();
}

function removeEntry(index) {
  history.splice(index, 1);
  renderHistory();
}

function calculateOffset() {
  const calculatedAzimuth = parseFloat(document.getElementById("calculatedAzimuth").value);
  const surveyNs = document.getElementById("surveyNsSelect").value;
  const surveyEw = document.getElementById("surveyEwSelect").value;
  const surveyDeg = parseInt(document.getElementById("surveyBearingDeg").value) || 0;
  const surveyMin = parseInt(document.getElementById("surveyBearingMin").value) || 0;
  const surveySec = parseInt(document.getElementById("surveyBearingSec").value) || 0;

  if (isNaN(calculatedAzimuth) || calculatedAzimuth < 0 || calculatedAzimuth > 360) {
    document.getElementById("offsetOutput").textContent = "Invalid calculated azimuth.";
    return;
  }

  if (surveyDeg > 90 || surveyMin >= 60 || surveySec >= 60 || surveyDeg < 0 || surveyMin < 0 || surveySec < 0) {
    document.getElementById("offsetOutput").textContent = "Invalid survey bearing values.";
    return;
  }

  const surveyAngle = surveyDeg + surveyMin / 60 + surveySec / 3600;
  let surveyAzimuth;
  if (surveyNs === 'N' && surveyEw === 'E') surveyAzimuth = surveyAngle;
  else if (surveyNs === 'S' && surveyEw === 'E') surveyAzimuth = 180 - surveyAngle;
  else if (surveyNs === 'S' && surveyEw === 'W') surveyAzimuth = 180 + surveyAngle;
  else if (surveyNs === 'N' && surveyEw === 'W') surveyAzimuth = 360 - surveyAngle;

  const offsetAzimuth = Math.abs(calculatedAzimuth - surveyAzimuth).toFixed(6);
  document.getElementById("offsetOutput").textContent = `Offset Azimuth: ${offsetAzimuth}°`;
}