# VSCode Language Server - Protocol Module

[![NPM Version](https://img.shields.io/npm/v/vscode-languageserver-protocol.svg)](https://npmjs.org/package/vscode-languageserver-protocol)
[![NPM Downloads](https://img.shields.io/npm/dm/vscode-languageserver-protocol.svg)](https://npmjs.org/package/vscode-languageserver-protocol)
[![Build Status](https://dev.azure.com/vscode/vscode-languageserver-node/_apis/build/status%2Fvscode-languageserver-node?branchName=main)](https://dev.azure.com/vscode/vscode-languageserver-node/_build/latest?definitionId=52&branchName=main)

This npm module is a tool independent implementation of the language server protocol and can be used in any type of node application. Please note that the protocol is versioned using the LSP specification version number. Since the protocol depends on the `vscode-jsonrpc` version a a breaking change on that dependencies might not be reflected in a major version change of this module. Changing the major version number in these cases was more confusing this it would result in a version mismatch between the protocol and the LSP specification.

See [here](https://github.com/Microsoft/language-server-protocol) for a detailed documentation on the language server protocol.

## History

For the history please see the [main repository](https://github.com/Microsoft/vscode-languageserver-node/blob/master/README.md)

## License
[MIT](https://github.com/Microsoft/vscode-languageserver-node/blob/master/License.txt)
