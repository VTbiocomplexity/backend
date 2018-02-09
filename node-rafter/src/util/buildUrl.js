var URI = require("urijs");

var buildUrl = function() {
    var url = URI(arguments[0]);
    var currPath = url.pathname();

    newArgs = [...arguments].map((arg) => { return arg.toString() });

    // Change the first argument so that arguments will match URI.joinPaths'
    // syntax
    newArgs[0] = currPath;

    // Call URI.joinPaths with these arguments
    var newPath = URI.joinPaths.apply(this, newArgs).toString();

    // Set the path
    url.pathname(newPath);

    // Return URI string
    return url.toString();
}

module.exports = buildUrl;
