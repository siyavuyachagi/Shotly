"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPanel = void 0;
const vscode_1 = __importDefault(require("vscode"));
const read_html_1 = __importDefault(require("../utils/read-html"));
const path_1 = __importDefault(require("path"));
const createPanel = async (context) => {
    const panel = vscode_1.default.window.createWebviewPanel('shotly', 'Shotly 📸', { viewColumn: vscode_1.default.ViewColumn.Beside, preserveFocus: true }, {
        enableScripts: true,
        localResourceRoots: [vscode_1.default.Uri.file(context.extensionPath)]
    });
    const shutterSoundUri = panel.webview.asWebviewUri(vscode_1.default.Uri.joinPath(context.extensionUri, 'assets', 'audio', 'shutter.mp3'));
    panel.webview.html = await (0, read_html_1.default)(path_1.default.resolve(context.extensionPath, 'webview/index.html'), panel, shutterSoundUri);
    return panel;
};
exports.createPanel = createPanel;
//# sourceMappingURL=create-panel.js.map