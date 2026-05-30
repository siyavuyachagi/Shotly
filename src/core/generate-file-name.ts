import vscode from 'vscode';
import path from 'path';

/**
 * Generates a filename for the screenshot based on the active editor's file name.
 * Converts PascalCase and snake_case to kebab-case.
 * @example `UserService.ts` → `user-service.png`
 * @example `user_service.ts` → `user-service.png`
 * @example `userservice.ts` → `userservice.png`
 */
export const generateFileName = (editor: vscode.TextEditor): string => {
    const sourceFile = editor
        ? path.basename(editor.document.uri.fsPath, path.extname(editor.document.uri.fsPath))
            .replace(/([a-z])([A-Z])/gu, '$1-$2')
            .replace(/_/gu, '-')
            .toLowerCase()
        : 'code';
    return `${sourceFile}.png`;
};