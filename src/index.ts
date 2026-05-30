'use strict';
import vscode from 'vscode';
import path from 'path';
import { getConfiguration } from './utils/get-configuration';
import readHtml from './utils/read-html';
import { saveImage } from './core/save-image';

const getConfig = () => {
  const editorSettings = getConfiguration('editor', ['fontLigatures', 'tabSize']);
  const editor = vscode.window.activeTextEditor;
  if (editor) editorSettings.tabSize = editor.options.tabSize;

  const extensionConfig = getConfiguration('shotly', [
    // Output
    'shutterAction',
    'shutterSound',
    'target',

    // Appearance
    'backgroundColor',
    'boxShadow',
    'containerPadding',
    'roundedCorners',
    'transparentBackground',
    'watermark',

    // Window / UI
    'showWindowControls',
    'showWindowTitle',
    'showLineNumbers',
    'realLineNumbers',
  ]);

  const selection = editor && editor.selection;
  const startLine = extensionConfig.realLineNumbers ? (selection ? selection.start.line : 0) : 0;

  let windowTitle = '';
  if (editor && extensionConfig.showWindowTitle) {
    const activeFileName = editor.document.uri.path.split('/').pop();
    windowTitle = `${vscode.workspace.name ?? ''} - ${activeFileName}`.trim().replace(/^-\s*/, '');
  }

  return {
    ...editorSettings,
    ...extensionConfig,
    startLine,
    windowTitle
  };
};

const createPanel = async (context: vscode.ExtensionContext): Promise<vscode.WebviewPanel> => {
  const panel = vscode.window.createWebviewPanel(
    'shotly',
    'Shotly 📸',
    { viewColumn: vscode.ViewColumn.Beside, preserveFocus: true },
    {
      enableScripts: true,
      localResourceRoots: [vscode.Uri.file(context.extensionPath)]
    }
  );

  const shutterSoundUri = panel.webview.asWebviewUri(
    vscode.Uri.joinPath(context.extensionUri, 'assets', 'audio', 'shutter.mp3')
  );

  panel.webview.html = await readHtml(
    path.resolve(context.extensionPath, 'webview/index.html'),
    panel,
    shutterSoundUri
  );

  return panel;
};


const hasOneSelection = (selections: readonly vscode.Selection[]): boolean =>
  selections.length === 1 && !selections[0].isEmpty;

const runCommand = async (context: vscode.ExtensionContext) => {
  const panel = await createPanel(context);
  const activeEditor = vscode.window.visibleTextEditors.find(
    e => e.viewColumn !== vscode.ViewColumn.Beside
  );

  if (!activeEditor) {
    vscode.window.showErrorMessage('Shotly 📸: No active text editor found.');
    return;
  }

  const saveIconUri = panel.webview.asWebviewUri(
    vscode.Uri.joinPath(context.extensionUri, 'assets', 'img', 'save.png')
  );
  const copyIconUri = panel.webview.asWebviewUri(
    vscode.Uri.joinPath(context.extensionUri, 'assets', 'img', 'copy.png')
  );

  const update = async () => {
    await vscode.commands.executeCommand('editor.action.clipboardCopyWithSyntaxHighlightingAction');
    panel.webview.postMessage({
      type: 'update',
      saveIconUri: saveIconUri.toString(),
      copyIconUri: copyIconUri.toString(),
      ...getConfig()
    });
  };

  const flash = () => panel.webview.postMessage({ type: 'flash' });

  panel.webview.onDidReceiveMessage(async ({ type, data }) => {
    if (type === 'save') {
      flash();
      await saveImage(data, activeEditor);
    } else {
      vscode.window.showErrorMessage(`Shotly 📸: Unknown shutterAction "${type}"`);
    }
  });

  const selectionHandler = vscode.window.onDidChangeTextEditorSelection(
    (e) => hasOneSelection(e.selections) && update()
  );

  panel.onDidDispose(() => selectionHandler.dispose());

  const editor = vscode.window.activeTextEditor;
  if (editor && hasOneSelection(editor.selections)) update();
};

module.exports.activate = (context: vscode.ExtensionContext) =>
  context.subscriptions.push(
    vscode.commands.registerCommand('shotly.start', () => runCommand(context))
  );
