# Account and agent settings

Install `@tacta/settings` with core, controls and sidebar. Import
`@tacta/settings/register`. This package contains presentation and controlled data;
it includes no account, plugin or settings API client.

```ts
import "@tacta/settings/register";
const card = document.createElement("tacta-plugin-card");
card.plugin = {
  id: "browser-tools",
  name: "Browser tools",
  description: "Browser automation tools",
  enabled: false,
  skills: ["browse"],
};
card.addEventListener("plugin-toggle", (event) => {
  const { id, enabled } = (event as CustomEvent<{ id: string; enabled: boolean }>).detail;
  // Apply the change through your API, then update card.plugin.
});
```

PluginCard exposes `disabled`, `saving`, `saved` and `error` for host-owned request state.
ProfileCard accepts a plain `ProfileInfo` and emits image-selection/removal, sign-out and
account actions; the host owns all uploads and account operations.

PromptTemplateCard emits `template-edit-request` and `template-delete-request` with its
template. PromptTemplateEditor receives `template=undefined` to close, `null` to create,
or a template object to edit. It validates name, command and content and emits
`template-save` with `{ command, title, content }`, `template-edit`, and `template-cancel`.
Set `busy` and `error` from the application while saving. The dialog/modal builder is
exported through `@tacta/settings/dialog` for composing related settings dialogs.

AgentApprovalSettings accepts `value: { mode: "smart" | "manual" | "off", instructions }`
and loading/ready/saving/saved/error properties. It emits `approval-settings-change`,
`approval-settings-save` and `approval-settings-reload`. The host applies values back
to the component and implements debounce/autosave and server authorization. The view
does not silently persist settings or interpret them as permission to execute an action.
