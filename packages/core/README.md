# @tacta/core

Shared UI primitives built with Lit and Shadow DOM. Importing classes never registers elements;
the `register` entry registers all core tags. No router, storage or backend is required.

```ts
import "@tacta/core/register";
import "@tacta/core/tokens.css";
import { setLocale } from "@tacta/core";
setLocale("en");
```

Tokens are scoped `--tacta-*` properties. Localization has no application storage or routing dependency.
See [Tacta](https://github.com/mathisarends/tacta#readme) for usage.

| Tag                      | Properties / slots                                                                                     | Events                                                                                     |
| ------------------------ | ------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------ |
| `tacta-text-input`       | `label`, `name`, `value`, `type`, `hint`, `required`, `disabled`, `readonly`, `pattern`                | `value-change`: string                                                                     |
| `tacta-checkbox`         | `label`, `name`, `value`, `checked`, `indeterminate`, `required`, `disabled`                           | `checked-change`: boolean                                                                  |
| `tacta-select`           | `options: SelectOption[]`, `value`, `label`, `placement`, `disabled`                                   | `value-change`: string                                                                     |
| `tacta-pill-tabs`        | `tabs`, `active`, `label`, `variant: pill / underline`, `compact`, `scrollable`; slots named by tab ID | `tab-change`: string                                                                       |
| `tacta-breadcrumb`       | `items: BreadcrumbItem[]`, `label`, `compact`                                                          | Native anchor navigation                                                                   |
| `tacta-page-pagination`  | `page`, `pageCount`, `disabled`, `label`                                                               | `page-change`: number                                                                      |
| `tacta-settings-section` | `heading`, `description`; default and `footer` slots                                                   | —                                                                                          |
| `tacta-settings-row`     | `heading`, `description`, `inline`; `icon`, `heading`, `badge`, `control` and default slots            | —                                                                                          |
| `tacta-save-indicator`   | `state: idle / saving / saved / error`, `savingLabel`, `savedLabel`                                    | —                                                                                          |
| `tacta-search-bar`       | `conversations`, `actions`, `items`, `loading`, `failed`, `hasMore`, `current`                         | `search-change`: SearchRequest; `search-action`: SearchItem; `search-more`; `close-search` |
| `tacta-search-filters`   | `active: all / conversations / files / actions`                                                        | `filter-change`: SearchFilter                                                              |

The existing modal, segmented tabs, spinner and skeleton remain available. All custom events above
bubble across Shadow DOM. Pagination is controlled: assign the emitted page back to `.page`.
Select and tabs update their own selection as well as emitting it. Select is a UI picker;
text input and checkbox are form-associated and participate in `FormData`, native validation,
disabled fieldsets and form reset. Their validation messages use the browser's language.
Set properties before appending a field to define its reset value; await `updateComplete` after
programmatic changes before reading form data or validity.

```ts
html`<tacta-settings-section heading="Appearance">
  <tacta-settings-row heading="Theme" description="Choose your preferred appearance.">
    <tacta-select
      slot="control"
      label="Theme"
      .options=${this.themes}
      .value=${this.theme}
      @value-change=${(event: CustomEvent<string>) => {
        this.theme = event.detail;
      }}
    ></tacta-select>
  </tacta-settings-row>
</tacta-settings-section>`;
```

Mount `tacta-search-bar` to open its modal search surface; remove it on `close-search` or after
handling `search-action`. Local conversations/actions are filtered internally. The application
supplies remote results through `items`, handles loading/retry/pagination and resolves navigation.
No router prefetching or network calls occur in the library. The native dialog makes the background
inert and restores focus on removal. Prefer creating a fresh instance for each search session.

Save status is display-only: `saving` shows a spinner, `saved` briefly confirms completion;
`idle` and `error` clear the indicator. Render an application error message separately.
