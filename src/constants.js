//SFC used within the app
const SFC = {
    //Site config
    SITE: {},
    CMS_COMPATIBILITY: {
        sitejet: "sitejet"
    },
    EVENTS: {
        loginSuccess: "sitefellows/login",
        loginError: "sitefellows/login-error",
        configLoaded: "sitefellow/config-loaded",
        configLoadedAndHTMLLoaded: "sitefellow/config-and-html-loaded"
    },
    CSS : `
    :root {
        --sf-color-main: #3b2880;
        --sf-color-action: #4d30b8;
        --sf-color-text: #383838;
        --sf-color-neutral-500: #b6b6b6;
        --sf-color-neutral-300: #ededed;
        --sf-ff-headlines: inherit;
        --sf-ff-text: inherit;
      }
      
      .sf-form-container {
        color: var(--sf-color-text);
        font-family: var(--sf-ff-text);
        width: 100%;
        max-width: 460px;
        padding: 1rem;
        margin: 0 auto;
        -webkit-box-sizing: border-box;
                box-sizing: border-box;
      }
      
      .sf-form-container h1,
      .sf-form-container h2,
      .sf-form-container h3,
      .sf-form-container h4,
      .sf-form-container h5,
      .sf-form-container h6 {
        font-family: var(--sf-ff-headlines);
        color: var(--sf-color-main);
      }
      
      .sf-form-container.load {
        opacity: 0.6;
        pointer-events: none;
      }
      
      .sf-form-container.load .sf-button.submit {
        position: relative;
        overflow: hidden;
      }
      
      .sf-form-container.load .sf-button.submit::before {
        content: "";
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: var(--sf-color-action);
        background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' x='0px' y='0px' width='24px' height='24px' viewBox='0 0 24 24'%3E%3Cg transform='translate(0, 0)'%3E%3Cg class='nc-loop-dots-4-24-icon-f'%3E%3Ccircle cx='4' cy='12' fill='%23ffffff' r='3'%3E%3C/circle%3E%3Ccircle cx='12' cy='12' fill='%23ffffff' r='3' data-color='color-2'%3E%3C/circle%3E%3Ccircle cx='20' cy='12' fill='%23ffffff' r='3'%3E%3C/circle%3E%3C/g%3E%3Cstyle%3E.nc-loop-dots-4-24-icon-f%7B--animation-duration:0.8s%7D.nc-loop-dots-4-24-icon-f *%7Bopacity:.4;transform:scale(.75);animation:nc-loop-dots-4-anim var(--animation-duration) infinite%7D.nc-loop-dots-4-24-icon-f :nth-child(1)%7Btransform-origin:4px 12px;animation-delay:-.3s;animation-delay:calc(var(--animation-duration)/-2.666)%7D.nc-loop-dots-4-24-icon-f :nth-child(2)%7Btransform-origin:12px 12px;animation-delay:-.15s;animation-delay:calc(var(--animation-duration)/-5.333)%7D.nc-loop-dots-4-24-icon-f :nth-child(3)%7Btransform-origin:20px 12px%7D@keyframes nc-loop-dots-4-anim%7B0%25,100%25%7Bopacity:.4;transform:scale(.75)%7D50%25%7Bopacity:1;transform:scale(1)%7D%7D%3C/style%3E%3C/g%3E%3C/svg%3E");
        background-repeat: no-repeat;
        background-position: center center;
      }
      
      .sf-form-container .sf-form .sf-form-field {
        margin: 0.4rem 0;
        display: -webkit-box;
        display: -ms-flexbox;
        display: flex;
        -webkit-box-orient: vertical;
        -webkit-box-direction: normal;
            -ms-flex-direction: column;
                flex-direction: column;
      }
      
      .sf-form-container .sf-form .sf-form-field label {
        font-size: 0.8rem;
        margin: 0.4rem 0;
      }
      
      .sf-form-container .sf-form .sf-form-field input {
        font-size: 1rem;
        padding: 0.8rem 0.8rem;
        border-radius: 4px;
        border: 1px solid var(--sf-color-neutral-500);
      }
      
      .sf-form-container .sf-form .sf-form-field input:focus {
        border-color: var(--sf-color-main);
        outline: none;
      }
      
      .sf-form-container .sf-form .sf-form-field input:hover {
        border-color: var(--sf-color-action);
      }
      
      .sf-form-container .sf-form .sf-button {
        width: 100%;
        font-size: 1rem;
        color: var(--sf-color-neutral-300);
        background-color: var(--sf-color-action);
        border: none;
        padding: 1rem 0.8rem;
        border-radius: 4px;
      }
      
      .sf-form-container .sf-form .sf-button:hover {
        background-color: var(--sf-color-main);
      }
      
      .sf-form-container .sf-form .sf-button.submit {
        margin-top: 0.8rem;
        font-weight: bold;
      }
      
      .sf-form-container .sf-form .sf-error-message {
        display: none;
        padding: 0.8rem 0.8rem;
        background-color: var(--sf-color-neutral-300);
        border-radius: 4px;
        font-size: 0.9rem;
        margin-top: 0.8rem;
      }
      
      .sf-form-container .show {
        display: block !important;
      }
      
      .sf-form-container .hide {
        display: none !important;
      }
      
      .sf-modal-container {
        display: -webkit-box;
        display: -ms-flexbox;
        display: flex;
        -webkit-box-align: center;
            -ms-flex-align: center;
                align-items: center;
        -webkit-box-pack: center;
            -ms-flex-pack: center;
                justify-content: center;
        position: fixed;
        padding: 1rem;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 100;
        -webkit-box-sizing: border-box;
                box-sizing: border-box;
        background-color: rgba(0, 0, 0, 0.5);
      }
      
      .sf-modal-container .sf-modal {
        width: 100%;
        max-width: 420px;
        background-color: #ffffff;
        -webkit-box-sizing: border-box;
                box-sizing: border-box;
        border-radius: 4px;
        overflow: hidden;
      }
      
      .sf-modal-container .sf-modal .sf-header {
        display: -webkit-box;
        display: -ms-flexbox;
        display: flex;
        -ms-flex-wrap: nowrap;
            flex-wrap: nowrap;
        -webkit-box-align: center;
            -ms-flex-align: center;
                align-items: center;
        -webkit-box-pack: justify;
            -ms-flex-pack: justify;
                justify-content: space-between;
        padding: 0.5rem 1rem;
        border-bottom: 1px solid var(--sf-color-neutral-300);
      }
      
      .sf-modal-container .sf-modal .sf-header .sf-title {
        font-size: 1.2rem;
        font-weight: bold;
        color: var(--sf-color-main);
      }
      
      .sf-modal-container .sf-modal .sf-header .sf-button {
        position: relative;
        background-color: #ffffff;
        width: 32px;
        height: 32px;
        border-radius: 16px;
        cursor: pointer;
      }
      
      .sf-modal-container .sf-modal .sf-header .sf-button::before {
        content: "";
        position: absolute;
        width: 32px;
        height: 32px;
        background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' x='0px' y='0px' width='24px' height='24px' viewBox='0 0 24 24'%3E%3Cg transform='translate(0, 0)'%3E%3Cpolygon points='16.95 8.464 15.536 7.05 12 10.586 8.464 7.05 7.05 8.464 10.586 12 7.05 15.536 8.464 16.95 12 13.414 15.536 16.95 16.95 15.536 13.414 12 16.95 8.464' fill='%23444444'%3E%3C/polygon%3E%3C/g%3E%3C/svg%3E");
        background-position: center center;
        background-repeat: no-repeat;
        -webkit-transition: all 260ms;
        transition: all 260ms;
      }
      
      .sf-modal-container .sf-modal .sf-header .sf-button:hover {
        background-color: var(--sf-color-neutral-300);
      }
      
      .sf-modal-container .sf-modal .sf-header .sf-button:hover::before {
        -webkit-transform: rotate(90deg);
                transform: rotate(90deg);
      }
      
      .sf-modal-container .sf-modal .sf-content {
        padding: 1rem;
        padding-top: 0;
      }
    `,

}

export default SFC;