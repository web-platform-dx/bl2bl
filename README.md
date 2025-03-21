# bl2bl

A module for turning [Baseline](https://developer.mozilla.org/en-US/docs/Glossary/Baseline/Compatibility) targets into [`browserslist`](https://github.com/browserslist/browserslist) configurations. This allows you to easily target Baseline in the many developer tools that rely on `browserslist` for building, polyfilling, syntax highlighting and more.

## Installation

You can install `bl2bl` with `npm`:

```bash
npm i bl2bl
```

## Usage

To update your `browserslist` config, run the following command:

```bash
npx bl2bl
```

`bl2bl` uses `@mdn/browser-compat-data` and `baseline-browser-mapping` data sources and will install the latest version of each of them on install. However, it is strongly recommended that you update these modules regularly, or every time you run `npx bl2bl`, especially if you are targeting Baseline Widely available or Chromium downstream browsers. You can automate this by adding a command to your `package.json` `scripts` array which updates `@mdn/browser-compat-data` and `baseline-browser-mapping` before running `npx bl2bl`:

```json
"scripts": {
  "execute-bl2bl": "npm i @mdn/browser-compat-data@latest baseline-browser-mapping@latest; npx bl2bl"
}
```

Make sure to configure `bl2bl` before use.

## Configuration

If you don't add a `bl2bl` property to your `package.json` file, the following defaults will apply:

```json
"bl2bl" : {
  "baselineThreshold": "widely available",
  "useBrowserslistrc": false,
  "downstreamBrowsers": false,
  "savePrevious": true
}
```

### `baselineThreshold`

This property determines which browsers your target and can take two value types: a string reading `widely available` or an integer representing the Baseline year required in the format `YYYY`.

Using `widely available` will select the minimum version of each browser that is compatible with the current Baseline Widely Available feature set.

Using a date in the format `YYYY-MM-DD` will select the minimum version of each browser that was compatible with all Baseline Widely Available features on the specified date.

Using a year in the format `YYYY` will select the minimum version of each browser that is compatible with all features that were Baseline Newly Available at the end of the given year.

If you pass an invalid string, or an integer below `2016` or above the previous calendar year, or a `YYYY-MM-DD` string too far into the future, `bl2bl` will throw an error and not process any changes.

### `useBrowserslistrc`

`bl2bl` defaults to storing `browserslist` configurations in the projects `package.json` file. If you want to store your `browserslist` configuration using the `.browserslistrc` file format, set this property to `true`.

### `downstreamBrowsers`

There are many browsers that depend on another browser's engine and therefore support an identical feature set. For example, [Opera 115 implements Blink 129](https://github.com/mdn/browser-compat-data/blob/037fce457e530715679ce4ae4b318aa18904bea8/browsers/opera.json#L863) and therefore has the same web platform feature support as Chrome 129. Setting `downstreamBrowsers` to true will select minimum browser versions from other vendors that correspond to the minimum versions of the core browser set browsers you have selected.

For example, setting `baselineThreshold` to `2021` will produce the following `browserslist` config:

```
"browserslist": [
    "Chrome >= 96",
    "ChromeAndroid >= 96",
    "Edge >= 96",
    "Firefox >= 95",
    "FirefoxAndroid >= 94",
    "Safari >= 15.2",
    "iOS >= 15.2",
    "Opera >= 82",
    "op_mob >= 67",
    "Samsung >= 17.0",
    "Android >= 96",
    "and_uc >= 15.3",
    "and_qq >= 13.4"
  ]
```

For more information on how these mappings are created, please see [the `baseline-browser-mapping` README](https://www.npmjs.com/package/baseline-browser-mapping).

### `savePrevious`

By default, `bl2bl` will save your previous `browserlist` configuration in a file called `.browserslistrc_backup` when you run `npx bl2bl`, in case you need to roll back to a previous configuration. If you don't want to create this backup, set `savePrevious` to false.
