/* --------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */

import { NotificationHandler, RequestHandler } from 'vscode-jsonrpc';
import { WorkspaceEdit } from 'vscode-languageserver-types';
import { CM, MessageDirection, ProtocolNotificationType, ProtocolRequestType } from './messages';

/**
 * Options for notifications/requests for user operations on files.
 *
 * @since 3.16.0
 */
export interface FileOperationOptions {

	/**
	* The server is interested in receiving didCreateFiles notifications.
	*/
	didCreate?: FileOperationRegistrationOptions;

	/**
	* The server is interested in receiving willCreateFiles requests.
	*/
	willCreate?: FileOperationRegistrationOptions;

	/**
	* The server is interested in receiving didRenameFiles notifications.
	*/
	didRename?: FileOperationRegistrationOptions;

	/**
	* The server is interested in receiving willRenameFiles requests.
	*/
	willRename?: FileOperationRegistrationOptions;

	/**
	* The server is interested in receiving didDeleteFiles file notifications.
	*/
	didDelete?: FileOperationRegistrationOptions;

	/**
	* The server is interested in receiving willDeleteFiles file requests.
	*/
	willDelete?: FileOperationRegistrationOptions;
}

/**
 * The options to register for file operations.
 *
 * @since 3.16.0
 */
export interface FileOperationRegistrationOptions {

	/**
	 * The actual filters.
	 */
	filters: FileOperationFilter[];
}

/**
 * A pattern kind describing if a glob pattern matches a file a folder or
 * both.
 *
 * @since 3.16.0
 */
export namespace FileOperationPatternKind {

	/**
	 * The pattern matches a file only.
	 */
	export const file: 'file' = 'file';

	/**
	 * The pattern matches a folder only.
	 */
	export const folder: 'folder' = 'folder';
}
export type FileOperationPatternKind = 'file' | 'folder';


/**
 * Matching options for the file operation pattern.
 *
 * @since 3.16.0
 */
export interface FileOperationPatternOptions {

	/**
	 * The pattern should be matched ignoring casing.
	 */
	ignoreCase?: boolean;
}

/**
 * A pattern to describe in which file operation requests or notifications
 * the server is interested in receiving.
 *
 * @since 3.16.0
 */
interface FileOperationPattern {

	/**
	 * The glob pattern to match. Glob patterns can have the following syntax:
	 * - `*` to match one or more characters in a path segment
	 * - `?` to match on one character in a path segment
	 * - `**` to match any number of path segments, including none
	 * - `{}` to group sub patterns into an OR expression. (e.g. `**​/*.{ts,js}` matches all TypeScript and JavaScript files)
	 * - `[]` to declare a range of characters to match in a path segment (e.g., `example.[0-9]` to match on `example.0`, `example.1`, …)
	 * - `[!...]` to negate a range of characters to match in a path segment (e.g., `example.[!0-9]` to match on `example.a`, `example.b`, but not `example.0`)
	 */
	glob: string;

	/**
	 * Whether to match files or folders with this pattern.
	 *
	 * Matches both if undefined.
	 */
	matches?: FileOperationPatternKind;

	/**
	 * Additional options used during matching.
	 */
	options?: FileOperationPatternOptions;
}

/**
 * A filter to describe in which file operation requests or notifications
 * the server is interested in receiving.
 *
 * @since 3.16.0
 */
export interface FileOperationFilter {

	/**
	 * A Uri scheme like `file` or `untitled`.
	 */
	scheme?: string;

	/**
	 * The actual file operation pattern.
	 */
	pattern: FileOperationPattern;
}

/**
 * Capabilities relating to events from file operations by the user in the client.
 *
 * These events do not come from the file system, they come from user operations
 * like renaming a file in the UI.
 *
 * @since 3.16.0
 */
export interface FileOperationClientCapabilities {

	/**
	 * Whether the client supports dynamic registration for file requests/notifications.
	 */
	dynamicRegistration?: boolean;

	/**
	 * The client has support for sending didCreateFiles notifications.
	 */
	didCreate?: boolean;

	/**
	 * The client has support for sending willCreateFiles requests.
	 */
	willCreate?: boolean;

	/**
	 * The client has support for sending didRenameFiles notifications.
	 */
	didRename?: boolean;

	/**
	 * The client has support for sending willRenameFiles requests.
	 */
	willRename?: boolean;

	/**
	 * The client has support for sending didDeleteFiles notifications.
	 */
	didDelete?: boolean;

	/**
	 * The client has support for sending willDeleteFiles requests.
	 */
	willDelete?: boolean;
}

/**
 * The parameters sent in notifications/requests for user-initiated creation of
 * files.
 *
 * @since 3.16.0
 */
export interface CreateFilesParams {

	/**
	 * An array of all files/folders created in this operation.
	 */
	files: FileCreate[];
}

/**
 * Represents information on a file/folder create.
 *
 * @since 3.16.0
 */
export interface FileCreate {

	/**
	 * A file:// URI for the location of the file/folder being created.
	 */
	uri: string;
}

/**
 * The parameters sent in notifications/requests for user-initiated renames of
 * files.
 *
 * @since 3.16.0
 */
export interface RenameFilesParams {

	/**
	 * An array of all files/folders renamed in this operation. When a folder is renamed, only
	 * the folder will be included, and not its children.
	 */
	files: FileRename[];
}

/**
 * Represents information on a file/folder rename.
 *
 * @since 3.16.0
 */
export interface FileRename {

	/**
	 * A file:// URI for the original location of the file/folder being renamed.
	 */
	oldUri: string;

	/**
	 * A file:// URI for the new location of the file/folder being renamed.
	 */
	newUri: string;
}

/**
 * The parameters sent in notifications/requests for user-initiated deletes of
 * files.
 *
 * @since 3.16.0
 */
export interface DeleteFilesParams {

	/**
	 * An array of all files/folders deleted in this operation.
	 */
	files: FileDelete[];
}

/**
 * Represents information on a file/folder delete.
 *
 * @since 3.16.0
 */
export interface FileDelete {

	/**
	 * A file:// URI for the location of the file/folder being deleted.
	 */
	uri: string;
}


/**
 * The will create files request is sent from the client to the server before files are actually
 * created as long as the creation is triggered from within the client.
 *
 * The request can return a `WorkspaceEdit` which will be applied to workspace before the
 * files are created. Hence the `WorkspaceEdit` can not manipulate the content of the file
 * to be created.
 *
 * @since 3.16.0
 */
export namespace WillCreateFilesRequest {
	export const method: 'workspace/willCreateFiles' = 'workspace/willCreateFiles';
	export const messageDirection: MessageDirection = MessageDirection.clientToServer;
	export const type = new ProtocolRequestType<CreateFilesParams, WorkspaceEdit | null, never, void, FileOperationRegistrationOptions>(method);
	export type HandlerSignature = RequestHandler<CreateFilesParams, WorkspaceEdit | undefined | null, void>;
	export const capabilities = CM.create('workspace.fileOperations.willCreate', 'workspace.fileOperations.willCreate');
}

/**
 * The did create files notification is sent from the client to the server when
 * files were created from within the client.
 *
 * @since 3.16.0
 */
export namespace DidCreateFilesNotification {
	export const method: 'workspace/didCreateFiles' = 'workspace/didCreateFiles';
	export const messageDirection: MessageDirection = MessageDirection.clientToServer;
	export const type = new ProtocolNotificationType<CreateFilesParams, FileOperationRegistrationOptions>(method);
	export type HandlerSignature = NotificationHandler<CreateFilesParams>;
	export const capabilities = CM.create('workspace.fileOperations.didCreate', 'workspace.fileOperations.didCreate');
}

/**
 * The will rename files request is sent from the client to the server before files are actually
 * renamed as long as the rename is triggered from within the client.
 *
 * @since 3.16.0
 */
export namespace WillRenameFilesRequest {
	export const method: 'workspace/willRenameFiles' = 'workspace/willRenameFiles';
	export const messageDirection: MessageDirection = MessageDirection.clientToServer;
	export const type = new ProtocolRequestType<RenameFilesParams, WorkspaceEdit | null, never, void, FileOperationRegistrationOptions>(method);
	export type HandlerSignature = RequestHandler<RenameFilesParams, WorkspaceEdit | undefined | null, void>;
	export const capabilities = CM.create('workspace.fileOperations.willRename', 'workspace.fileOperations.willRename');
}

/**
 * The did rename files notification is sent from the client to the server when
 * files were renamed from within the client.
 *
 * @since 3.16.0
 */
export namespace DidRenameFilesNotification {
	export const method: 'workspace/didRenameFiles' = 'workspace/didRenameFiles';
	export const messageDirection: MessageDirection = MessageDirection.clientToServer;
	export const type = new ProtocolNotificationType<RenameFilesParams, FileOperationRegistrationOptions>(method);
	export type HandlerSignature = NotificationHandler<RenameFilesParams>;
	export const capabilities = CM.create('workspace.fileOperations.didRename', 'workspace.fileOperations.didRename');
}

/**
 * The will delete files request is sent from the client to the server before files are actually
 * deleted as long as the deletion is triggered from within the client.
 *
 * @since 3.16.0
 */
export namespace DidDeleteFilesNotification {
	export const method: 'workspace/didDeleteFiles' = 'workspace/didDeleteFiles';
	export const messageDirection: MessageDirection = MessageDirection.clientToServer;
	export const type = new ProtocolNotificationType<DeleteFilesParams, FileOperationRegistrationOptions>(method);
	export type HandlerSignature = NotificationHandler<DeleteFilesParams>;
	export const capabilities = CM.create('workspace.fileOperations.didDelete', 'workspace.fileOperations.didDelete');
}

/**
 * The did delete files notification is sent from the client to the server when
 * files were deleted from within the client.
 *
 * @since 3.16.0
 */
export namespace WillDeleteFilesRequest {
	export const method: 'workspace/willDeleteFiles' = 'workspace/willDeleteFiles';
	export const messageDirection: MessageDirection = MessageDirection.clientToServer;
	export const type = new ProtocolRequestType<DeleteFilesParams, WorkspaceEdit | null, never, void, FileOperationRegistrationOptions>(method);
	export type HandlerSignature = RequestHandler<DeleteFilesParams, WorkspaceEdit | undefined | null, void>;
	export const capabilities = CM.create('workspace.fileOperations.willDelete', 'workspace.fileOperations.willDelete');
}
