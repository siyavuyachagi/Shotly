"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.saveImage = void 0;
const vscode_1 = __importDefault(require("vscode"));
const path_1 = __importDefault(require("path"));
const promises_1 = require("fs/promises");
const os_1 = require("os");
const generate_file_name_1 = require("./generate-file-name");
const saveImage = async (data, editor) => {
    const configuredDir = vscode_1.default.workspace.getConfiguration('shotly').get('outDir');
    const saveMode = vscode_1.default.workspace.getConfiguration('shotly').get('saveMode');
    const outDir = configuredDir?.trim()
        ? configuredDir
        : path_1.default.join((0, os_1.homedir)(), 'Pictures', 'Shotly');
    await (0, promises_1.mkdir)(outDir, { recursive: true });
    if (saveMode === 'auto') {
        const filePath = path_1.default.resolve(outDir, (0, generate_file_name_1.generateFileName)(editor));
        await (0, promises_1.writeFile)(filePath, Buffer.from(data, 'base64'));
        vscode_1.default.window.showInformationMessage(`Shotly 📸: Saved to ${filePath}`);
        return;
    }
    const defaultUri = vscode_1.default.Uri.file(path_1.default.resolve(outDir, (0, generate_file_name_1.generateFileName)(editor)));
    const uri = await vscode_1.default.window.showSaveDialog({
        filters: { Images: ['png'] },
        defaultUri
    });
    if (uri) {
        await (0, promises_1.mkdir)(path_1.default.dirname(uri.fsPath), { recursive: true });
        await (0, promises_1.writeFile)(uri.fsPath, Buffer.from(data, 'base64'));
    }
};
exports.saveImage = saveImage;
//# sourceMappingURL=save-image.js.map