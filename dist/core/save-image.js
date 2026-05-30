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
/**
 * Saves a base64-encoded PNG image to disk.
 *
 * Behaviour is controlled by the `shotly.saveMode` setting:
 * - `"auto"` – writes directly to the resolved output directory and shows
 *              an information message with the final path.
 * - `"prompt"` (default) – opens a Save-As dialog pre-filled with the
 *              generated filename, then writes to the user-chosen location.
 *
 * The output directory is resolved from `shotly.outDir`. If that setting is
 * empty or whitespace, it falls back to `~/Pictures/Shotly`.
 * The directory (and any missing parents) is created automatically.
 *
 * @param data   Base64-encoded PNG image data.
 * @param editor The active text editor, used by {@link generateFileName} to
 *               derive a contextual filename.
 */
const saveImage = async (data, editor) => {
    const configuredDir = vscode_1.default.workspace.getConfiguration('shotly').get('outDir');
    const saveMode = vscode_1.default.workspace.getConfiguration('shotly').get('saveMode');
    const resolveOutDir = (dir) => {
        if (!dir?.trim())
            return path_1.default.join((0, os_1.homedir)(), 'Pictures', 'Shotly');
        if (dir.startsWith('~'))
            return path_1.default.join((0, os_1.homedir)(), dir.slice(1));
        if (path_1.default.isAbsolute(dir))
            return dir;
        return path_1.default.join((0, os_1.homedir)(), dir); // relative → anchored to home
    };
    const outDir = resolveOutDir(configuredDir);
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