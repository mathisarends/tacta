# Workspace compatibility facade

`@tacta/workspace` retains existing imports and the `registerWorkspaceElements()` function.
It re-exports the same implementations from workspace-panel and sidebar; duplicate
registration remains guarded. Existing `@tacta/workspace/sidebar/*` and workspace control
subpaths continue to resolve.

New applications should install `@tacta/workspace-panel` for tabs/resizing, or
`@tacta/sidebar` for conversation navigation, so they install only the feature they use.
The compatibility facade depends on both packages and core.

See [workspace-panel](workspace-panel.md) and [sidebar](sidebar.md).
