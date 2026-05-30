import * as vscode from "vscode";

export const getConfiguration = (group: string, keys: string[]): Record<string, unknown> => {
    const settings = vscode.workspace.getConfiguration(group, null);
    const editor = vscode.window.activeTextEditor;
    const language = editor?.document?.languageId;
    const languageSettings = language
        ? vscode.workspace.getConfiguration(undefined, null).get<Record<string, unknown>>(`[${language}]`)
        : undefined;

    return keys.reduce<Record<string, unknown>>((acc, k) => {
        acc[k] = languageSettings?.[`${group}.${k}`];
        if (acc[k] == null) acc[k] = settings.get(k);
        return acc;
    }, {});
};