# SiteFellowsJS
 
SiteFellowsJS is a simple JavaScript library that allows you to easily add membership functionality on a website similar to Memberstack.

Alpha Stage
-----------

## Usage

Website head element:
```
<script src="https://sf-js-lib.surge.sh/sitefellows.js" data-site-config="your-site-config.json"></script>
```

On protected pages additionally can be added:
```
<noscript>
    <meta http-equiv="refresh" content="0;url=/examples/simple/" />
</noscript>
```

## Requirements

 - Firebase Authentification - for User Authentification