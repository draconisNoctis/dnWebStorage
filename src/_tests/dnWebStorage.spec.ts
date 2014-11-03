/// <reference path="../../typings/jasmine/jasmine.d.ts" />
/// <reference path="../../typings/angularjs/angular-mocks.d.ts" />
/// <reference path="../dnWebStorage.ts" />

function $clearObject(source, dest = {}) {
	for(var key in source) {
		source.hasOwnProperty(key) && (dest[key] = source[key]);
	}
	return dest;
}

describe('dnWebStorage', () => {

	beforeEach(module('dnWebStorage'));

	['local', 'session'].forEach((type) => {

		var ucfType = type.charAt(0).toUpperCase() + type.substr(1);

		var storage = window[type + 'Storage'];

		beforeEach(() => {
			storage.clear();
		});

		describe('dn' + ucfType + 'Storage', () => {
			it('should provide a dn' + ucfType + 'Storage service', (<any>inject)(['dn' + ucfType + 'Storage', ($storage) => {
				expect($storage).not.toBeNull();
				expect(typeof $storage.$defaults).toBe('function');
				expect(typeof $storage.$reset).toBe('function');
				expect($clearObject($storage)).toEqual({});
				for(var key in $storage) {
					expect(key).toBeUndefined();
				}	
			}]));

			describe('$defaults', () => {
				it('should set values', (<any>inject)(['dn' + ucfType + 'Storage', ($storage) => {
					$storage.$defaults({ foo: 1, bar: 2 });
					expect($clearObject($storage)).toEqual({ foo: 1, bar: 2 });
				}]));

				it('should not overwrite values', (<any>inject)(['dn' + ucfType + 'Storage', ($storage) => {
					$storage.$defaults({ foo: 1, bar: 2 });;
					$storage.$defaults({ bar: 3, baz: 4 });
					expect($clearObject($storage)).toEqual({ foo: 1, bar: 2, baz: 4 });
				}]));
			});

			describe('$reset', () => {
				it('should reset without new values', (<any>inject)(['dn' + ucfType + 'Storage', ($storage) => {
					$storage.foo = 1;
					$storage.bar = 2;
					$storage.$reset();
					expect($clearObject($storage)).toEqual({});
				}]));

				it('should reset with new values', (<any>inject)(['dn' + ucfType + 'Storage', ($storage) => {
					$storage.foo = 1;
					$storage.bar = 2;
					$storage.$reset({ bar: 3, baz: 4 });
					expect($clearObject($storage)).toEqual({ bar: 3, baz: 4 });
				}]));
			});

			describe('window.' + type + 'Storage => dn' + type + 'Storage', () => {
				beforeEach(() => {
					storage.setItem('invalid-prefix', 'foobar');
					storage.setItem('ngWebStorage-foo', 1);
					storage.setItem('ngWebStorage-bar', '{"name":"foobar"}');
				});

				it('should set initial values', (<any>inject)(['dn' + ucfType + 'Storage', ($storage) => {
					expect($clearObject($storage)).toEqual({
						foo: 1,
						bar: { name: 'foobar' }
					});
				}]));

				if(type === 'local') {
					it('should update value on StorageEvent', (<any>inject)(['dn' + ucfType + 'Storage', ($storage) => {
						try {
							window.dispatchEvent(new window['StorageEvent']('storage', {
								key: 'ngWebStorage-foo',
								newValue: '"baz"'
							}));
						} catch(e) {
							pending();
						}
						expect($storage.foo).toBe('baz');
					}]));

					it('should remove value on StorageEvent', (<any>inject)(['dn' + ucfType + 'Storage', ($storage) => {
						try {
							window.dispatchEvent(new window['StorageEvent']('storage', {
								key: 'ngWebStorage-foo'
							}));
							} catch(e) {
								pending();
							}
						expect($storage.foo).toBe(undefined);
					}]));
				}

			});

			describe('dn' + ucfType + 'Storage => window.' + type + 'Storage', () => {
				it('should add values', done => (<any>inject)(['dn' + ucfType + 'Storage', '$rootScope', ($storage, $rootScope) => {
					$storage.foobar = { key: 'value' };
					$rootScope.$apply();
					window.setTimeout(() => {
						expect(storage.getItem('ngWebStorage-foobar')).toEqual('{"key":"value"}');
						done();
					}, 100);
				}]));
			});

		});

		
		describe('dn' + ucfType + 'StorageStore', () => {
			it('should `put` value to storage', (<any>inject)(['dn' + ucfType + 'StorageStore', 'dn' + ucfType + 'Storage', ($store, $storage) => {
				$store.put('foo', 'bar');
				expect($storage.foo).toBe('bar');
			}]));

			it('should `get` value to storage', (<any>inject)(['dn' + ucfType + 'StorageStore', 'dn' + ucfType + 'Storage', ($store, $storage) => {
				$storage.foo = 'bar';
				expect($store.get('foo')).toBe('bar');
			}]));

			it('should `remove` value to storage', (<any>inject)(['dn' + ucfType + 'StorageStore', 'dn' + ucfType + 'Storage', ($store, $storage) => {
				$storage.foo = 'bar';
				$store.remove('foo');
				expect($storage.foo).toBe(undefined);
			}]));
		});


	})
})