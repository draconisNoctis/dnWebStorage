/* istanbul ignore next: ts __extends */
/// <reference path="../typings/angularjs/angular.d.ts" />
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var dnWebStorage;
(function (dnWebStorage) {
    (function (STORAGE_TYPE) {
        STORAGE_TYPE[STORAGE_TYPE["LOCAL"] = 0] = "LOCAL";
        STORAGE_TYPE[STORAGE_TYPE["SESSION"] = 1] = "SESSION";
    })(dnWebStorage.STORAGE_TYPE || /* istanbul ignore next */(dnWebStorage.STORAGE_TYPE = {}));
    var STORAGE_TYPE = dnWebStorage.STORAGE_TYPE;

    var STORAGE_MAP;
    (function (STORAGE_MAP) {
        STORAGE_MAP[STORAGE_MAP["localStorage"] = 0] = "localStorage";
        STORAGE_MAP[STORAGE_MAP["sessionStorage"] = 1] = "sessionStorage";
    })(STORAGE_MAP || /* istanbul ignore next */(STORAGE_MAP = {}));

    /* istanbul ignore next */
    var StorageProto = (function () {
        function StorageProto() {
        }
        StorageProto.prototype.$defaults = function (items) {
            for (var key in items) {
                undefined === this[key] && (this[key] = items[key]);
            }

            return this;
        };
        StorageProto.prototype.$reset = function (items) {
            for (var key in this) {
                '$' === key[0] || delete this[key];
            }

            if (items) {
                this.$defaults(items);
            }

            return this;
        };
        return StorageProto;
    })();

    ['$defaults', '$reset'].forEach(function (prop) {
        var d = Object.getOwnPropertyDescriptor(StorageProto.prototype, prop);
        d.enumerable = false;
        Object.defineProperty(StorageProto.prototype, prop, d);
    });

    var StorageProvider = (function () {
        function StorageProvider() {
            var _this = this;
            this._prefix = 'ngWebStorage-';
            this.$get = [
                '$window', '$rootScope', function ($window, $rootScope) {
                    var webStorage = $window[STORAGE_MAP[_this.type]], $storage = Object.create(StorageProto.prototype);

                    /* istanbul ignore next */
                    if (!webStorage) {
                        throw new Error('Browser doesn\\t support web storage "' + STORAGE_MAP[_this.type] + '"');
                    }

                    for (var index = -1, length = webStorage.length, key; ++index < length;) {
                        key = webStorage.key(index);
                        if (_this._prefix === key.substr(0, _this._prefix.length)) {
                            $storage[key.substr(_this._prefix.length)] = angular.fromJson(webStorage.getItem(key));
                        }
                    }

                    var _update = function (newValue, oldValue) {
                        var key;
                        for (key in newValue) {
                            if (undefined !== newValue[key] && '$' !== key[0]) {
                                webStorage.setItem(_this._prefix + key, angular.toJson(newValue[key]));
                            }
                            delete oldValue[key];
                        }
                        for (key in oldValue) {
                            webStorage.removeItem(_this._prefix + key);
                        }
                    }, _check = function () {
                        if (!angular.equals($storage, _saved$storage)) {
                            _update($storage, _saved$storage);
                            _saved$storage = angular.copy($storage);
                        }
                        _timeout = undefined;
                    }, _saved$storage = angular.copy($storage), _timeout;

                    $rootScope.$watch(function () {
                        _timeout || (_timeout = window.setTimeout(_check, 100));
                    });

                    if (0 /* LOCAL */ === _this.type) {
                        /* istanbul ignore next */
                        $window.addEventListener('storage', function (event) {
                            if (_this._prefix === event.key.substr(0, _this._prefix.length)) {
                                if (event.newValue) {
                                    $storage[event.key.substr(_this._prefix.length)] = angular.fromJson(event.newValue);
                                } else {
                                    delete $storage[event.key.substr(_this._prefix.length)];
                                }
                            }
                        }, false);
                    }

                    return $storage;
                }];
        }

        Object.defineProperty(StorageProvider.prototype, "prefix", {
            get: function () {
                return this._prefix;
            },
            set: function (prefix) {
                this._prefix = prefix;
            },
            enumerable: true,
            configurable: true
        });
        return StorageProvider;
    })();
    dnWebStorage.StorageProvider = StorageProvider;

    function storageStoreFactory(type) {
        return [
            'dn' + STORAGE_MAP[type].charAt(0).toUpperCase() + STORAGE_MAP[type].substr(1), function ($storage) {
                return {
                    get: function (key) {
                        return $storage[key];
                    },
                    put: function (key, value) {
                        $storage[key] = value;
                    },
                    remove: function (key) {
                        delete $storage[key];
                    }
                };
            }];
    }

    var LocalStorageProvider = (function (_super) {
        __extends(LocalStorageProvider, _super);
        function LocalStorageProvider() {
            _super.call(this);
            this.type = 0 /* LOCAL */;
        }
        return LocalStorageProvider;
    })(StorageProvider);
    dnWebStorage.LocalStorageProvider = LocalStorageProvider;

    var SessionStorageProvider = (function (_super) {
        __extends(SessionStorageProvider, _super);
        function SessionStorageProvider() {
            _super.call(this);
            this.type = 1 /* SESSION */;
        }
        return SessionStorageProvider;
    })(StorageProvider);
    dnWebStorage.SessionStorageProvider = SessionStorageProvider;

    angular.module('dnWebStorage', ['ng']).provider('dnSessionStorage', SessionStorageProvider).provider('dnLocalStorage', LocalStorageProvider).factory('dnSessionStorageStore', storageStoreFactory(1 /* SESSION */)).factory('dnLocalStorageStore', storageStoreFactory(0 /* LOCAL */));
})(dnWebStorage || /* istanbul ignore next */(dnWebStorage = {}));
//# sourceMappingURL=dnWebStorage.js.map
