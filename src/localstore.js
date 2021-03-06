import SFC from "./constants";
import Utils from "./utils";
var storage = window.localStorage;

const LocalStore = {
    //Config data
    get ConfigData() {
        var localData = storage.getItem('sitefellows-config');
        return localData ? JSON.parse(localData) : null;
    },
    set ConfigData(config) {
        if (config) {
            storage.setItem('sitefellows-config', JSON.stringify(config));
        } else {
            storage.removeItem('sitefellows-config')
        };

    },
    //Config data timestamp
    get ConfigDataTimestamp() {
        var localData = storage.getItem('sitefellows-config-timestamp');
        return localData ? localData : null;
    },
    set ConfigDataTimestamp(timestamp) {
        if (timestamp) {
            storage.setItem('sitefellows-config-timestamp', timestamp);
        } else {
            storage.removeItem('sitefellows-config-timestamp')
        };

    },
    //User data
    get UserData() {
        var localData = storage.getItem('sitefellows-user');
        return localData ? JSON.parse(localData) : null;
    },
    set UserData(user) {
        if (user) {
            storage.setItem('sitefellows-user', JSON.stringify(user));
        } else {
            storage.removeItem('sitefellows-user')
        };

    },
    //User roles data
    get UserRolesData() {
        var localData = storage.getItem('sitefellows-user-roles');
        return localData ? JSON.parse(Utils.B64Decode(localData)) : null;
    },
    set UserRolesData(roles) {
        if (roles) {
            storage.setItem('sitefellows-user-roles', Utils.B64Encode(JSON.stringify(roles)));
        } else {
            storage.removeItem('sitefellows-user-roles')
        };

    },
    //User roles data timestamp
    get UserRolesDataTimestamp() {
        var localData = storage.getItem('sitefellows-user-roles-timestamp');
        return localData ? localData : null;
    },
    set UserRolesDataTimestamp(timestamp) {
        if (timestamp) {
            storage.setItem('sitefellows-user-roles-timestamp', timestamp);
        } else {
            storage.removeItem('sitefellows-user-roles-timestamp')
        };

    },
}


export default LocalStore;