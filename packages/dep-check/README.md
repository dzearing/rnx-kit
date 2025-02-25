# @rnx-kit/dep-check

[![Build](https://github.com/microsoft/rnx-kit/actions/workflows/build.yml/badge.svg)](https://github.com/microsoft/rnx-kit/actions/workflows/build.yml)
[![npm version](https://img.shields.io/npm/v/@rnx-kit/dep-check)](https://www.npmjs.com/package/@rnx-kit/dep-check)

`@rnx-kit/dep-check` manages React Native dependencies for a package, based on
its needs and requirements.

## Installation

```sh
yarn add @rnx-kit/dep-check --dev
```

or if you're using npm

```sh
npm add --save-dev @rnx-kit/dep-check
```

## Usage

```sh
yarn rnx-dep-check [options] [/path/to/package.json]
```

Providing a path to `package.json` is optional. If omitted, it will look for one
using Node module resolution.

Examples:

- Ensure dependencies are compatible with react-native 0.64 without a config:
  ```sh
  yarn rnx-dep-check --vigilant 0.64
  ```
- Initialize a config for your app (or library):
  ```sh
  yarn rnx-dep-check --init app
  # or specify `library` for a library
  ```
- Apply changes suggested by dep-check:
  ```sh
  yarn rnx-dep-check --write
  ```
- Interactively update supported react-native versions (or bump version used for
  development):
  ```sh
  yarn rnx-dep-check --set-version
  ```

### `--custom-profiles <module>`

Path to custom profiles. This can be a path to a JSON file, a `.js` file, or a
module name. The module must default export an object similar to the one below:

```js
module.exports = {
  0.63: {
    "my-capability": {
      name: "my-module",
      version: "1.0.0",
    },
  },
  0.64: {
    "my-capability": {
      name: "my-module",
      version: "1.1.0",
    },
  },
};
```

For a more complete example, have a look at the
[default profiles](https://github.com/microsoft/rnx-kit/blob/769e9fa290929effd5111884f1637c21326b5a95/packages/dep-check/src/profiles.ts#L11).

> #### Note
>
> This specific flag may only be used with `--vigilant`. You can specify custom
> profiles in normal mode by adding `customProfiles` to your package
> [configuration](#configure).

### `--exclude-packages`

Comma-separated list of package names to exclude from inspection.

> #### Note
>
> `--exclude-packages` will only exclude packages that do not have a
> configuration. Packages that have a configuration, will still be checked. This
> flag may only be used with `--vigilant`.

### `--init <app | library>`

When integrating `@rnx-kit/dep-check` for the first time, it may be a cumbersome
to manually add all capabilities yourself. You can run this tool with `--init`,
and it will try to add a sensible configuration based on what is currently
defined in the specified `package.json`.

### `--set-version`

Sets `reactNativeVersion` and `reactNativeDevVersion` for any configured
package. The value should be a comma-separated list of `react-native` versions
to set. The first number specifies the development version. For example,
`0.64,0.63` will set the following values:

```json
{
  "rnx-kit": {
    "reactNativeVersion": "^0.63.0 || ^0.64.0",
    "reactNativeDevVersion": "^0.64.0"
  }
}
```

If the version numbers are omitted, an _interactive prompt_ will appear.

> #### Note
>
> A `rnx-dep-check --write` run will be invoked right after changes have been
> made. As such, this flag will fail if changes are needed before making any
> modifications.

### `--vigilant`

Also inspect packages that are not configured. Specify a comma-separated list of
profile versions to compare against, e.g. `0.63,0.64`. The first number
specifies the target version.

### `--write`

Writes all proposed changes to the specified `package.json`.

## Configure

`@rnx-kit/dep-check` must first be configured before it can be used. It uses
`@rnx-kit/config` to retrieve your kit configuration. Your configuration can be
specified either in a file, `rnx-kit.config.js`, or in an `"rnx-kit"` section of
your `package.json`.

| Option                  | Type                   | Default               | Description                                                                                                 |
| :---------------------- | :--------------------- | :-------------------- | :---------------------------------------------------------------------------------------------------------- |
| `kitType`               | `"app"` \| `"library"` | `"library"`           | Whether this kit is an "app" or a "library". Determines how dependencies are declared.                      |
| `reactNativeVersion`    | string                 | (required)            | Supported versions of React Native. The value can be a specific version or a range.                         |
| `reactNativeDevVersion` | string                 | `minVersion(version)` | The version of React Native to use for development. If omitted, the minimum supported version will be used. |
| `capabilities`          | Capabilities[]         | `[]`                  | List of used/provided capabilities. A full list can be found below.                                         |
| `customProfiles`        | string                 | `undefined`           | Path to custom profiles. This can be a path to a JSON file, a `.js` file, or a module name.                 |

## Capabilities

The following table contains the currently supported capabilities and what they
resolve to:

<details>
<summary>Capabilities Table</summary>

<!-- The following table can be updated by running `yarn update-readme` -->
<!-- @rnx-kit/dep-check/capabilities start -->

| Capability                           | 0.67                                                              | 0.66                                                              | 0.65                                                              | 0.64                                                              | 0.63                                                              | 0.62                                                              | 0.61                                                              |
| ------------------------------------ | ----------------------------------------------------------------- | ----------------------------------------------------------------- | ----------------------------------------------------------------- | ----------------------------------------------------------------- | ----------------------------------------------------------------- | ----------------------------------------------------------------- | ----------------------------------------------------------------- |
| core                                 | react-native@^0.67.0-0                                            | react-native@^0.66.0-0                                            | react-native@^0.65.0-0                                            | react-native@^0.64.2                                              | react-native@^0.63.2                                              | react-native@^0.62.3                                              | react-native@^0.61.5                                              |
| core-android                         | react-native@^0.67.0-0                                            | react-native@^0.66.0-0                                            | react-native@^0.65.0-0                                            | react-native@^0.64.2                                              | react-native@^0.63.2                                              | react-native@^0.62.3                                              | react-native@^0.61.5                                              |
| core-ios                             | react-native@^0.67.0-0                                            | react-native@^0.66.0-0                                            | react-native@^0.65.0-0                                            | react-native@^0.64.2                                              | react-native@^0.63.2                                              | react-native@^0.62.3                                              | react-native@^0.61.5                                              |
| core-macos                           | react-native-macos@^0.67.0-0                                      | react-native-macos@^0.66.0-0                                      | react-native-macos@^0.65.0-0                                      | react-native-macos@^0.64.0                                        | react-native-macos@^0.63.0                                        | react-native-macos@^0.62.0                                        | react-native-macos@^0.61.0                                        |
| core-windows                         | react-native-windows@^0.67.0-0                                    | react-native-windows@^0.66.0-0                                    | react-native-windows@^0.65.0-0                                    | react-native-windows@^0.64.0                                      | react-native-windows@^0.63.0                                      | react-native-windows@^0.62.0                                      | react-native-windows@^0.61.0                                      |
| animation                            | react-native-reanimated@^2.2.4                                    | react-native-reanimated@^2.2.3                                    | react-native-reanimated@^2.2.1                                    | react-native-reanimated@^2.1.0                                    | react-native-reanimated@^1.13.3                                   | react-native-reanimated@^1.13.3                                   | react-native-reanimated@^1.13.3                                   |
| babel-preset-react-native            | metro-react-native-babel-preset@^0.66.2                           | metro-react-native-babel-preset@^0.66.2                           | metro-react-native-babel-preset@^0.66.0                           | metro-react-native-babel-preset@^0.64.0                           | metro-react-native-babel-preset@^0.59.0                           | metro-react-native-babel-preset@^0.58.0                           | metro-react-native-babel-preset@^0.56.0                           |
| base64                               | react-native-base64@^0.2.1                                        | react-native-base64@^0.2.1                                        | react-native-base64@^0.2.1                                        | react-native-base64@^0.2.1                                        | react-native-base64@^0.2.1                                        | react-native-base64@^0.2.1                                        | react-native-base64@^0.2.1                                        |
| checkbox                             | @react-native-community/checkbox@^0.5.8                           | @react-native-community/checkbox@^0.5.8                           | @react-native-community/checkbox@^0.5.8                           | @react-native-community/checkbox@^0.5.8                           | @react-native-community/checkbox@^0.5.7                           | @react-native-community/checkbox@^0.5.7                           | @react-native-community/checkbox@^0.5.7                           |
| clipboard                            | @react-native-clipboard/clipboard@^1.8.4                          | @react-native-clipboard/clipboard@^1.8.4                          | @react-native-clipboard/clipboard@^1.8.4                          | @react-native-clipboard/clipboard@^1.7.3                          | @react-native-community/clipboard@^1.5.1                          | @react-native-community/clipboard@^1.5.1                          | @react-native-community/clipboard@^1.5.1                          |
| core/testing                         | Meta package for installing `core`, `jest`, `react-test-renderer` | Meta package for installing `core`, `jest`, `react-test-renderer` | Meta package for installing `core`, `jest`, `react-test-renderer` | Meta package for installing `core`, `jest`, `react-test-renderer` | Meta package for installing `core`, `jest`, `react-test-renderer` | Meta package for installing `core`, `jest`, `react-test-renderer` | Meta package for installing `core`, `jest`, `react-test-renderer` |
| datetime-picker                      | @react-native-community/datetimepicker@^3.5.2                     | @react-native-community/datetimepicker@^3.5.2                     | @react-native-community/datetimepicker@^3.5.2                     | @react-native-community/datetimepicker@^3.4.6                     | @react-native-community/datetimepicker@^3.0.9                     | @react-native-community/datetimepicker@^3.0.9                     | @react-native-community/datetimepicker@^3.0.9                     |
| filesystem                           | react-native-fs@^2.18.0                                           | react-native-fs@^2.18.0                                           | react-native-fs@^2.18.0                                           | react-native-fs@^2.17.0                                           | react-native-fs@^2.16.6                                           | react-native-fs@^2.16.6                                           | react-native-fs@^2.16.6                                           |
| floating-action                      | react-native-floating-action@^1.22.0                              | react-native-floating-action@^1.22.0                              | react-native-floating-action@^1.22.0                              | react-native-floating-action@^1.21.0                              | react-native-floating-action@^1.21.0                              | react-native-floating-action@^1.18.0                              | react-native-floating-action@^1.18.0                              |
| gestures                             | react-native-gesture-handler@^1.10.3                              | react-native-gesture-handler@^1.10.3                              | react-native-gesture-handler@^1.10.3                              | react-native-gesture-handler@^1.10.3                              | react-native-gesture-handler@^1.10.3                              | react-native-gesture-handler@^1.9.0                               | react-native-gesture-handler@^1.9.0                               |
| hermes                               | hermes-engine@~0.9.0                                              | hermes-engine@~0.9.0                                              | hermes-engine@~0.8.1                                              | hermes-engine@~0.7.0                                              | hermes-engine@~0.5.0                                              | hermes-engine@~0.4.0                                              | hermes-engine@^0.2.1                                              |
| hooks                                | @react-native-community/hooks@^2.6.0                              | @react-native-community/hooks@^2.6.0                              | @react-native-community/hooks@^2.6.0                              | @react-native-community/hooks@^2.6.0                              | @react-native-community/hooks@^2.6.0                              | @react-native-community/hooks@^2.6.0                              | @react-native-community/hooks@^2.6.0                              |
| html                                 | react-native-render-html@^6.1.0                                   | react-native-render-html@^6.1.0                                   | react-native-render-html@^5.1.1                                   | react-native-render-html@^5.1.1                                   | react-native-render-html@^5.1.0                                   | react-native-render-html@^5.1.0                                   | react-native-render-html@^5.1.0                                   |
| jest                                 | jest@^26.6.3                                                      | jest@^26.6.3                                                      | jest@^26.6.3                                                      | jest@^26.5.2                                                      | jest@^24.9.0                                                      | jest@^24.8.0                                                      | jest@^24.8.0                                                      |
| lazy-index                           | react-native-lazy-index@^2.1.1                                    | react-native-lazy-index@^2.1.1                                    | react-native-lazy-index@^2.1.1                                    | react-native-lazy-index@^2.1.1                                    | react-native-lazy-index@^2.1.1                                    | react-native-lazy-index@^2.1.1                                    | react-native-lazy-index@^2.1.1                                    |
| masked-view                          | @react-native-masked-view/masked-view@^0.2.6                      | @react-native-masked-view/masked-view@^0.2.6                      | @react-native-masked-view/masked-view@^0.2.6                      | @react-native-masked-view/masked-view@^0.2.4                      | @react-native-masked-view/masked-view@^0.2.4                      | @react-native-masked-view/masked-view@^0.2.4                      | @react-native-masked-view/masked-view@^0.2.4                      |
| metro                                | metro@^0.66.2                                                     | metro@^0.66.2                                                     | metro@^0.66.0                                                     | metro@^0.64.0                                                     | metro@^0.59.0                                                     | metro@^0.58.0                                                     | metro@^0.56.0                                                     |
| metro-config                         | metro-config@^0.66.2                                              | metro-config@^0.66.2                                              | metro-config@^0.66.0                                              | metro-config@^0.64.0                                              | metro-config@^0.59.0                                              | metro-config@^0.58.0                                              | metro-config@^0.56.0                                              |
| metro-core                           | metro-core@^0.66.2                                                | metro-core@^0.66.2                                                | metro-core@^0.66.0                                                | metro-core@^0.64.0                                                | metro-core@^0.59.0                                                | metro-core@^0.58.0                                                | metro-core@^0.56.0                                                |
| metro-react-native-babel-transformer | metro-react-native-babel-transformer@^0.66.2                      | metro-react-native-babel-transformer@^0.66.2                      | metro-react-native-babel-transformer@^0.66.0                      | metro-react-native-babel-transformer@^0.64.0                      | metro-react-native-babel-transformer@^0.59.0                      | metro-react-native-babel-transformer@^0.58.0                      | metro-react-native-babel-transformer@^0.56.0                      |
| metro-resolver                       | metro-resolver@^0.66.2                                            | metro-resolver@^0.66.2                                            | metro-resolver@^0.66.0                                            | metro-resolver@^0.64.0                                            | metro-resolver@^0.59.0                                            | metro-resolver@^0.58.0                                            | metro-resolver@^0.56.0                                            |
| metro-runtime                        | metro-runtime@^0.66.2                                             | metro-runtime@^0.66.2                                             | metro-runtime@^0.66.0                                             | metro-runtime@^0.64.0                                             | metro-runtime@^0.59.0                                             | metro-runtime@^0.58.0                                             | metro-runtime@^0.56.0                                             |
| modal                                | react-native-modal@^13.0.0                                        | react-native-modal@^13.0.0                                        | react-native-modal@^13.0.0                                        | react-native-modal@^11.10.0                                       | react-native-modal@^11.5.6                                        | react-native-modal@^11.5.6                                        | react-native-modal@^11.5.6                                        |
| navigation/native                    | @react-navigation/native@^5.9.8                                   | @react-navigation/native@^5.9.8                                   | @react-navigation/native@^5.9.8                                   | @react-navigation/native@^5.9.8                                   | @react-navigation/native@^5.9.4                                   | @react-navigation/native@^5.7.6                                   | @react-navigation/native@^5.7.6                                   |
| navigation/stack                     | @react-navigation/stack@^5.14.9                                   | @react-navigation/stack@^5.14.9                                   | @react-navigation/stack@^5.14.9                                   | @react-navigation/stack@^5.14.9                                   | @react-navigation/stack@^5.14.4                                   | @react-navigation/stack@^5.9.3                                    | @react-navigation/stack@^5.9.3                                    |
| netinfo                              | @react-native-community/netinfo@^6.0.2                            | @react-native-community/netinfo@^6.0.2                            | @react-native-community/netinfo@^6.0.2                            | @react-native-community/netinfo@^6.0.2                            | @react-native-community/netinfo@^5.9.10                           | @react-native-community/netinfo@^5.9.10                           | @react-native-community/netinfo@^5.7.1                            |
| popover                              | react-native-popover-view@^4.0.3                                  | react-native-popover-view@^4.0.3                                  | react-native-popover-view@^4.0.3                                  | react-native-popover-view@^4.0.3                                  | react-native-popover-view@^3.1.1                                  | react-native-popover-view@^3.1.1                                  | react-native-popover-view@^3.1.1                                  |
| react                                | react@17.0.2                                                      | react@17.0.2                                                      | react@17.0.2                                                      | react@17.0.1                                                      | react@16.13.1                                                     | react@16.11.0                                                     | react@16.9.0                                                      |
| react-dom                            | react-dom@17.0.2                                                  | react-dom@17.0.2                                                  | react-dom@17.0.2                                                  | react-dom@17.0.1                                                  | react-dom@16.13.1                                                 | react-dom@16.11.0                                                 | react-dom@16.9.0                                                  |
| react-test-renderer                  | react-test-renderer@17.0.2                                        | react-test-renderer@17.0.2                                        | react-test-renderer@17.0.2                                        | react-test-renderer@17.0.1                                        | react-test-renderer@16.13.1                                       | react-test-renderer@16.11.0                                       | react-test-renderer@16.9.0                                        |
| safe-area                            | react-native-safe-area-context@^3.2.0                             | react-native-safe-area-context@^3.2.0                             | react-native-safe-area-context@^3.2.0                             | react-native-safe-area-context@^3.2.0                             | react-native-safe-area-context@^3.2.0                             | react-native-safe-area-context@^3.1.9                             | react-native-safe-area-context@^3.1.9                             |
| screens                              | react-native-screens@^3.7.0                                       | react-native-screens@^3.7.0                                       | react-native-screens@^3.7.0                                       | react-native-screens@^3.1.1                                       | react-native-screens@^2.18.1                                      | react-native-screens@^2.10.1                                      | react-native-screens@^2.10.1                                      |
| shimmer                              | react-native-shimmer@^0.5.0                                       | react-native-shimmer@^0.5.0                                       | react-native-shimmer@^0.5.0                                       | react-native-shimmer@^0.5.0                                       | react-native-shimmer@^0.5.0                                       | react-native-shimmer@^0.5.0                                       | react-native-shimmer@^0.5.0                                       |
| sqlite                               | react-native-sqlite-storage@^5.0.0                                | react-native-sqlite-storage@^5.0.0                                | react-native-sqlite-storage@^5.0.0                                | react-native-sqlite-storage@^5.0.0                                | react-native-sqlite-storage@^3.3.11                               | react-native-sqlite-storage@^3.3.11                               | react-native-sqlite-storage@^3.3.11                               |
| storage                              | @react-native-async-storage/async-storage@^1.15.8                 | @react-native-async-storage/async-storage@^1.15.8                 | @react-native-async-storage/async-storage@^1.15.8                 | @react-native-async-storage/async-storage@^1.15.8                 | @react-native-community/async-storage@^1.12.1                     | @react-native-community/async-storage@^1.12.1                     | @react-native-community/async-storage@^1.12.1                     |
| svg                                  | react-native-svg@^12.1.1                                          | react-native-svg@^12.1.1                                          | react-native-svg@^12.1.1                                          | react-native-svg@^12.1.1                                          | react-native-svg@^12.1.1                                          | react-native-svg@^12.1.1                                          | react-native-svg@^12.1.1                                          |
| test-app                             | react-native-test-app@^0.9.0                                      | react-native-test-app@^0.9.0                                      | react-native-test-app@^0.9.0                                      | react-native-test-app@^0.9.0                                      | react-native-test-app@^0.9.0                                      | react-native-test-app@^0.9.0                                      | react-native-test-app@^0.9.0                                      |
| webview                              | react-native-webview@^11.13.0                                     | react-native-webview@^11.13.0                                     | react-native-webview@^11.13.0                                     | react-native-webview@^11.4.2                                      | react-native-webview@^11.4.2                                      | react-native-webview@^11.0.3                                      | react-native-webview@^11.0.3                                      |

<!-- @rnx-kit/dep-check/capabilities end -->

</details>

To add new capabilities, first add it to
[`/packages/config/src/kitConfig.ts`](https://github.com/microsoft/rnx-kit/blob/62da26011c9ff86a24eed63356c68f6999034d34/packages/config/src/kitConfig.ts#L4),
then update the
[profiles](https://github.com/microsoft/rnx-kit/tree/main/packages/dep-check/src/profiles).
For an example, have a look at how the
[`hermes` capability was added](https://github.com/microsoft/rnx-kit/commit/c79828791a6ac5cf19b4abfff6347542af49eaec).

## Custom Profiles

A custom profile is a list of capabilities that map to specific versions of
packages. It can be a JSON file, or a JS file that default exports it. Custom
profiles are consumed via the [`--custom-profiles`](#--custom-profiles-module)
flag.

For example, this custom profile adds `my-capability` to profile versions 0.63
and 0.64:

```js
module.exports = {
  0.63: {
    "my-capability": {
      name: "my-module",
      version: "1.0.0",
    },
  },
  0.64: {
    "my-capability": {
      name: "my-module",
      version: "1.1.0",
    },
  },
};
```

For a more complete example, have a look at the
[default profiles](https://github.com/microsoft/rnx-kit/blob/769e9fa290929effd5111884f1637c21326b5a95/packages/dep-check/src/profiles.ts#L11).

### Custom Capabilities

Normally, a capability resolves to a version of a package. For instance, `core`
is a capability that resolves to `react-native`:

```js
{
  "core": {
    name: "react-native",
    version: "0.0.0",
  },
}
```

A capability can depend on other capabilities. For example, we can ensure that
`react-native` gets installed along with `react-native-windows` by declaring
that `core-windows` depends on `core`:

```js
{
  "core-windows": {
    name: "react-native-windows",
    version: "0.0.0",
    capabilities: ["core"],
  },
}
```

You can also create capabilities that don't resolve to a package, but to a list
of capabilities instead:

```js
{
  "core/all": {
    name: "#meta",
    capabilities: [
      "core-android",
      "core-ios",
      "core-macos",
      "core-windows",
    ],
  },
}
```

## Terminology

| Terminology      | Definition (as used in `dep-check`'s context)                                                                                                                                     |
| :--------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| capability       | A capability is in essence a feature that the kit uses. A capability is usually mapped to an npm package. Which versions of the package is determined by a profile (see below).   |
| package manifest | This normally refers to a package's `package.json`.                                                                                                                               |
| profile          | A profile is a mapping of capabilities to npm packages at a specific version or version range. Versions will vary depending on which React Native version a profile is meant for. |

## Motivation

There is currently no centralised place where developers can go to and get a
list of recommended packages, and which versions they should be using when
targeting a specific version of React Native. We are trying to address this gap
with this tool.

`@rnx-kit/dep-check` works by reading a configuration, and suggests changes that
need to be made. It can optionally also write said changes to the
`package.json`. The configuration must be manually written by the package owner.
It declares which React Native versions the package supports, and which
capabilities it requires. For instance, lets say we have a library,
`awesome-library`, which supports React Native versions 0.63 and 0.64, and needs
something that provides network information. We would declare the following in
our `package.json`:

```json
// package.json
{
  "name": "awesome-library",
  "version": "1.0.0",
  ...
  "rnx-kit": {
    "reactNativeVersion": "^0.63 || ^0.64",
    "capabilities": [
      "core-android",
      "core-ios",
      "netinfo"
    ]
  }
}
```

If we run `@rnx-kit/dep-check` now, it will suggest that we change
`peerDependencies` and `devDependencies` to the following:

```json
// package.json
{
  "name": "awesome-library",
  "version": "1.0.0",
  ...
  "peerDependencies": {
    "@react-native-community/netinfo": "^5.7.1 || ^6.0.0",
    "react-native": "^0.63.2 || ^0.64.1"
  },
  "devDependencies": {
    "@react-native-community/netinfo": "^5.7.1",
    "react-native": "^0.63.2"
  },
  "rnx-kit": {
    "reactNativeVersion": "^0.63 || ^0.64",
    "capabilities": [
      "core-android",
      "core-ios",
      "netinfo"
    ]
  }
}
```

Now our `package.json` correctly declares that it supports React Native 0.63 and
0.64 to consumers. It also added `@react-native-community/netinfo`, a package
that provides network information. At the same time, it also sets the versions
we'll need during development.

For apps that use `@rnx-kit/dep-check`, the process is similar but you'll also
need to declare that the package is an app by adding `"kitType": "app"`:

```json
// package.json
{
  "name": "awesome-app",
  "version": "1.0.0",
  ...
  "dependencies": {
    "@react-native-community/netinfo": "^6.0.0",
    "awesome-library": "1.0.0",
    "react-native": "^0.64.1"
  },
  "rnx-kit": {
    "reactNativeVersion": "^0.64",
    "kitType": "app",
    "capabilities": [
      "core-android",
      "core-ios"
    ]
  }
}
```

Now, we see that `@rnx-kit/dep-check` added `@react-native-community/netinfo`
even though it wasn't declared in capabilities. This is because when a package
is an app, it needs to fulfill the requirements of its dependencies. In this
example, because `awesome-library` needs the `netinfo` capability, it gets added
to `awesome-app`.

For a more detailed design document, see [`DESIGN.md`](./DESIGN.md).
