# SiteFellowJS
 
SiteFellowsJS is a simple JavaScript library that allows you to easily add membership functionality to your website.

Alpha Stage
-----------

## Usage

Website head element:
```
<script src="https://cdn.jsdelivr.net/gh/luciandinu/sitefellows-js/dist/sitefellows.min.js" data-site-config="your-url-to-config.json"></script>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/luciandinu/sitefellows-js/dist/sitefellows.min.css">
```

On protected pages additionally can be added:
```
<noscript>
    <style>html:not(.edit){display:none;}</style>
    <meta http-equiv="refresh" content="0;url=/examples/simple/" />
</noscript>
```

## Requirements

 - Firebase Authentification - for user authenthification