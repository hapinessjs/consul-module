<img src="http://bit.ly/2mxmKKI" width="500" alt="Hapiness" />

<div style="margin-bottom:20px;">
<div style="line-height:60px">
    <a href="https://travis-ci.org/hapinessjs/consul-module.svg?branch=master">
        <img src="https://travis-ci.org/hapinessjs/consul-module.svg?branch=master" alt="build" />
    </a>
    <a href="https://coveralls.io/github/hapinessjs/consul-module?branch=master">
        <img src="https://coveralls.io/repos/github/hapinessjs/consul-module/badge.svg?branch=master" alt="coveralls" />
    </a>
    <a href="https://david-dm.org/hapinessjs/consul-module">
        <img src="https://david-dm.org/hapinessjs/consul-module.svg" alt="dependencies" />
    </a>
    <a href="https://david-dm.org/hapinessjs/consul-module?type=dev">
        <img src="https://david-dm.org/hapinessjs/consul-module/dev-status.svg" alt="devDependencies" />
    </a>
</div>
<div>
    <a href="https://www.typescriptlang.org/docs/tutorial.html">
        <img src="https://cdn-images-1.medium.com/max/800/1*8lKzkDJVWuVbqumysxMRYw.png"
             align="right" alt="Typescript logo" width="50" height="50" style="border:none;" />
    </a>
    <a href="http://reactivex.io/rxjs">
        <img src="http://reactivex.io/assets/Rx_Logo_S.png"
             align="right" alt="ReactiveX logo" width="50" height="50" style="border:none;" />
    </a>
    <a href="http://hapijs.com">
        <img src="http://bit.ly/2lYPYPw"
             align="right" alt="Hapijs logo" width="75" style="border:none;" />
    </a>
</div>
</div>

# Consul Module

```Consul``` module for the Hapiness framework.

To get started with consul, you can begin with having a look at the [consul official documentation](https://www.consul.io/)


## Table of contents

* [Using your module inside Hapiness application](#using-your-module-inside-hapiness-application)
	* [`yarn` or `npm` it in your `package.json`](#yarn-or-npm-it-in-your-package.json)
* [Using `Consul` inside your hapiness application](#using-consul-inside-your-hapiness-application)
	* [Import the module](#import-the-module)
	* [Bootstrap the extension](#bootstrap-the-extension)
	* [Use the exposed service](#use-the-exposed-service)
* [Contributing](#contributing)
* [Maintainers](#maintainers)
* [License](#license)


## Using your module inside Hapiness application

### `yarn` or `npm` it in your `package.json`

```bash
$ npm install --save @hapiness/core @hapiness/consul rxjs

or

$ yarn add @hapiness/core @hapiness/consul rxjs
```

```javascript
"dependencies": {
    "@hapiness/consul": "^1.0.0",
    "@hapiness/core": "^1.5.1",
    "rxjs": "^5.5.7",
    //...
}
//...
```

## Using `Consul` inside your hapiness application

### Import the module

You need to include ```ConsulModule``` in the ```imports``` section of your module definition.

```typescript

@HapinessModule(
    {
        version: '1.0.0',
        declarations: [/* your declarations */],
        providers: [/* your providers */],
        exports: [/* your exports */],
        imports: [ConsulModule /* other modules */]
    }
)
export class MyModule { /* ... */ }

```

### Bootstrap the extension

You need to inject the extension in bootstrap using setConfig to instantiate the module.

The config properties allowed for the extensions are defined like this:

```typescript

export interface HapinessConsulClientOptions {
    scheme?: string;
    host?: string;
    port?: string;
    defaults?: {
        consistent?: boolean;
        dc?: string;
        stale?: boolean;
        token?: string;
        wait?: string;
        wan?: boolean;
        ctx?: NodeJS.EventEmitter;
        timeout?: number;
    };
    ca?: string;
    baseUrl?: string;
}

```

Then just do like this:

```typescript
Hapiness
    .bootstrap(
        MyModule,
        [
            ConsulExt.setConfig({
                /* Put your config here */
            })
        ])
    .catch(err => done(err));
```


### Use the exposed service

This library is in fact a wrapper of the famous consul node library but wrap all its functions to returns ```rxjs Observable```

You can see the doc [by clicking here](https://www.npmjs.com/package/consul)

We provide a wrapper called ```ConsulService``` exposing a ```client```getter that will allow you to access the consul client.

```typescript

class FooProvider {

    constructor(private _consul: ConsulService) {}

    bar(): Observable<string> {
        // Getting a key from the KV client of consul
    	return this._consul.client.kv.get('hello');
    }


    acquireLock(): void {
        // Create a consul lock
        const lock = this._consul.client.lock({ key: 'test' });

        // Listen to lock events
        lock.on('acquire', () => {
            console.log('lock acquired'));
            lock.release();
        });
        lock.on('release', () => console.log('lock released'));
        lock.on('error', () => console.log('lock error:', err));
        lock.on('end', (err) => console.log('lock released or there was a permanent failure'));

        // Acquire the lock
        lock.acquire();
    }

}

```

[Back to top](#table-of-contents)

## Contributing

To set up your development environment:

1. clone the repo to your workspace,
2. in the shell `cd` to the main folder,
3. hit `npm or yarn install`,
4. run `npm or yarn run test`.
    * It will lint the code and execute all tests.
    * The test coverage report can be viewed from `./coverage/lcov-report/index.html`.


[Back to top](#table-of-contents)

## Maintainers

<table>
    <tr>
        <td colspan="4" align="center"><a href="https://www.tadaweb.com"><img src="http://bit.ly/2xHQkTi" width="117" alt="tadaweb" /></a></td>
    </tr>
    <tr>
        <td align="center"><a href="https://github.com/Juneil"><img src="https://avatars3.githubusercontent.com/u/6546204?v=3&s=117" width="117"/></a></td>
        <td align="center"><a href="https://github.com/antoinegomez"><img src="https://avatars3.githubusercontent.com/u/997028?v=3&s=117" width="117"/></a></td>
        <td align="center"><a href="https://github.com/reptilbud"><img src="https://avatars3.githubusercontent.com/u/6841511?v=3&s=117" width="117"/></a></td>
        <td align="center"><a href="https://github.com/njl07"><img src="https://avatars3.githubusercontent.com/u/1673977?v=3&s=117" width="117"/></a></td>
    </tr>
    <tr>
        <td align="center"><a href="https://github.com/Juneil">Julien Fauville</a></td>
        <td align="center"><a href="https://github.com/antoinegomez">Antoine Gomez</a></td>
        <td align="center"><a href="https://github.com/reptilbud">Sébastien Ritz</a></td>
        <td align="center"><a href="https://github.com/njl07">Nicolas Jessel</a></td>
    </tr>
</table>

[Back to top](#table-of-contents)

## License

Copyright (c) 2018 **Hapiness** Licensed under the [MIT license](https://github.com/hapinessjs/consul-module/blob/master/LICENSE.md).

[Back to top](#table-of-contents)
