# SiteFellowsJS
 
[WIP] SiteFellowsJS is a simple JavaScript library that allows you to easily add membership functionality on a website similar to Memberstack.

https://sitefellows-js.luciandinu.com/

Alpha Stage
-----------

## Usage

Website head element:
```
<script>
    const firebaseConfig = {
        //Your Firebase configuration
    };
</script>
<script src="https://sf-js-lib.surge.sh/sitefellows.js" data-site-config="your-site-config.json"></script>
```

Optionally we can specify a CMS compatibility mode with the `data-site-compatibility` attribute (currently implemented only `sitejet`)
```
...
<script src="https://sf-js-lib.surge.sh/sitefellows.js" data-site-compatibility="sitejet" data-site-config="your-site-config.json"></script>
```

On protected pages additionally can be added:
```
<noscript>
    <meta http-equiv="refresh" content="0;url=/examples/simple/" />
</noscript>
```

## Requirements

 - Firebase Authentification - for User Authentification
