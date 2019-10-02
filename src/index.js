// @ts-nocheck
const {OriginalSource, SourceMapSource, ReplaceSource} = require("webpack-sources");
const {dirname, relative} = require('path');

module.exports = function (source, map)
{
    const callback = this.async();

    const bindings_regex = /\brequire\((?:'bindings'|"bindings")\)\s*\(([^)]*)\)/g;
    let match = bindings_regex.exec(source);
    if(!match)
        return callback(null, source, map);

    const code = new ReplaceSource(map ? new SourceMapSource(source, this.resourcePath, map) : new OriginalSource(source, this.resourcePath));

    this.resolve(this.context, 'bindings', (error, bindings_module_path) =>
    {
        if(error)
            return callback(error);

        const bindings_module = require(bindings_module_path);

        do
        {
            try
            {
                const bindings_arg = {
                    bindings: eval(match[1]),
                    path: true,
                    module_root: bindings_module.getRoot(this.resourcePath)
                };
                const bindings_path = relative(dirname(this.resourcePath), bindings_module(bindings_arg)).replace(/\\/g, '/');
                code.replace(match.index, match.index + match[0].length - 1, `require('./${bindings_path}')`);
            }
            catch(bindings_error)
            {
                return callback(bindings_error);
            }

        }
        while(match = bindings_regex.exec(source))

        const bindings_code = code.sourceAndMap();
        return callback(null, bindings_code.source, bindings_code.map);
    });
};
