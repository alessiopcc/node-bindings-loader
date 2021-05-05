// @ts-nocheck
const {OriginalSource, SourceMapSource, ReplaceSource} = require("webpack-sources");
const {dirname, relative} = require('path');
const {runInNewContext} = require('vm');

const SUPPORTED_PACKAGES = {
    'bindings': _bindings,
    'node-gyp-build': _node_gyp_build,
}

function _bindings(loader, match, code)
{
    return new Promise((resolve, reject) =>
    {
        loader.resolve(loader.context, 'bindings', (error, module_path) =>
        {
            if(error)
                return reject(error);

            try
            {
                const node_module = require(module_path);

                const args = {
                    bindings: runInNewContext(match[1], {
                        __dirname: dirname(loader.resourcePath),
                        __filename: loader.resourcePath,
                    }),
                    path: true,
                    module_root: node_module.getRoot(loader.resourcePath),
                };

                const resolve_path = relative(dirname(loader.resourcePath), node_module(args)).replace(/\\/g, '/');
                code.replace(match.index, match.index + match[0].length - 1, `require('./${resolve_path}')`);
            }
            catch(module_error)
            {
                return reject(module_error);
            }

            return resolve();
        });
    });
}

function _node_gyp_build(loader, match, code)
{
    return new Promise((resolve, reject) =>
    {
        loader.resolve(loader.context, 'node-gyp-build', (error, module_path) =>
        {
            if(error)
                return reject(error);

            try
            {
                const node_module = require(module_path);

                const args = runInNewContext(match[1], {
                    __dirname: dirname(loader.resourcePath),
                    __filename: loader.resourcePath,
                });

                const resolve_path = relative(dirname(loader.resourcePath), node_module.path(args)).replace(/\\/g, '/');
                code.replace(match.index, match.index + match[0].length - 1, `require('./${resolve_path}')`);
            }
            catch(module_error)
            {
                return reject(module_error);
            }

            return resolve();
        });
    });
}

module.exports = async function(source, map)
{
    const callback = this.async();

    const balanced_parenthesis_regex = '\\(((?:[^)(]+|\\((?:[^)(]+|\\([^)(]*\\))*\\))*)\\)'

    const code = new ReplaceSource(map ? new SourceMapSource(source, this.resourcePath, map) : new OriginalSource(source, this.resourcePath));

    try
    {
        for(const package of Object.keys(SUPPORTED_PACKAGES))
        {
            const regex = new RegExp(`\\brequire\\((?:'|")${package}(?:'|")\\)\\s*${balanced_parenthesis_regex}`, 'g');

            while(match = regex.exec(source))
                await SUPPORTED_PACKAGES[package](this, match, code);
        }
    }
    catch(error)
    {
        return callback(error);
    }

    const loader_code = code.sourceAndMap();
    return callback(null, loader_code.source, loader_code.map);
};
