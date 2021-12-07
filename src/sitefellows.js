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

    //Initialize Firebase
    if (firebaseConfig) {
        //If we have the firebaseConfig object we are going to use it
        initializeApp(firebaseConfig);
    } else {
        //Get the firebaseConfig from the config file
        initializeApp(LocalStore.ConfigData.firebaseConfig);
    }

    //Bind Firebase onAuthStateChangedEvent
    const auth = getAuth();
    onAuthStateChanged(auth, (user) => {
        //Store User
        //var storage = window.localStorage;
        if (user) {
            console.log(user);
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
            //console.log(user);
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

//Check path if matches the rules
function getRuleBasedOnURLPath() {
    //var rules = _SITEFELLOWS_CONFIG.rules;
    var rules = LocalStore.ConfigData.rules;
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
            roles: bestRule.roles ? bestRule.roles : []
        }
    }
    return;
};

function applyURLRules() {
    let isUserAuthenticated = LocalStore.UserData ? true : false;
    let userRoles = LocalStore.UserRolesData ? LocalStore.UserRolesData : [];
    let pageRules = getRuleBasedOnURLPath();
    let pageRoles = getRuleBasedOnURLPath() ? getRuleBasedOnURLPath().roles : [];

    console.log("userRoles", userRoles);
    console.log("pageRoles", pageRoles);

    if (pageRules) {
        if (!isUserAuthenticated) {
            //User is not authenticated case
            let redirectURL = LocalStore.ConfigData.paths.login ? LocalStore.ConfigData.paths.login : '/';
            console.log("Redirect to login", redirectURL);
            Utils.RedirectToURL(redirectURL);

        } else {
            //Appying the rule (if any)
            if (pageRoles.length > 0) {
                //User is authenticated case
                if (userRoles) {
                    // console.log('pageRoles', pageRoles);
                    // console.log('userRoles', userRoles);
                    if (pageRoles.length > 0) {
                        var foundRoles = pageRoles.filter(function (aPageRole) {
                            return userRoles.includes(aPageRole);
                        });
                    };

                    console.log('applyURLRules - foundRoles', foundRoles);
                    //User doesn't have the appriate role case
                    //if (foundRoles.length < pageRoles.length) {
                    if (foundRoles.length == 0) {
                        let redirectURL = LocalStore.ConfigData.paths.restricted ? LocalStore.ConfigData.paths.restricted : '/';
                        console.log("Redirect to restricted", redirectURL);
                        Utils.RedirectToURL(redirectURL);
                    }
                }
            }

        }
    }

};

//It returns an array of CSS selectors
function getCSSSelectorsBasedOnRules() {
    let isUserAuthenticated = LocalStore.UserData ? true : false;
    let userRoles = LocalStore.UserRolesData ? LocalStore.UserRolesData : [];
    //let pageRoles = getRuleBasedOnURLPath() ? getRuleBasedOnURLPath().roles : [];
    let allPagesRoles = LocalStore.ConfigData.roles ? LocalStore.ConfigData.roles : [];


    if (isUserAuthenticated) {


        console.log('userRoles', userRoles);
        if (allPagesRoles.length > 0) {
            var foundRoles = allPagesRoles.filter(function (aPageRole) {
                return !userRoles.includes(aPageRole);
            });
        };
        console.log('getCSSSelectorsBasedOnRules - foundRoles', foundRoles);
        return foundRoles ? foundRoles : [];

    }

    console.log('allPagesRoles !!!!!!!!', allPagesRoles);
    return allPagesRoles;

};

function applyCSSRules() {
    let rolesCSS = getCSSSelectorsBasedOnRules().map(function (aRole) {
        return '.sf-role-' + aRole;
    });
    //console.log('rolesCSS',rolesCSS);
    //What do we hide
    let defaultCSSSelectors = [
        {
            authenticated: false,
            selectors: [
                '[href$="#sf-login"]',
                '[href$="#sf-login-modal"]',
                '.sf-login-button',
                '.sf-login-modal-button',
                '.sf-login-form',
                '[href$="#sf-register"]',
                '[href$="#sf-register-modal"]',
                '.sf-register-form',
                '.sf-register-button',
                '.sf-public-content'
            ]
        },
        {
            authenticated: true,
            selectors: [
                '[href$="#sf-logout"]',
                '.sf-logout-button',
                '.sf-authenticated-content'
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
    ${[...allCSSSelectors, ...rolesCSS].join(",")} {
        display: none !important;
        visibility: hidden !important;
    }
    `;

    var cssTag = Utils.DoesHTMLElementExists('#sf-css') ? document.head.querySelector('#sf-css') : document.createElement('style');
    cssTag.setAttribute('id', 'sf-css');


    cssTag.innerHTML = Utils.IsNotInCMS() ? css : '';
    document.head.appendChild(cssTag);
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

