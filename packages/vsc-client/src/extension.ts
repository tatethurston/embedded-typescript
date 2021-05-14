import { join } from "path";
import { workspace, ExtensionContext } from "vscode";

import {
  LanguageClient,
  LanguageClientOptions,
  ServerOptions,
  TransportKind,
} from "vscode-languageclient/node";

let client: LanguageClient | undefined;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function activate(context: ExtensionContext): void {
  const server = context.asAbsolutePath(join("dist", "server.js"));

  const serverOptions: ServerOptions = {
    run: { module: server, transport: TransportKind.ipc },
    debug: {
      module: server,
      transport: TransportKind.ipc,
      options: { execArgv: ["--nolazy", "--inspect=6009"] },
    },
  };

  // Options to control the language client
  const clientOptions: LanguageClientOptions = {
    // Register the server for plain text documents
    documentSelector: [{ scheme: "file", language: "embedded-typescript" }],
    synchronize: {
      // Notify the server about file changes to '.clientrc files contained in the workspace
      fileEvents: workspace.createFileSystemWatcher("**/.clientrc"),
    },
  };

  // Create the language client and start the client.
  client = new LanguageClient(
    "ETSLanguageServer",
    "Embedded TypeScript Language Server",
    serverOptions,
    clientOptions
  );

  // Start the client. This will also launch the server
  client.start();
}

export function deactivate(): Promise<void> | undefined {
  return client?.stop();
}
