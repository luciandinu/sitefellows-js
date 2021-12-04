# SiteFellowsJS
 
SiteFellowsJS is a simple JavaScript library that allows you to easily add membership functionality on a website similar to Memberstack.

Alpha Stage
-----------

## Usage

Website head element:
```
<script src="https://cdn.jsdelivr.net/gh/luciandinu/sitefellows-js@latest/dist/sitefellows.min.js" data-site-config="your-site-config.json"></script>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/luciandinu/sitefellows-js@latest/dist/sitefellows.min.css">
```

On protected pages additionally can be added:
```
<noscript>
    <meta http-equiv="refresh" content="0;url=/examples/simple/" />
</noscript>
```

## Requirements

 - Firebase Authentification - for user authenthification