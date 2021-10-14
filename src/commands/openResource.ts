import { Uri, window, workspace } from 'vscode';

/**
 * Open resource in the editor
 * @param uri target Uri to open
 */
export async function openResource(uri: Uri): Promise<void> {
	return await workspace.openTextDocument(uri).then(document => {
		if (document) {
			window.showTextDocument(document);
		}
	},
	error => window.showErrorMessage(`Error loading document: ${error}`));
}