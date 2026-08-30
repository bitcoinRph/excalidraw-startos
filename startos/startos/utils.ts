// Here we define any constants or functions that are shared by multiple components
// throughout the package codebase.

export const uiPort = 80
// exported for CLIs/scripts; nginx also proxies it at /api on uiPort for the browser
export const apiPort = 3040
