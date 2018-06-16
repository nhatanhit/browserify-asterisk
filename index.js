var pathModule = require('path');
var transformTools = require('browserify-transform-tools');
var fs = require('fs');


function getCartridgePath(moduleDirectory,cartridgeFilePath) {
    if (!fs.existsSync(cartridgeFilePath)) {
        throw new Error('Can not file file ' + cartridgeFilePath);
    }
    var configureObject = JSON.parse(fs.readFileSync(cartridgeFilePath, 'utf8'));
    var configureCartridges = Object.keys(configureObject);
    var isExist = false;
    
    var delimiter = '';
    if(process.platform === 'win32') {
        delimiter = '\\';
    } else {
        delimiter = '/';
    }
    
    for(var i = 0; i < configureCartridges.length;i++) {
        if(configureCartridges[i] == moduleDirectory) {
            isExist = true;
            break;
        }
        
    } 
    if(!isExist) {
        throw new Error('Your cartridge path is not found in cartridge configuration file ' + moduleDirectory);
    }
    
    //check current cartridge
    if(configureObject[moduleDirectory].cartridge_path === '') {
        throw new Error('Cartridge path is not configured ' + moduleDirectory);
    }
    var  cartridgePath = ''; 
    cartridgePath = configureObject[moduleDirectory].cartridge_path;
    return cartridgePath;
}
function getModulePath(callerFile , cartridgePath,requiredPath) {
    try {
        var basedir =  pathModule.resolve(__dirname,'../../');
        var cartridgesInCTPaths = cartridgePath.split(":");
        var resultPath = '';
        if(process.platform === 'win32') {
            delimiter = '\\\\';
            //change the require path with corresponding delimiter
            requiredPath = requiredPath.replace(/\//g,delimiter);
            basedir = basedir.replace(/\\/g,"\\\\");
        } else {
            delimiter = '/';
        }
        var loadedCartridge = '';
        //identify the cartridge will be loaded
        for(var i = 0; i < cartridgesInCTPaths.length ; i++) {
            var fullPath = basedir + delimiter + cartridgesInCTPaths[i] + delimiter + requiredPath.substr(1) + '.js';
            if (fs.existsSync(fullPath)) {
                loadedCartridge = cartridgesInCTPaths[i];
                break;
            }
        }
        //build the path 
        var fullPathLoadedModule = pathModule.resolve(__dirname,'../../' + loadedCartridge + '/' + requiredPath.substr(1) + '.js');
        var currentExecuteFilePath = pathModule.resolve(__dirname,callerFile);
        var relativePath = pathModule.relative(currentExecuteFilePath,fullPathLoadedModule);
        if(process.platform === 'win32') {
            relativePath = relativePath.replace(/\\/g,'/');
        }
        relativePath = relativePath.replace(/..\//,'');
        if(relativePath.substring(0,3) !== '../') {
            relativePath = './' + relativePath;
        }
        relativePath = relativePath.replace('.js','');
        return relativePath;
    } catch(ex) {
        console.log(ex);
    }
    
}
var options = { 
    evaluateArguments: true
};
var myTransform = transformTools.makeRequireTransform("requireTransform", options,
    function(args, opts, cb) {
        var requirePath = args[0];
        var currentCartridge = opts.config.directory;
        if(requirePath[0] === '*') {
            var callerFile = opts.file;
            var cartridgePathConfigFile = pathModule.resolve(__dirname,'../../cartridgepath.json');
            var cartridgePath =  getCartridgePath(currentCartridge,cartridgePathConfigFile);
            var resultPath =  getModulePath(callerFile , cartridgePath,requirePath);
            var requirePath = 'require("' + resultPath + '")';
            return cb(null,requirePath);

        } else {
            return cb();
        }
        
    }
);
module.exports = myTransform;