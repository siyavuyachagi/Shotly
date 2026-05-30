'use strict';

import { $, setVar } from './utils.js';
import { pasteCode } from './code.js';
import { takeSnap, copySnap, cameraFlashAnimation } from './snap.js';

const navbarNode = $('#navbar');
const windowControlsNode = $('#window-controls');
const windowTitleNode = $('#window-title');
const watermarkNode = document.querySelector('#watermark');

const btnSave = $('#save');
const btnCopy = $('#copy');

let config;

btnSave.addEventListener('click', () => takeSnap(config));
btnCopy.addEventListener('click', () => copySnap(config));

document.addEventListener('paste', (e) => pasteCode(config, e.clipboardData));

window.addEventListener('message', ({ data: { type, saveIconUri, copyIconUri, ...cfg } }) => {
  if (type === 'update') {
    config = cfg;

    if (saveIconUri) document.querySelector('#save img').src = saveIconUri;
    if (copyIconUri) document.querySelector('#copy img').src = copyIconUri;
    
    const {
      fontLigatures,
      tabSize,
      backgroundColor,
      boxShadow,
      containerPadding,
      roundedCorners,
      showWindowControls,
      showWindowTitle,
      windowTitle,
      watermark
    } = config;

    setVar('ligatures', fontLigatures ? 'normal' : 'none');
    if (typeof fontLigatures === 'string') setVar('font-features', fontLigatures);
    setVar('tab-size', tabSize);
    setVar('container-background-color', backgroundColor);
    setVar('box-shadow', boxShadow);
    setVar('container-padding', containerPadding);
    setVar('window-border-radius', roundedCorners ? '4px' : 0);

    navbarNode.hidden = !showWindowControls && !showWindowTitle && !watermark;
    windowControlsNode.hidden = !showWindowControls;

    windowTitleNode.hidden = !showWindowTitle;
    windowTitleNode.textContent = windowTitle;
    
    if (watermarkNode) watermarkNode.textContent = watermark || '';

    document.execCommand('paste');
  } else if (type === 'flash') {
    cameraFlashAnimation();
  }
});
