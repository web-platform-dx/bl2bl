const bcd = require(process.cwd() + '/node_modules/@mdn/browser-compat-data');

// https://github.com/web-platform-dx/web-features/blob/main/docs/baseline.md#core-browser-set
// This maps the name of the browser in MDN to the name of the browser in browserslist

const browsers = [
    // downstream browser bcd key, downstream browserslist key, upstream browserslist key
    ["webview_android",  "chrome_android", "android", "ChromeAndroid"],
    ["samsunginternet_android", "chrome_android", "Samsung", "ChromeAndroid"],
    ["opera_android", "chrome_android", "op_mob", "ChromeAndroid"],
    ["opera", "chrome", "opera", "Chrome"]
];

/*
TODO: we don't have a good mapping for QQ and UC browsers to Chromium.  
This would be really useful!
*/

function getDownstreamBrowsers(baselineVersions) {
    const downstreamBrowsers = [];

    browsers.forEach(([downstream, upstream, downstreamBrowserslistKey, upstreamBrowserslistKey]) => {
        const upstreamVersion = baselineVersions.find(version => version.includes(upstreamBrowserslistKey));
        if (upstreamVersion) {
            const upstreamVersionNumber = parseInt(upstreamVersion.split('>=')[1].trim());
            const downstreamReleases = bcd.browsers[downstream].releases;

            let minVersion = null;

            Object.entries(downstreamReleases).forEach(([version, data]) => {
                if (data.engine === 'Blink' && parseInt(data.engine_version) >= upstreamVersionNumber) {
                    if (!minVersion || parseInt(version) < parseInt(minVersion)) {
                        minVersion = version;
                    }
                }
            });

            if (minVersion) {
                downstreamBrowsers.push(`${downstreamBrowserslistKey} >= ${minVersion}`);
            }
        }
    });

    return downstreamBrowsers;
}

module.exports = { getDownstreamBrowsers }
