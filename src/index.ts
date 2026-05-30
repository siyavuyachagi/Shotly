'use strict';

import vscode from 'vscode';
import path from 'path';
import { homedir } from 'os';
import { getSettings } from './utils/getSettings';
import readHtml from './utils/readHtml';
import { mkdir, writeFile } from "fs/promises";

const getConfig = () => {
  const editorSettings = getSettings('editor', ['fontLigatures', 'tabSize']);
  const editor = vscode.window.activeTextEditor;
  if (editor) editorSettings.tabSize = editor.options.tabSize;

  const extensionSettings = getSettings('shotly', [
    'backgroundColor',
    'boxShadow',
    'containerPadding',
    'roundedCorners',
    'showWindowControls',
    'showWindowTitle',
    'showLineNumbers',
    'realLineNumbers',
    'transparentBackground',
    'target',
    'shutterAction'
  ]);

  const selection = editor && editor.selection;
  const startLine = extensionSettings.realLineNumbers ? (selection ? selection.start.line : 0) : 0;

  let windowTitle = '';
  if (editor && extensionSettings.showWindowTitle) {
    const activeFileName = editor.document.uri.path.split('/').pop();
    windowTitle = `${vscode.workspace.name} - ${activeFileName}`;
  }

  return {
    ...editorSettings,
    ...extensionSettings,
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
  
  console.log('Shutter sound URI:', shutterSoundUri.toString());

  panel.webview.html = await readHtml(
    path.resolve(context.extensionPath, 'webview/index.html'),
    panel,
    shutterSoundUri
  );

  return panel;
};

const generateFileName = (editor: vscode.TextEditor | undefined): string => {
  const sourceFile = editor
    ? path.basename(editor.document.uri.fsPath, path.extname(editor.document.uri.fsPath))
      .replace(/([a-z])([A-Z])/gu, '$1-$2')
      .replace(/_/gu, '-')
      .toLowerCase()
    : 'code';
  return `${sourceFile}.png`;
};

let lastUsedDirectory = path.resolve(homedir(), 'Pictures/Shotly');
const saveImage = async (data: string, editor: vscode.TextEditor | undefined): Promise<void> => {
  const defaultUri = vscode.Uri.file(
    path.resolve(lastUsedDirectory, generateFileName(editor))
  );

  const uri = await vscode.window.showSaveDialog({
    filters: { Images: ['png'] },
    defaultUri
  });

  if (uri) {
    lastUsedDirectory = path.dirname(uri.fsPath);
    await mkdir(lastUsedDirectory, { recursive: true });
    await writeFile(uri.fsPath, Buffer.from(data, 'base64'));
  }
};


const hasOneSelection = (selections: readonly vscode.Selection[]): boolean =>
  selections.length === 1 && !selections[0].isEmpty;

const runCommand = async (context: vscode.ExtensionContext) => {
  const activeEditor = vscode.window.activeTextEditor;
  const panel = await createPanel(context);

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
