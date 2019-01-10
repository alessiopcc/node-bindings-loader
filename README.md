# Node-bindings-loader module
Package to resolve the [node-bindings](https://github.com/TooTallNate/node-bindings) pattern with the compiled bindings at compile time.

To be used in combo with loaders like [native-ext-loader](https://github.com/smt116/node-native-ext-loader)

## Installation
```sh
npm install --save-dev node-bindings-loader
```

## Usage
Update rules entry in the Webpack configuration file:
```javascript
module: {
    rules: [{
        test: /\.js$/,
        loader: "node-bindings-loader"
    }];
}
```

## License
[MIT](https://github.com/alessiopcc/ps-watchdog/blob/master/LICENSE)

## Author
Alessio Paccoia <<alessio.paccoia@cubbit.io>>
