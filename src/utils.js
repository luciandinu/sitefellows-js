import SFC from "./constants";

//Perfect ATOB/BTOA alternatives (Base64 encoder/decoder) 
//encoded=b2a(str1ng),
//decoded=a2b(encoded);
function b2a(a) {
    var c, d, e, f, g, h, i, j, o, b = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=", k = 0, l = 0, m = "", n = [];
    if (!a) return a;
    do c = a.charCodeAt(k++), d = a.charCodeAt(k++), e = a.charCodeAt(k++), j = c << 16 | d << 8 | e,
        f = 63 & j >> 18, g = 63 & j >> 12, h = 63 & j >> 6, i = 63 & j, n[l++] = b.charAt(f) + b.charAt(g) + b.charAt(h) + b.charAt(i); while (k < a.length);
    return m = n.join(""), o = a.length % 3, (o ? m.slice(0, o - 3) : m) + "===".slice(o || 3);
}

function a2b(a) {
    var b, c, d, e = {}, f = 0, g = 0, h = "", i = String.fromCharCode, j = a.length;
    for (b = 0; 64 > b; b++) e["ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/".charAt(b)] = b;
    for (c = 0; j > c; c++) for (b = e[a.charAt(c)], f = (f << 6) + b, g += 6; g >= 8;) ((d = 255 & f >>> (g -= 8)) || j - 2 > c) && (h += i(d));
    return h;
}
//--------------------

//Returns true if the code is running inside the CMS Editor
function _isInCMSEditor(cms) {
    switch (cms.toLowerCase()) {
        case SFC.CMS_COMPATIBILITY.sitejet:
            return window['editor'] ? true : false;
        default:
            return false;
    }
};

//Returns the value of an attribure on the head sript tage
function _getScriptAttributeData(key) {
    var docH = document.head;
    var hMLKeyData;

    var sElements = docH.querySelectorAll('script');

    sElements.forEach(function (sElement) {
        var mlKey = sElement.getAttribute(key);
        if (mlKey) {
            hMLKeyData = mlKey;
            return;
        }
    });
    return hMLKeyData;
};

//Returns true is we are not in a CMS editor
function _isNotInCMS() {
    //We apply the CSS rules
    var siteCompatibility = Utils.GetScriptAttributeData('data-site-compatibility') ? Utils.GetScriptAttributeData('data-site-compatibility') : 'none';
    //console.log('isNotInCMS SiteFellows', !Utils.IsInCMSEditor(siteCompatibility));
    return !Utils.IsInCMSEditor(siteCompatibility);
};

// Utils
const Utils = {
    //Returns an UUID number
    UUID: function () {
        return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
            (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
        );
    },

    //Check to see if a string is B64 encoded
    //Return true/false
    IsB64: function (str) {
        if (str === '' || str.trim() === '') {
            return false;
        }
        try {
            return btoa(atob(str)) == str;
        } catch (err) {
            return false;
        }
    },

    //Encode a string in a B64encoded string
    B64Encode: function (string) {
        return btoa(unescape(encodeURIComponent(string)));
    },

    //Decode a B64encoded string back into string
    B64Decode: function (string) {
        return decodeURIComponent(escape(atob(string)));
    },

    GetScriptAttributeData: function (key) {
        return _getScriptAttributeData(key);
    },

    //Returns true if an HTML element exists
    DoesHTMLElementExists: function (selector) {
        return document.querySelectorAll(selector).length ? true : false;
    },

    //Returns true if the email is a valid formatted email
    IsEmailAddressValid: function (email) {
        var emailMatch = String(email)
            .toLowerCase()
            .match(
                /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
            );
        return emailMatch ? true : false;
    },

    //Regirect User to a specific URL
    RedirectToURL: function (url) {
        // console.log('Redirecting to:', url);
        //Detect if is in IFRAME
        function inIframe() {
            try {
                return window.self !== window.top;
            } catch (e) {
                return true;
            }
        };
        //Redirect
        if (inIframe()) {
            window.location.replace(url);
        } else {
            window.location.href = url;
        }

    },

    //Show/Hides elements from the CSS query
    //State true = visible; false = not visible
    ShowHideElements: function (query, state) {
        let queryElements = document.querySelectorAll(query);
        queryElements.forEach(function (element) {
            //state ? element.classList.remove('hide') : element.classList.add('hide');
            element.style.visibility = state ? 'visible' : 'hidden !important';
            element.style.display = state ? null : 'none';
        });
    },

    IsInCMSEditor: function (cms) {
        return _isInCMSEditor(cms);
    },

    IsNotInCMS : function(){
        return _isNotInCMS();
    }
};


export default Utils;