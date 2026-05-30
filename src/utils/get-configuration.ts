import * as vscode from "vscode";

/**
 * Retrieves a set of configuration values for a given settings group,
 * @param group  The configuration namespace to read from (e.g. `"shotly"`).
 * @param keys  The setting keys to resolve within that namespace.
 * @returns  A record mapping each key to its resolved value, or `undefined`
 *  if neither a language override nor a global value is set.
 */
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