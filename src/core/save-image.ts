import vscode from 'vscode';
import path from 'path';
import { mkdir, writeFile } from 'fs/promises';
import { homedir } from 'os';
import { generateFileName } from './generate-file-name';


export const saveImage = async (data: string, editor: vscode.TextEditor): Promise<void> => {
    const configuredDir = vscode.workspace.getConfiguration('shotly').get<string>('outDir');
    const saveMode = vscode.workspace.getConfiguration('shotly').get<string>('saveMode');
    const outDir = configuredDir?.trim()
        ? configuredDir
        : path.join(homedir(), 'Pictures', 'Shotly');

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