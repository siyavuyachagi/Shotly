"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_1 = __importDefault(require("vscode"));
const get_configuration_1 = require("./utils/get-configuration");
const save_image_1 = require("./core/save-image");
const create_panel_1 = require("./core/create-panel");
const getConfig = () => {
    const editorSettings = (0, get_configuration_1.getConfiguration)('editor', ['fontLigatures', 'tabSize']);
    const editor = vscode_1.default.window.activeTextEditor;
    if (editor)
        editorSettings.tabSize = editor.options.tabSize;
    const extensionConfig = (0, get_configuration_1.getConfiguration)('shotly', [
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
        windowTitle = `${vscode_1.default.workspace.name || ''} - ${activeFileName}`.trim().replace(/^-\s*/, '');
    }
    return {
        ...editorSettings,
        ...extensionConfig,
        startLine,
        windowTitle
    };
};
const hasOneSelection = (selections) => selections.length === 1 && !selections[0].isEmpty;
const runCommand = async (context) => {
    const panel = await (0, create_panel_1.createPanel)(context);
    const activeEditor = vscode_1.default.window.visibleTextEditors.find(e => e.viewColumn !== vscode_1.default.ViewColumn.Beside);
    if (!activeEditor) {
        vscode_1.default.window.showErrorMessage('Shotly 📸: No active text editor found.');
        return;
    }
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
            await (0, save_image_1.saveImage)(data, activeEditor);
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