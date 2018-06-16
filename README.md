# browserify-asterisk
Browserify-asterisk is one of browserify transformer which is used to transform require JS path 
```javascript
require(*/path/to/module)
```
to corresponding module (The target module is chosen from list of cartridges in cartridge paths. These cartridge paths is set in configuration file cartridgepath.json)

## Getting Started

```shell
npm install browserify-asterisk
```
Edit grunt file to integrate browserify-asterisk with browserify

```javascript
name_js_task: {
    files: [
        //js lists
    ],
    options: {
        browserifyOptions: {
            //options
        },
        transform: [
            ['browserify-asterisk',{directory: 'name of cartridge'}]
        ]
    }
}
```
## cartridgepath.json

```javascript
{
    "cartridge_one": {
        "cartridge_path": "base_cartridge_one:base_cartridge_two:cartridge_one"
    },
    "cartridge_two": {
        "cartridge_path": "base_cartridge_one:base_cartridge_two:cartridge_two"
    },
    "cartridge_three": {
        "cartridge_path": "base_cartridge_one:base_cartridge_two:cartridge_three"
    }
}

```
browserify-asterisk checks which cartridge it is running on, then iterate all cartridge in appropriate cartridge path, the iteration will end whenever the target module is found / or not found in every cartridge in appropriate cartridge path

The parameter directory in below statement is required 

```javascript
['browserify-asterisk',{directory: 'name of cartridge'}]
```

## note with grunt-browserify
grunt-browserify build js modules with asynchrouns mode but browserify-asterisk  is unable to transform js modules that grunt-browserify is running on. The solution for this issue is you should design your js tasks with synchronous mode.    
