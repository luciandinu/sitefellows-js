//Constans used within the app
const SFConstants = {
    //Site config
    SITE: {},
    //Usign Firebase SDK 7.9.1
    FIREBASE: {
        // AppJs: "https://www.gstatic.com/firebasejs/7.9.1/firebase-app.js",
        // AuthJS: "https://www.gstatic.com/firebasejs/7.9.1/firebase-auth.js"
        //Usign Firebase SDK 8.10.0
        AppJs: "https://www.gstatic.com/firebasejs/8.10.0/firebase-app.js",
        AuthJS: "https://www.gstatic.com/firebasejs/8.10.0/firebase-auth.js"
    },
    CMS_COMPATIBILITY: {
        sitejet: "sitejet"
    },
    EVENTS: {
        loginSuccess: "sitefellows/login",
        loginError: "sitefellows/login-error",
        configLoaded: "sitefellow/config-loaded",
        configLoadedAndHTMLLoaded: "sitefellow/config-and-html-loaded"
    }

}

// Utils
const SFUtils = {
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
    //Returns true if an HTML element exists
    CheckIfHTMLElementExists: function (selector) {
        return document.querySelectorAll(selector).length ? true : false;
    },
    //Returns true if the email is a valid formatted email
    CheckIfEmailAddressIsValid: function (email) {
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
        window.location.href = url;
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
    //Shows or hide the loaded
    ShowLoader: function (state) {
        SFUtils.ShowHideElements('html', !state);
    },
    //Returns the new selector (string) compatible with the specified CMS
    MakeSelectorCompatibleWithCMS: function (selector, cms) {
        switch (cms.toLowerCase()) {
            case SFConstants.CMS_COMPATIBILITY.sitejet:
                return 'body:not(.edit) ' + selector;
            default:
                return selector;
        }
    },
    //Returns true if the code is running inside the CMS Editor
    IsInCMSEditor: function (cms) {
        switch (cms.toLowerCase()) {
            case SFConstants.CMS_COMPATIBILITY.sitejet:
                return window.editor ? true : false;
            default:
                return false;
        }
    },
    GetLocalStoreConfig: function () {
        var storage = window.localStorage;
        var localData = storage.getItem('sitefellows-config');
        return localData ? JSON.parse(localData) : null;
    },
    GetLocalStoreUser: function () {
        var storage = window.localStorage;
        var localData = storage.getItem('sitefellows-user');
        return localData ? JSON.parse(localData) : null;
    },
    GetLocalStoreUserRoles: function () {
        var storage = window.localStorage;
        var localData = storage.getItem('sitefellows-user-roles');
        return localData ? JSON.parse(localData) : null;
    }
};

//-----------
//SiteFellows
//-----------
const SiteFellows = (function () {
    var _SITEFELLOWS_CONFIG;

    //Returns the value of an attribure on the head sript tage
    function getScriptAttributeData(key) {
        var docH = document.head;
        var hMLKeyData;

        sElements = docH.querySelectorAll('script');

        sElements.forEach(function (sElement) {
            var mlKey = sElement.getAttribute(key);
            if (mlKey) {
                hMLKeyData = mlKey;
                return;
            }
        });
        // console.log(hData);
        return hMLKeyData;
    };

    //Fetch a JSON from URL
    //type can be: json or text
    async function fetchDocumentFromURL(type, url) {
        try {
            const response = await fetch(url);
            return await ((type = 'json') ? response.json() : response.text());
        } catch (err) {
            // There was an error
            console.warn('File fetching error:', err);
        }
    };

    //Create a script tag in the head of the page
    function createScriptTag(url, callback) {
        var scriptTag = document.createElement('script');
        scriptTag.setAttribute('src', url);
        if (callback) scriptTag.onload = callback;
        document.head.appendChild(scriptTag);
    };

    //Getting SiteFellows Configuration
    async function initializeConfig() {
        var storage = window.localStorage;
        var localSiteConfig = storage.getItem('sitefellows-config');
        var localSiteConfigTimestamp = storage.getItem('sitefellows-config-timestamp');
        var localSiteConfigTimestampDate = localSiteConfigTimestamp ? new Date(localSiteConfigTimestamp) : null;
        var timestamDifference = new Date(Date.now()) - localSiteConfigTimestampDate;

        if (localSiteConfig && timestamDifference < 600000) {
            _SITEFELLOWS_CONFIG = JSON.parse(localSiteConfig);
        } else {
            var serverSiteConfigData = getScriptAttributeData('data-site-config');
            var serverSiteConfig = await fetchDocumentFromURL('json', serverSiteConfigData);
            localStorage.setItem('sitefellows-config', JSON.stringify(serverSiteConfig));
            storage.setItem('sitefellows-config-timestamp', new Date(Date.now()));
            _SITEFELLOWS_CONFIG = serverSiteConfig;

        }


    };

    //Initializa Firebase
    function initializeFirebase() {
        createScriptTag(SFConstants.FIREBASE.AppJs, function () {
            createScriptTag(SFConstants.FIREBASE.AuthJS, function () {
                // Initialize Firebase
                firebase.initializeApp(_SITEFELLOWS_CONFIG.FIREBASE);
                // console.log('initializeFirebase:', firebase);
                bindFirebaseOnAuthStateChangedEvent();

            });
        });

    };

    function bindFirebaseOnAuthStateChangedEvent() {
        firebase.auth().onAuthStateChanged((user) => {
            //Store User
            var storage = window.localStorage;
            if (user) {
                storage.setItem('sitefellows-user', JSON.stringify(getUserDataFromFirebaseAuthUser(user)));
            } else {
                storage.removeItem('sitefellows-user');
            }

            // Pass response to a call back func to update state
            // console.log('onAuthStateChanged', user);

            applyURLRules();
            SiteFellowsUI.Update();



        });
    }
    //Helper function to return the user data as an object from the entire Firebase User Object
    function getUserDataFromFirebaseAuthUser(firebaseUser) {
        return firebaseUser ? {
            displayName: firebaseUser.displayName,
            email: firebaseUser.email,
            emailVerified: firebaseUser.emailVerified,
            photoURL: firebaseUser.photoURL,
            creationTime: firebaseUser.metadata.creationTime,
            lastSignInTime: firebaseUser.metadata.lastSignInTime,
            uid: firebaseUser.uid,
            refreshToken: firebaseUser.refreshToken
        } : null;
    }

    //Helper function to match an exact string
    function matchExactString(rule, str) {
        var match = str.match(rule);
        return match && str === match[0];
    };

    //Sign in the user - firebase
    function firebaseSignInWithEmail(email, password, redirectOnSuccessURL) {
        firebase.auth().signInWithEmailAndPassword(email, password)
            .then(function (userCredential) {
                // Signed in
                var user = userCredential.user;
                // console.log(user);
                //Store User
                var storage = window.localStorage;
                storage.setItem('sitefellows-user', JSON.stringify(getUserDataFromFirebaseAuthUser(user)));
                //Dispatch Login Success Event
                const loginSuccessEvent = new CustomEvent('sitefellows/login');
                document.dispatchEvent(loginSuccessEvent);
                //Redirect to success URL
                if (redirectOnSuccessURL) SFUtils.RedirectToURL(redirectOnSuccessURL);
                // ...
            })
            .catch(function (error) {
                var errorCode = error.code;
                var errorMessage = error.message;
                console.warn('Firebase login error:', errorCode, errorMessage);
                //Dispatch Login Error Event
                const loginErrorEvent = new CustomEvent('sitefellows/login-error', { detail: errorMessage });
                document.dispatchEvent(loginErrorEvent);
            });
    };

    //Sign out the user - firebase
    function firebaseSignOut() {
        firebase.auth().signOut().then(function () {
            // Sign-out successful.
            var storage = window.localStorage;
            storage.removeItem('sitefellows-user');
        }, function (error) {
            // An error happened.
        });
    };

    //Check path if matches the rules
    function getRuleBasedOnURLPath() {
        var rules = _SITEFELLOWS_CONFIG.SITE.rules;
        // console.log('Rules:', rules);

        var searchResults = []; //this is where we store the results
        const currentPath = window.location.pathname;
        rules.forEach(function (rule) {
            switch (rule.type.toLowerCase()) {
                case 'exact':
                    if (matchExactString(rule.path, currentPath)) searchResults.push({ roles: rule.roles, ranking: 2, path: rule.path });
                    break;
                case 'starstwith':
                    if (currentPath.startsWith(rule.path)) searchResults.push({ roles: rule.roles, ranking: 1, path: rule.path });
                    break;
            }
        });

        //Get the most specific match
        if (searchResults.length > 0) {
            // console.log(searchResults);
            var maxRanking = 0;
            var bestMatchingPath = 0;
            var bestRule;
            searchResults.forEach(function (match) {
                maxRanking = match.ranking > maxRanking ? match.ranking : maxRanking;
                bestMatchingPath = match.path.length > bestMatchingPath ? match.path.length : bestMatchingPath;
                if (bestMatchingPath == match.path.length && maxRanking == match.ranking) bestRule = match;
                // console.log('maxRanking:', maxRanking);
                // console.log('bestMatchingPath:', bestMatchingPath);
                // console.log('bestRule:', bestRule);
            });
            return {
                path: bestRule.path,
                roles: bestRule.roles
            }
        }
        return;
    };

    function applyURLRules() {
        let authUser = SFUtils.GetLocalStoreUser(); //should get an object
        let authUserRoles = SFUtils.GetLocalStoreUserRoles(); //should get an array
        let matchingRuleForURL = getRuleBasedOnURLPath() ? getRuleBasedOnURLPath() : null;

        // console.log('matchingRuleForURL', matchingRuleForURL);
        // console.log('authUserRoles', authUserRoles);
        //Appying the rule (if any)
        if (matchingRuleForURL) {
            if (!authUser) {
                //User is not authenticated case
                let redirectURL = _SITEFELLOWS_CONFIG.SITE.paths.login ? _SITEFELLOWS_CONFIG.SITE.paths.login : '/';
                // console.log("Redirect to login", redirectURL);
                SFUtils.RedirectToURL(redirectURL);
            } else {
                //User is authenticated case
                if (authUserRoles) {
                    var foundRoles = authUserRoles.filter(function (authRole) {
                        let foundRole;
                        if (matchingRuleForURL.roles) {
                            matchingRuleForURL.roles.forEach(function (mRole) {
                                if (mRole == authRole) foundRole = authRole;
                            })
                        };
                        return foundRole;

                    });
                    // console.log("foundRoles", foundRoles)
                    //User doesn't have the appriate role case
                    if (foundRoles.length == 0) {
                        let redirectURL = _SITEFELLOWS_CONFIG.SITE.paths.restricted ? _SITEFELLOWS_CONFIG.SITE.paths.restricted : '/';
                        // console.log("Redirect to restricted", redirectURL);
                        SFUtils.RedirectToURL(redirectURL);
                    }
                }

            }
        }

    };

    return {
        _Init: async function () {

            await initializeConfig();

            //Dispatch the Config Loaded Event
            const configLoadedEvent = new Event('sitefellow/config-loaded');
            document.dispatchEvent(configLoadedEvent);

            //Initialize Firebase Auth
            initializeFirebase();

            document.addEventListener('sitefellow/config-loaded', function () {

                //If we are in a CMS ditor we exit
                if (!SFUtils.IsInCMSEditor(SFUtils.GetLocalStoreConfig().SITE.options.cmsCompatibility)) {

                    //Apply URL rules
                    applyURLRules();
                };


            });



        },
        UserLoginWithEmail: function (email, password, redirectOnSuccessURL) {
            firebaseSignInWithEmail(email, password, redirectOnSuccessURL);
        },
        UserSignOut: function () {
            firebaseSignOut();
        },
        //Clear Local Storage
        ClearCache: function () {
            var storage = window.localStorage;
            storage.removeItem('sitefellows-config');
            storage.removeItem('sitefellows-config-timestamp');
            storage.removeItem('sitefellows-user');
            firebaseSignOut();
        }
    }
})();


//--------------
//SiteFellows UI
const SiteFellowsUI = (function () {
    function showFormErrorMessage(errorSelector, message) {
        errorSelector.innerText = message;
        errorSelector.classList.add('show');
    };
    function checkIfFormFieldIsEmpty(fieldSelector, errorMessageSelector, message) {
        if (fieldSelector.value.length == 0) {
            showFormErrorMessage(errorMessageSelector, message);
            return true;
        }
        return false;
    };
    function checkIfEmailFieldIsValid(fieldSelector, errorMessageSelector, message) {
        if (!SFUtils.CheckIfEmailAddressIsValid(fieldSelector.value)) {
            showFormErrorMessage(errorMessageSelector, message);
            return true;
        }
        return false;
    };
    //Cycle function - can be run every time we need to update what it's on the page
    function updateUI() {
        var storage = window.localStorage;
        let userData = SFUtils.GetLocalStoreUser();

        //If we are in a CMS ditor we exit
        if (!SFUtils.IsInCMSEditor(SFUtils.GetLocalStoreConfig().SITE.options.cmsCompatibility)) {

            //Remove all modals
            let allModals = document.querySelectorAll('.sf-generated-modal');
            allModals.forEach(function (modalElement) {
                modalElement.remove();
            });

            //Check Links/Buttons
            if (SFUtils.CheckIfHTMLElementExists('[href="#sf-login"]')) SFUtils.ShowHideElements('[href="#sf-login"]', userData ? false : true);
            if (SFUtils.CheckIfHTMLElementExists('[href="#sf-login-modal"]')) SFUtils.ShowHideElements('[href="#sf-login-modal"]', userData ? false : true);
            if (SFUtils.CheckIfHTMLElementExists('[href="#sf-register"]')) SFUtils.ShowHideElements('[href="#sf-register"]', userData ? false : true);
            if (SFUtils.CheckIfHTMLElementExists('[href="#sf-logout"]')) SFUtils.ShowHideElements('[href="#sf-logout"]', userData ? true : false);
            //Check Forms
            if (SFUtils.CheckIfHTMLElementExists('.sf-login-form')) SFUtils.ShowHideElements('.sf-login-form', userData ? false : true);
            if (SFUtils.CheckIfHTMLElementExists('.sf-register-form')) SFUtils.ShowHideElements('.sf-register-form', userData ? false : true);

        };

        //Hide the loaded if there is any
        if (SFUtils.GetLocalStoreConfig()) SFUtils.ShowLoader(false);
    };
    //Create a modal and return its selector
    function createModalAndReturnContentSelector(title = '', footer = '') {
        const modalID = `data-id="${SFUtils.UUID()}"`;
        const footerMarkup = footer ? `<div class="sh-footer">${footer}</div>` : '';
        let modalMarkup = `
        <div class="sf-modal-container" ${modalID}>
        <div class="sf-modal">
            <div class="sf-header">
                <h3>${title}</h3>
                <div class="sf-button"></div>
            </div>
            <div class="sf-content"></div>
            ${footerMarkup}
        </div>
        </div>`;
        var modalContentElement = document.createElement("div");
        modalContentElement.classList.add('sf-generated-modal');
        modalContentElement.innerHTML = modalMarkup
        document.querySelector('body').appendChild(modalContentElement);
        //Bind the default events
        var closeButton = document.querySelector('[' + modalID + '].sf-modal-container .sf-button');
        closeButton.addEventListener('click', function (e) {
            // console.log("bla");
            modalContentElement.remove();
        })
        //var modalBackground
        return `.sf-modal-container[${modalID}] .sf-content`;
    };
    function renderLogin(container, redirectOnSuccessURL) {
        const formID = `data-id="${SFUtils.UUID()}"`;
        const formMarkup = `
        <div class="sf-login-form sf-form-container" ${formID}>
        <div class="sf-form">
            <div class="sf-form-field">
                <label for="sf-login-user-email">Email</label>
                <input type="email" name="sf-login-user-email" id="sf-login-user-email" placeholder="your.email@example.com">
            </div>

            <div class="sf-form-field">
                <label for="sf-login-user-pass">Password</label>
                <input type="password" name="sf-login-user-pass" id="sf-login-user-pass" placeholder="Enter your password">
            </div>
            <div class="sf-error-message">Error Message</div>
            <button class="sf-button submit">Log in</button>
        </div>
    </div>`;
        if (SFUtils.CheckIfHTMLElementExists(container)) {
            const formIDSelector = '[' + formID + ']';
            var formSubmitSignature; //Used to determine what form has submitted the request
            document.querySelector(container).innerHTML = formMarkup;
            var loginForm = document.querySelector(formIDSelector + '.sf-login-form');
            var loginEmail = document.querySelector(formIDSelector + '.sf-login-form #sf-login-user-email');
            var loginPass = document.querySelector(formIDSelector + '.sf-login-form #sf-login-user-pass');
            var errorMessage = document.querySelector(formIDSelector + '.sf-login-form .sf-error-message');
            var loginButton = document.querySelector(formIDSelector + '.sf-login-form .sf-button.submit');
            //Validate Form
            function validateLoginForm(email, pass, message) {
                var hasError = checkIfFormFieldIsEmpty(email, message, "Email can't be empty.");
                if (hasError) return false;
                var hasError = checkIfEmailFieldIsValid(email, message, "Email address is not valid.");
                if (hasError) return false;
                var hasError = checkIfFormFieldIsEmpty(pass, message, "Password can't be empty.");
                if (hasError) return false;
                return true;
            }
            //Submit Login
            loginButton.addEventListener("click", function (e) {
                errorMessage.classList.remove('show');
                if (validateLoginForm(loginEmail, loginPass, errorMessage)) {
                    loginForm.classList.add('load');
                    formSubmitSignature = formID;
                    SiteFellows.UserLoginWithEmail(loginEmail.value, loginPass.value, redirectOnSuccessURL);
                };
            });
            //Handle Login Error
            document.addEventListener('sitefellows/login-error', function (e) {
                if (formSubmitSignature == formID) showFormErrorMessage(errorMessage, e.detail);
                loginForm.classList.remove('load');
            });
            //Handle Login Success
            document.addEventListener('sitefellows/login', function (e) {
                loginForm.classList.remove('load');
                updateUI();
            });
        }

    };
    //Bind the click event for login or register buttons
    function bindClickToSiteRedirect(selector, redirectKey, callbackFunction) {
        if (SFUtils.CheckIfHTMLElementExists(selector)) {
            let htmlElement = document.querySelector(selector);
            htmlElement.addEventListener('click', function (e) {
                let localConfig = SFUtils.GetLocalStoreConfig();
                if (callbackFunction) callbackFunction();
                SFUtils.RedirectToURL(localConfig.SITE.paths[redirectKey] ? localConfig.SITE.paths[redirectKey] : '');
                e.preventDefault();
                e.stopPropagation();
            })
        }
    };
    //Bind all elements events
    function bindUIEvents() {
        //If we are in a CMS ditor we exit
        if (!SFUtils.IsInCMSEditor(SFUtils.GetLocalStoreConfig().SITE.options.cmsCompatibility)) {

            //Login + Register Buttons for redirect
            bindClickToSiteRedirect('[href="#sf-login"]', 'login');
            bindClickToSiteRedirect('[href="#sf-register"]', 'register');
            bindClickToSiteRedirect('[href="#sf-logout"]', '', function () {
                SiteFellows.UserSignOut();
            });

            //Login Modal Button
            let loginModalSelector = '[href="#sf-login-modal"]';
            if (SFUtils.CheckIfHTMLElementExists(loginModalSelector)) {
                let loginModalButton = document.querySelector(loginModalSelector);
                loginModalButton.addEventListener('click', function (e) {
                    let loginContentSelector = createModalAndReturnContentSelector('Login');
                    renderLogin(loginContentSelector);
                    e.preventDefault();
                    e.stopPropagation();
                })
            }
        }
    };
    //Check if Config + HTML is loaded - if true it will raise an Event
    function checkIfConfigLoadedAndHTMLIsLoaded() {
        //Check if Config + HTML is loaded
        var configLoaded = false;
        var htmlLoaded = false;
        document.addEventListener('sitefellow/config-loaded', function () {
            configLoaded = true;
            isConfigLoadedAndHTMLLoaded();
            // console.log('UI sitefellow/config-loaded');
        });

        document.addEventListener('DOMContentLoaded', function (e) {
            htmlLoaded = true;
            isConfigLoadedAndHTMLLoaded()
            // console.log('UI DOMContentLoaded');
        });
        function isConfigLoadedAndHTMLLoaded() {
            //Dispatch the Config+HTML Loaded Event
            if (configLoaded && htmlLoaded) {
                const configLoadedAndHTMLLoaded = new Event('sitefellow/config-and-html-loaded');
                document.dispatchEvent(configLoadedAndHTMLLoaded);
                // console.log("configLoaded", configLoaded, "htmlLoaded", htmlLoaded);
                // console.log('UI sitefellow/config-and-html-loaded');
            }
        }
    };
    return {
        _Init: function () {
            //Make sure that we've loaded the Config + HTML
            checkIfConfigLoadedAndHTMLIsLoaded();
            document.addEventListener('sitefellow/config-and-html-loaded', function () {
                //Bing UI events and update the page after the html content is loaded
                bindUIEvents();
                updateUI();
            })

        },
        //Render the login form in the container selector
        //Redirects to url after successful login
        RenderLoginForm: function (container, redirectOnSuccessURL) {
            renderLogin(container, redirectOnSuccessURL);

        },
        RenderLoginModal: function (redirectOnSuccessURL) {
            var loginContentSelector = createModalAndReturnContentSelector('Login');
            renderLogin(loginContentSelector);
        },
        DisplayRule: function (container, visibility, roles) {

        },
        //Refresh the page - reapplies the rules  show/hide elements
        Update: function () {
            updateUI();
        }
    }
})();


SFUtils.ShowLoader(true);
SiteFellows._Init();
SiteFellowsUI._Init();