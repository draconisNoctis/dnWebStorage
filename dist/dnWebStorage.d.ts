/// <reference path="../typings/angularjs/angular.d.ts" />
declare module dnWebStorage {
    enum STORAGE_TYPE {
        LOCAL = 0,
        SESSION = 1,
    }
    interface IStorage {
        $defaults(items: {
            [key: string]: string;
        }): IStorage;
        $reset(items: {
            [key: string]: string;
        }): IStorage;
        [key: string]: any;
    }
    interface IStore {
        put(key: string, value: any): void;
        get(key: string): any;
        remove(key: string): void;
    }
    class StorageProvider {
        private _prefix;
        public type: STORAGE_TYPE;
        public prefix : string;
        public $get: {}[];
    }
    class LocalStorageProvider extends StorageProvider {
        public type: STORAGE_TYPE;
        constructor();
    }
    class SessionStorageProvider extends StorageProvider {
        public type: STORAGE_TYPE;
        constructor();
    }
}
