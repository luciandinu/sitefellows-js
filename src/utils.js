import SFC from "./constants";

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
    //Returns the value of an attribure on the head sript tage
    GetScriptAttributeData: function (key) {
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


    //Returns true if the code is running inside the CMS Editor
    IsInCMSEditor: function (cms) {
        switch (cms.toLowerCase()) {
            case SFC.CMS_COMPATIBILITY.sitejet:
                return window['editor'] ? true : false;
            default:
                return false;
        }
    }
};




// window['Utils']= Utils;
// export default window['Utils'];

export default Utils;