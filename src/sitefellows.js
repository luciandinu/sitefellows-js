import { initializeApp } from 'firebase/app';
import { getAuth, signOut, onAuthStateChanged, signInWithEmailAndPassword } from "firebase/auth";

import SFC from "./constants";
import Utils from "./utils";
import SiteFellowsUI from "./sfui";
import LocalStore from './localstore';

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

//Insert the default CSS for the forms
function insertDefaultCSS(callback) {
    var cssTag = document.createElement('style');
    cssTag.setAttribute('id', 'sf-default-css');
    cssTag.innerHTML = SFC.CSS;
    if (callback) cssTag.onload = callback;
    document.head.appendChild(cssTag);
};

//Getting SiteFellows Configuration
async function initializeConfig() {
    var localSiteConfig = LocalStore.ConfigData;
    var localSiteConfigTimestamp = LocalStore.ConfigDataTimestamp;


    var localSiteConfigTimestampDate = localSiteConfigTimestamp ? new Date(localSiteConfigTimestamp) : null;
    var timestampDifference = new Date(Date.now()) - localSiteConfigTimestampDate;

    if (localSiteConfig && timestampDifference < 600000) {
        //_SITEFELLOWS_CONFIG = JSON.parse(localSiteConfig);
    } else {
        var serverSiteConfigData = Utils.GetScriptAttributeData('data-site-config');
        var serverSiteConfig = await fetchDocumentFromURL('json', serverSiteConfigData);
        LocalStore.ConfigData = serverSiteConfig;
        LocalStore.ConfigDataTimestamp = new Date(Date.now());
    }

};

//Initialize Firebase
function initializeFirebase() {

    //Initializa Firebase
    initializeApp(LocalStore.ConfigData.FIREBASE);

    //Bind Firebase onAuthStateChangedEvent
    const auth = getAuth();
    onAuthStateChanged(auth, (user) => {
        //Store User
        //var storage = window.localStorage;
        if (user) {
            LocalStore.UserData = getUserDataFromFirebaseAuthUserObject(user);
            //storage.setItem('sitefellows-user', JSON.stringify());
        } else {
            LocalStore.UserData = null;
            //storage.removeItem('sitefellows-user');
        }

        if (LocalStore.ConfigData) {
            applyURLRules();
            applyCSSRules();
            SiteFellowsUI.Update();
        }
    });
};


//Helper function to return the user data as an object from the entire Firebase User Object
function getUserDataFromFirebaseAuthUserObject(firebaseUser) {
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
    const auth = getAuth();
    signInWithEmailAndPassword(auth, email, password)
        .then(function (userCredential) {
            // Signed in
            var user = userCredential.user;
            // console.log(user);
            //Store User
            var storage = window.localStorage;
            storage.setItem('sitefellows-user', JSON.stringify(getUserDataFromFirebaseAuthUserObject(user)));
            //Dispatch Login Success Event
            const loginSuccessEvent = new CustomEvent('sitefellows/login');
            document.dispatchEvent(loginSuccessEvent);
            //Redirect to success URL
            if (redirectOnSuccessURL) Utils.RedirectToURL(redirectOnSuccessURL);
            // ...
        })
        .catch(function (error) {
            var errorCode = error.code;
            var errorMessage = error.message;
            // console.warn('Firebase login error:', errorCode, errorMessage);
            //Dispatch Login Error Event
            const loginErrorEvent = new CustomEvent('sitefellows/login-error', { detail: errorMessage });
            document.dispatchEvent(loginErrorEvent);
        });
};

//Sign out the user - firebase
function firebaseSignOut() {
    const auth = getAuth();
    signOut(auth).then(function () {
        // Sign-out successful.
        LocalStore.UserData = null;
    }, function (error) {
        // An error happened.
    });
};

//Add the Default Role and returns the new array
function addDefaultRoleToRolesArray(roles) {
    var authUserRoles = roles ? roles : [];
    if (authUserRoles.includes('none') === false) authUserRoles.push('none');
    return authUserRoles;
};

//Check path if matches the rules
function getRuleBasedOnURLPath() {
    //var rules = _SITEFELLOWS_CONFIG.SITE.rules;
    var rules = LocalStore.ConfigData.SITE.rules;
    // console.log('Rules:', rules);

    var searchResults = []; //this is where we store the results
    const currentPath = window.location.pathname;
    rules.forEach(function (rule) {
        switch (rule.type.toLowerCase()) {
            case 'exact':
                if (matchExactString(rule.path, currentPath)) searchResults.push({ roles: rule.roles, ranking: 2, path: rule.path });
                break;
            case 'starts':
                if (currentPath.startsWith(rule.path)) searchResults.push({ roles: rule.roles, ranking: 1, path: rule.path });
                break;
        }
    });

    //Get the most specific match
    if (searchResults.length > 0) {
        //// console.log(searchResults);
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
            roles: addDefaultRoleToRolesArray(bestRule.roles)
        }
    }
    return;
};

function applyURLRules() {
    let authUser = LocalStore.UserData; //should get an object
    let authUserRoles = LocalStore.UserRolesData ? LocalStore.UserRolesData : []; //should get an array
    let matchingRuleForURL = getRuleBasedOnURLPath();

    authUserRoles = addDefaultRoleToRolesArray(authUserRoles);

    //Appying the rule (if any)
    if (matchingRuleForURL) {
        if (!authUser) {
            //User is not authenticated case
            let redirectURL = LocalStore.ConfigData.SITE.paths.login ? LocalStore.ConfigData.SITE.paths.login : '/';
            console.log("Redirect to login", redirectURL);
            Utils.RedirectToURL(redirectURL);
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
                //User doesn't have the appriate role case
                if (foundRoles.length < matchingRuleForURL.roles.length) {
                    let redirectURL = LocalStore.ConfigData.SITE.paths.restricted ? LocalStore.ConfigData.SITE.paths.restricted : '/';
                    console.log("Redirect to restricted", redirectURL);
                    Utils.RedirectToURL(redirectURL);
                }
            }

        }
    }

};

function applyCSSRules() {
    //What do we hide
    let defaultCSSSelectors = [
        {
            authenticated: false,
            selectors: [
                '[href$="#sf-login"]',
                '.sf-login-form',
                '[href$="#sf-login-modal"]',
                '[href$="#sf-register"]',
                '.sf-register-form',
                '.sf-public-content-only'
            ]
        },
        {
            authenticated: true,
            selectors: [
                '[href$="#sf-logout"]',
                '.sf-authenticated-content-only'
            ]
        }
    ]
    let isUserAuthenticated = LocalStore.UserData ? true : false;
    //Searching
    let foundSelectors = defaultCSSSelectors.filter(function (selector) {
        return (isUserAuthenticated == !selector.authenticated);
    });

    //Getting the acutal selectors
    let allCSSSelectors = foundSelectors.flat().map(function (selector) { return selector.selectors });

    let css = `
    ${allCSSSelectors.join(",")} {
        display: none !important;
        visibility: hidden !important;
    }
    `;

    var cssTag = Utils.DoesHTMLElementExists('#sf-css') ? document.head.querySelector('#sf-css') : document.createElement('style');
    cssTag.setAttribute('id', 'sf-css');


    cssTag.innerHTML = isNotInCMS() ? css : '';
    document.head.appendChild(cssTag);
};

//Returns true is we are not in a CMS editor
function isNotInCMS() {
    //We apply the CSS rules
    var siteCompatibility = Utils.GetScriptAttributeData('data-site-compatibility') ? Utils.GetScriptAttributeData('data-site-compatibility') : 'none';
    //console.log('isNotInCMS SiteFellows', !Utils.IsInCMSEditor(siteCompatibility));
    return !Utils.IsInCMSEditor(siteCompatibility);
};

//-----------
//SiteFellows
//-----------
const SiteFellows = {
    _Init: async function () {

        insertDefaultCSS();
        applyCSSRules();

        //Initialize config
        await initializeConfig();

        //Dispatch Config Loaded Event
        var configLoadedEvent = new Event('sitefellow/config-loaded');
        document.dispatchEvent(configLoadedEvent);

        //Initialize Firebase Auth
        initializeFirebase();

        //Apply UR rules
        applyURLRules();

    },
    //Login User With Email
    UserLoginWithEmail: function (email, password, redirectOnSuccessURL) {
        firebaseSignInWithEmail(email, password, redirectOnSuccessURL);
    },
    //User Sign Out
    UserSignOut: function () {
        firebaseSignOut();
    },

    //Clear Local Storage
    ClearCache: function () {
        LocalStore.UserData = null;
        LocalStore.ConfigData = null;
        LocalStore.ConfigDataTimestamp = null;
        firebaseSignOut();
    }
};


window['SiteFellows'] = SiteFellows;

export default window['SiteFellows'];

