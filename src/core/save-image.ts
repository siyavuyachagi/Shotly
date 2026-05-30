import vscode from 'vscode';
import path from 'path';
import { mkdir, writeFile } from 'fs/promises';
import { homedir } from 'os';
import { generateFileName } from './generate-file-name';

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
export const saveImage = async (data: string, editor: vscode.TextEditor): Promise<void> => {
    const configuredDir = vscode.workspace.getConfiguration('shotly').get<string>('outDir');
    const saveMode = vscode.workspace.getConfiguration('shotly').get<string>('saveMode');

    const resolveOutDir = (dir: string | undefined): string => {
        if (!dir?.trim()) return path.join(homedir(), 'Pictures', 'Shotly');
        if (dir.startsWith('~')) return path.join(homedir(), dir.slice(1));
        if (path.isAbsolute(dir)) return dir;
        return path.join(homedir(), dir); // relative → anchored to home
    };
    const outDir = resolveOutDir(configuredDir);

    await mkdir(outDir, { recursive: true });

    if (saveMode === 'auto') {
        const filePath = path.resolve(outDir, generateFileName(editor));
        await writeFile(filePath, Buffer.from(data, 'base64'));
        vscode.window.showInformationMessage(`Shotly 📸: Saved to ${filePath}`);
        return;
    }

    const defaultUri = vscode.Uri.file(
        path.resolve(outDir, generateFileName(editor))
    );

    const uri = await vscode.window.showSaveDialog({
        filters: { Images: ['png'] },
        defaultUri
    });

    if (uri) {
        await mkdir(path.dirname(uri.fsPath), { recursive: true });
        await writeFile(uri.fsPath, Buffer.from(data, 'base64'));
    }
};