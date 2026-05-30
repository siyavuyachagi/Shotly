"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateFileName = void 0;
const path_1 = __importDefault(require("path"));
/**
 * Generates a filename for the screenshot based on the active editor's file name.
 * Converts PascalCase and snake_case to kebab-case.
 * @example `UserService.ts` → `user-service.png`
 * @example `user_service.ts` → `user-service.png`
 * @example `userservice.ts` → `userservice.png`
 */
const generateFileName = (editor) => {
    const sourceFile = editor
        ? path_1.default.basename(editor.document.uri.fsPath, path_1.default.extname(editor.document.uri.fsPath))
            .replace(/([a-z])([A-Z])/gu, '$1-$2')
            .replace(/_/gu, '-')
            .toLowerCase()
        : 'code';
    return `${sourceFile}.png`;
};
exports.generateFileName = generateFileName;
//# sourceMappingURL=generate-file-name.js.map