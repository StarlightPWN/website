const { DateTime } = require("luxon");
const { Tokenizer, evalQuotedToken } = require("liquidjs");

module.exports = function (eleventyConfig) {
    eleventyConfig.addPassthroughCopy("img");
    eleventyConfig.addPassthroughCopy("css/fonts");

    eleventyConfig.addCollection("posts", function (collection) {
        return collection
            .getFilteredByTag("posts");
    });
    eleventyConfig.addFilter("asPostDate", (dateObj) => {
        return DateTime.fromJSDate(dateObj).toLocaleString(DateTime.DATE_MED);
    });

    eleventyConfig.addLiquidTag("includeFileURI", function (liquidEngine) {
        return {
            parse: function (tagToken, remainingTokens) {
                const tokenizer = new Tokenizer(tagToken.args, this.liquid.options.operators);
                this.path = tokenizer.readValue();
                this.mimeType = tokenizer.readValue();
            },
            render: async function (scope, hash) {
                const path = evalQuotedToken(this.path, scope);
                const mimeType = evalQuotedToken(this.mimeType, scope);
                return "data:" + mimeType + ";base64," + (await require("fs/promises").readFile(path)).toString("base64");
            }
        };
    });

    return {
        dir: {
            input: "src",
            includes: "_includes",
            "output": "_site",
        }
    }
};