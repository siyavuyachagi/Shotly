import { $, $$, redraw, once, setVar } from './utils.js';
import domtoimage from 'dom-to-image-even-more';

const vscode = acquireVsCodeApi();
const windowNode = $('#window');
const snippetContainerNode = $('#snippet-container');

const flashFx = $('#flash-fx');

const SNAP_SCALE = 2;

export const cameraFlashAnimation = async () => {
  flashFx.style.display = 'block';
  redraw(flashFx);
  flashFx.style.opacity = '0';
  await once(flashFx, 'transitionend');
  flashFx.style.display = 'none';
  flashFx.style.opacity = '1';
};

/**
 * Plays the shutter sound effect if enabled in config.
 * @param {object} config - The Shotly configuration object
 */
const playShutterSound = (config) => {
  const sound = document.querySelector('#shutter-sound');
  if (sound && config.shutterSound !== false) {
    sound.currentTime = 0;
    sound.play().catch(() => {});
  }
};

const captureImage = async (config) => {
  windowNode.style.resize = 'none';
  if (config.transparentBackground || config.target === 'window') {
    setVar('container-background-color', 'transparent');
  }

  const target = config.target === 'container' ? snippetContainerNode : windowNode;

  const url = await domtoimage.toPng(target, {
    bgColor: 'transparent',
    scale: SNAP_SCALE,
    postProcess: (node) => {
      $$('#snippet-container, #snippet, .line, .line-code span', node).forEach(
        (span) => (span.style.width = 'unset')
      );
      $$('.line-code', node).forEach((span) => (span.style.width = '100%'));
    }
  });

  windowNode.style.resize = 'horizontal';
  setVar('container-background-color', config.backgroundColor);

  return url.slice(url.indexOf(',') + 1);
};

export const takeSnap = async (config) => {
  playShutterSound(config);
  const data = await captureImage(config);
  vscode.postMessage({ type: config.shutterAction, data });
};

export const copySnap = async (config) => {
  const data = await captureImage(config);
  const binary = atob(data);
  const array = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) array[i] = binary.charCodeAt(i);
  const blob = new Blob([array], { type: 'image/png' });
  await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
  cameraFlashAnimation();
};
