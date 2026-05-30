'use strict';
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_1 = __importDefault(require("vscode"));
const path_1 = __importDefault(require("path"));
const os_1 = require("os");
const getSettings_1 = require("./utils/getSettings");
const readHtml_1 = __importDefault(require("./utils/readHtml"));
const promises_1 = require("fs/promises");
const getConfig = () => {
    const editorSettings = (0, getSettings_1.getSettings)('editor', ['fontLigatures', 'tabSize']);
    const editor = vscode_1.default.window.activeTextEditor;
    if (editor)
        editorSettings.tabSize = editor.options.tabSize;
    const extensionSettings = (0, getSettings_1.getSettings)('shotly', [
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
        'shutterAction',
        'shutterSound'
    ]);
    const selection = editor && editor.selection;
    const startLine = extensionSettings.realLineNumbers ? (selection ? selection.start.line : 0) : 0;
    let windowTitle = '';
    if (editor && extensionSettings.showWindowTitle) {
        const activeFileName = editor.document.uri.path.split('/').pop();
        windowTitle = `${vscode_1.default.workspace.name} - ${activeFileName}`;
    }
    return {
        ...editorSettings,
        ...extensionSettings,
        startLine,
        windowTitle
    };
};
const createPanel = async (context) => {
    const panel = vscode_1.default.window.createWebviewPanel('shotly', 'Shotly 📸', { viewColumn: vscode_1.default.ViewColumn.Beside, preserveFocus: true }, {
        enableScripts: true,
        localResourceRoots: [vscode_1.default.Uri.file(context.extensionPath)]
    });
    const shutterSoundUri = panel.webview.asWebviewUri(vscode_1.default.Uri.joinPath(context.extensionUri, 'assets', 'audio', 'shutter.mp3'));
    console.log('Shutter sound URI:', shutterSoundUri.toString());
    panel.webview.html = await (0, readHtml_1.default)(path_1.default.resolve(context.extensionPath, 'webview/index.html'), panel, shutterSoundUri);
    return panel;
};
const generateFileName = (editor) => {
    const sourceFile = editor
        ? path_1.default.basename(editor.document.uri.fsPath, path_1.default.extname(editor.document.uri.fsPath))
            .replace(/([a-z])([A-Z])/gu, '$1-$2')
            .replace(/_/gu, '-')
            .toLowerCase()
        : 'code';
    return `${sourceFile}.png`;
};
const saveImage = async (data, editor) => {
    const configuredDir = vscode_1.default.workspace.getConfiguration('shotly').get('outDir');
    const outDir = configuredDir?.trim()
        ? configuredDir
        : path_1.default.join((0, os_1.homedir)(), 'Pictures', 'Shotly');
    await (0, promises_1.mkdir)(outDir, { recursive: true });
    const defaultUri = vscode_1.default.Uri.file(path_1.default.resolve(outDir, generateFileName(editor)));
    const uri = await vscode_1.default.window.showSaveDialog({
        filters: { Images: ['png'] },
        defaultUri
    });
    if (uri) {
        await (0, promises_1.mkdir)(path_1.default.dirname(uri.fsPath), { recursive: true });
        await (0, promises_1.writeFile)(uri.fsPath, Buffer.from(data, 'base64'));
    }
};
const hasOneSelection = (selections) => selections.length === 1 && !selections[0].isEmpty;
const runCommand = async (context) => {
    const activeEditor = vscode_1.default.window.activeTextEditor;
    const panel = await createPanel(context);
    const saveIconUri = panel.webview.asWebviewUri(vscode_1.default.Uri.joinPath(context.extensionUri, 'assets', 'img', 'save.png'));
    const copyIconUri = panel.webview.asWebviewUri(vscode_1.default.Uri.joinPath(context.extensionUri, 'assets', 'img', 'copy.png'));
    const update = async () => {
        await vscode_1.default.commands.executeCommand('editor.action.clipboardCopyWithSyntaxHighlightingAction');
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
        }
        else {
            vscode_1.default.window.showErrorMessage(`Shotly 📸: Unknown shutterAction "${type}"`);
        }
    });
    const selectionHandler = vscode_1.default.window.onDidChangeTextEditorSelection((e) => hasOneSelection(e.selections) && update());
    panel.onDidDispose(() => selectionHandler.dispose());
    const editor = vscode_1.default.window.activeTextEditor;
    if (editor && hasOneSelection(editor.selections))
        update();
};
module.exports.activate = (context) => context.subscriptions.push(vscode_1.default.commands.registerCommand('shotly.start', () => runCommand(context)));
//# sourceMappingURL=index.js.map