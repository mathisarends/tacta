# Notifications

Install `@tacta/notifications` with core; import `@tacta/notifications/register`.

![Notification](../media/notifications.png)

```ts
import "@tacta/notifications/register";
import { toast } from "@tacta/notifications";
toast.success("Changes saved", { description: "Workspace settings are up to date." });
```

The convenience helper creates a region on its first call. `info`, `success`, `warning`
and `error` support description and duration; `dismiss(id)` or `dismiss()` closes items.
The region provides accessible announcements and pauses dismissal while hovered/focused.

For isolated workspaces, create a `ToastStore`, assign it to a `tacta-toast-region` through
`store`, and call `store.add(kind, message, options)`. Stores and subscriptions stay
independent; replacing a region's store updates the subscription. Use `duration: Infinity`
for an item the application will dismiss explicitly. No OS or network notification is sent.
