import Utils from "./utils";
import SiteFellows from "./sitefellows";
import LocalStore from "./localstore";

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
    if (!Utils.IsEmailAddressValid(fieldSelector.value)) {
        showFormErrorMessage(errorMessageSelector, message);
        return true;
    }
    return false;
};
//Cycle function - can be run every time we need to update what it's on the page
function updateUI() {
    let userData = LocalStore.UserData;
    

    //If we are in a CMS ditor we exit
    if (!Utils.IsInCMSEditor(LocalStore.ConfigData.SITE.options.cmsCompatibility)) {

        //Remove all modals
        let allModals = document.querySelectorAll('.sf-generated-modal');
        allModals.forEach(function (modalElement) {
            modalElement.remove();
        });

        //Check Links/Buttons
        if (Utils.DoesHTMLElementExists('[href="#sf-login"]')) Utils.ShowHideElements('[href="#sf-login"]', userData ? false : true);
        if (Utils.DoesHTMLElementExists('[href="#sf-login-modal"]')) Utils.ShowHideElements('[href="#sf-login-modal"]', userData ? false : true);
        if (Utils.DoesHTMLElementExists('[href="#sf-register"]')) Utils.ShowHideElements('[href="#sf-register"]', userData ? false : true);
        if (Utils.DoesHTMLElementExists('[href="#sf-logout"]')) Utils.ShowHideElements('[href="#sf-logout"]', userData ? true : false);
        //Check Forms
        if (Utils.DoesHTMLElementExists('.sf-login-form')) Utils.ShowHideElements('.sf-login-form', userData ? false : true);
        if (Utils.DoesHTMLElementExists('.sf-register-form')) Utils.ShowHideElements('.sf-register-form', userData ? false : true);

    };

};
//Create a modal and return its selector
function createModalAndReturnContentSelector(title = '', footer = '') {
    const modalID = `data-id="${Utils.UUID()}"`;
    const footerMarkup = footer ? `<div class="sh-footer">${footer}</div>` : '';
    let modalMarkup = `
    <div class="sf-modal-container" ${modalID}>
    <div class="sf-modal">
        <div class="sf-header">
            <p class="sf-title">${title}</p>
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
    const formID = `data-id="${Utils.UUID()}"`;
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
    if (Utils.DoesHTMLElementExists(container)) {
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
        //Enter pressed
        loginForm.addEventListener('keyup', function (e) {
            if (e.keyCode === 13) loginButton.click();
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
    if (Utils.DoesHTMLElementExists(selector)) {
        let htmlElement = document.querySelector(selector);
        htmlElement.addEventListener('click', function (e) {
            let localConfig = LocalStore.ConfigData;
            if (callbackFunction) callbackFunction();
            Utils.RedirectToURL(localConfig.SITE.paths[redirectKey] ? localConfig.SITE.paths[redirectKey] : '');
            e.preventDefault();
            e.stopPropagation();
        })
    }
};
//Bind all elements events
function bindUIEvents() {
    //If we are in a CMS ditor we exit
    if (!Utils.IsInCMSEditor(LocalStore.ConfigData.SITE.options.cmsCompatibility)) {

        //Login + Register Buttons for redirect
        bindClickToSiteRedirect('[href="#sf-login"]', 'login');
        bindClickToSiteRedirect('[href="#sf-register"]', 'register');
        bindClickToSiteRedirect('[href="#sf-logout"]', '', function () {
            SiteFellows.UserSignOut();
        });

        //Login Modal Button
        let loginModalSelector = '[href="#sf-login-modal"]';
        if (Utils.DoesHTMLElementExists(loginModalSelector)) {
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
//--------------
//SiteFellows UI
const SiteFellowsUI = {
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
};

window['SiteFellowsUI']= SiteFellowsUI;

export default window['SiteFellowsUI'];