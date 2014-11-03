/* istanbul ignore next: ts __extends */
/// <reference path="../typings/angularjs/angular.d.ts" />

module dnWebStorage {

	export enum STORAGE_TYPE {
		LOCAL,
		SESSION
	}

	enum STORAGE_MAP {
		localStorage,
		sessionStorage
	}

	export interface IStorage {
		$defaults(items : { [key : string] : string }) : IStorage;
		$reset(items : { [key : string] : string }) : IStorage;
		[key : string] : any;
	}

	export interface IStore {
		put(key : string, value : any) : void;
		get(key : string) : any;
		remove(key : string) : void;
	}

	/* istanbul ignore next */
	class StorageProto {
		$defaults(items : { [key : string] : string }) {
			for(var key in items) {
				undefined === this[key] && (this[key] = items[key]);
			}

			return this;
		}
		$reset(items? : { [key : string] : string }) {
			for(var key in this) {
				'$' === key[0] || delete this[key];
			}

			if(items) {
				this.$defaults(items);
			}

			return this;
		}
	}
	
	['$defaults', '$reset'].forEach((prop) => {
		var d = Object.getOwnPropertyDescriptor(StorageProto.prototype, prop);
		d.enumerable = false;
		Object.defineProperty(StorageProto.prototype, prop, d);
	});

	export /*abstract*/ class StorageProvider {
		private _prefix : string = 'ngWebStorage-';
		public/*protected*/ type : STORAGE_TYPE;

		set prefix(prefix : string) {
			this._prefix = prefix;
		}

		get prefix() : string {
			return this._prefix
		}


		$get = ['$window', '$rootScope', ($window : ng.IWindowService, $rootScope : ng.IScope) => {
			var webStorage = $window[STORAGE_MAP[this.type]],
				$storage : IStorage = Object.create(StorageProto.prototype);
			/* istanbul ignore next */
			if(!webStorage) {
				throw new Error('Browser doesn\\t support web storage "' + STORAGE_MAP[this.type] + '"');
			}

			for(var index = -1, length = webStorage.length, key : string; ++index < length;) {
				key = webStorage.key(index);
				if(this._prefix === key.substr(0, this._prefix.length)) {
					$storage[key.substr(this._prefix.length)] = angular.fromJson(webStorage.getItem(key));
				}
			}



			var _update = (newValue, oldValue) => {
				var key : string;
				for(key in newValue) {
					if(undefined !== newValue[key] && '$' !== key[0]) {
						webStorage.setItem(this._prefix + key, angular.toJson(newValue[key]));
					}
					delete oldValue[key];
				}
				for(key in oldValue) {
					webStorage.removeItem(this._prefix + key);
				}
			}, 
			_check = () => {
				if(!angular.equals($storage, _saved$storage)) {
					_update($storage, _saved$storage);
					_saved$storage = angular.copy($storage);
				}
				_timeout = undefined;
			}, _saved$storage = angular.copy($storage), _timeout;


			$rootScope.$watch(() => {
				_timeout || (_timeout = window.setTimeout(_check, 100));
			});

			if(STORAGE_TYPE.LOCAL === this.type) {
				/* istanbul ignore next */
				$window.addEventListener('storage', (event) => {
					if(this._prefix === event.key.substr(0, this._prefix.length)) {
						if(event.newValue) {
							$storage[event.key.substr(this._prefix.length)] = angular.fromJson(event.newValue);
						} else {
							delete $storage[event.key.substr(this._prefix.length)];
						}
					}
				}, false);
			}

			return $storage;
		}]
	}

	function storageStoreFactory(type : STORAGE_TYPE) {
		return ['dn' + STORAGE_MAP[type].charAt(0).toUpperCase() + STORAGE_MAP[type].substr(1), ($storage : IStorage) => {
			return {
				get(key : string) : any {
					return $storage[key];
				},
				put(key : string, value : any) {
					$storage[key] = value;
				},
				remove(key : string) {
					delete $storage[key];
				}
			}
		}]
	}

	export class LocalStorageProvider extends StorageProvider {
		public type : STORAGE_TYPE = STORAGE_TYPE.LOCAL;

		constructor() {
			super();
		}
	}

	export class SessionStorageProvider extends StorageProvider {
		public type : STORAGE_TYPE = STORAGE_TYPE.SESSION;

		constructor() {
			super();
		}
	}

	angular.module('dnWebStorage', ['ng'])
		.provider('dnSessionStorage', SessionStorageProvider)
		.provider('dnLocalStorage', LocalStorageProvider)
		.factory('dnSessionStorageStore', storageStoreFactory(STORAGE_TYPE.SESSION))
		.factory('dnLocalStorageStore', storageStoreFactory(STORAGE_TYPE.LOCAL))
	
}