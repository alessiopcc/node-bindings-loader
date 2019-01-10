'use strict';

const child_process = require('child_process');
const fs = require('fs-extra');
const path = require('path');
const rimraf = require('rimraf');
const module_path = path.resolve(__dirname, '..');

function _clean()
{
    console.log('Cleaning folders...');

    rimraf.sync(path.resolve(module_path, 'dist'));

    console.log('Cleaned!');
}

function _copy_src()
{
    console.log('Copying src...');

    // Copy js
    fs.copySync(path.resolve(module_path, 'src'), path.resolve(module_path, 'dist'));

    console.log('Copied!');
}

function _npm_package()
{
    console.log('Preparing package.json...');

    const package_path = path.resolve(module_path, 'dist', 'package.json');
    fs.copySync(path.resolve(module_path, 'package.json'), package_path);
    let package_json = JSON.parse(fs.readFileSync(package_path).toString());
    package_json.private = false;
    package_json.main = 'index.js';
    delete package_json.scripts;
    delete package_json.devDependencies;
    fs.writeFileSync(package_path, JSON.stringify(package_json, null, 4));

    console.log('Prepared!');
}

function _files()
{
    console.log('Copying custom files...');

    const files = ['README.md', 'LICENSE'];
    for(const file of files)
        fs.copySync(path.resolve(module_path, file), path.resolve(module_path, 'dist', file));

    console.log('Copied!');
}

function _npm_publish()
{
    console.log('Publishing package...');

    let result;

    result = child_process.spawnSync('npm', ['publish'], {shell: true, stdio: 'inherit', cwd: path.resolve(module_path, 'dist')});
    if(result.status)
        throw new Error(`Unable to publish package`);

    console.log('Published!');
}

function pack()
{
    console.log('Packing...');

    _clean();
    _copy_src();
    _npm_package();
    _files();

    console.log('Packed!');
}

function publish()
{
    console.log('Publishing...');

    pack();
    _npm_publish();

    console.log('Published!');
}

module.exports = {pack, publish};
