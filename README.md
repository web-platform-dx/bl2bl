# bl2bl

A module for turning Baseline thresholds into `browserslist` configurations.

## Installation

You can install `bl2bl` with `npm`:

```
npm i https://github.com/tonypconway/bl2bl
```

## Usage

To update your `browserslist` config, run the following command:

```
npx bl2bl
```

`bl2bl` uses `@mdn/browser-compat-data` as a data source and will install the latest version of `@mdn/browser-compat-data` on install.  However, is strongly recommended that you update `@mdn/browser-compat-data` regularly, or every time you run `npx bl2bl`, especially if you are targeting Baseline Widely available.  You can automate this by adding a command to your `package.json` `scripts` array which updates `@mdn/browser-compat-data` before running `npx bl2bl`:

```
"scripts": {
  "refresh-bl2bl": "npm i @mdn/browser-compat-data@latest; npx bl2bl"
}
```

Make sure to configure `bl2bl` before use.

## Configuration

If you don't add a `bl2bl` property to your `package.json` file, the following defaults will apply:

```
"bl2bl" : {
  "baselineThreshold": "widely available",
  "useBrowserslistrc": false,
  "downstreamBrowsers": false,
  "savePrevious": true
}
```

### `baselineThreshold`

This property determines which browsers your target and can take two value types: a string reading `widely available` or an integer representing the Baseline year required in the format `YYYY`.

Using `widely available` will select the last version of each of the Baseline core browser set released *exactly 30 months before the time of execution*.

Using a year in the format `YYYY` will select the last version of each of the Baseline core browser set released in the specified year.  This may change in future releases to select earlier version of browsers which support the full Baseline feature set that calendar year.

If you pass an invalid string, or an integer below 2016 or above the previous calendar year, `bl2bl` will throw an error and not process any changes.

### `useBrowserslistrc`

`bl2bl` defaults to storing `browserslist` configurations in the projects `package.json` file.  If you want to store your `browserslist` configuration using the `.browserslistrc` file format, set this property to `true`.

### `downstreamBrowsers`

There are many browsers that depend on another browser's engine and therefore support an identical feature set.  For example, [Opera 115 implements Blink 129](https://github.com/mdn/browser-compat-data/blob/037fce457e530715679ce4ae4b318aa18904bea8/browsers/opera.json#L863) and therefore has the same web platform feature support as Chrome 129.  Setting `downstreamBrowsers` to true will select minimum browser versions from other vendors that correspond to the minimum versions of the core browser set browsers you have selected.

TODO: include an example here

### `savePrevious`

By default, `bl2bl` will save your previous `browserlist` configuration in a file called `.browserslistrc_backup` when you run `npx bl2bl`, in case you need to roll back to a previous configuration.  If you don't want to create this backup, set `savePrevious` to false.
