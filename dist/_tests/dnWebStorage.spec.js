/// <reference path="../../typings/jasmine/jasmine.d.ts" />
/// <reference path="../../typings/angularjs/angular-mocks.d.ts" />
/// <reference path="../dnWebStorage.ts" />
function $clearObject(source, dest) {
    if (typeof dest === "undefined") { dest = {}; }
    for (var key in source) {
        source.hasOwnProperty(key) && (dest[key] = source[key]);
    }
    return dest;
}

describe('dnWebStorage', function () {
    beforeEach(module('dnWebStorage'));

    ['local', 'session'].forEach(function (type) {
        var ucfType = type.charAt(0).toUpperCase() + type.substr(1);

        var storage = window[type + 'Storage'];

        beforeEach(function () {
            storage.clear();
        });

        describe('dn' + ucfType + 'Storage', function () {
            it('should provide a dn' + ucfType + 'Storage service', inject([
                'dn' + ucfType + 'Storage', function ($storage) {
                    expect($storage).not.toBeNull();
                    expect(typeof $storage.$defaults).toBe('function');
                    expect(typeof $storage.$reset).toBe('function');
                    expect($clearObject($storage)).toEqual({});
                    for (var key in $storage) {
                        expect(key).toBeUndefined();
                    }
                }]));

            describe('$defaults', function () {
                it('should set values', inject([
                    'dn' + ucfType + 'Storage', function ($storage) {
                        $storage.$defaults({ foo: 1, bar: 2 });
                        expect($clearObject($storage)).toEqual({ foo: 1, bar: 2 });
                    }]));

                it('should not overwrite values', inject([
                    'dn' + ucfType + 'Storage', function ($storage) {
                        $storage.$defaults({ foo: 1, bar: 2 });
                        ;
                        $storage.$defaults({ bar: 3, baz: 4 });
                        expect($clearObject($storage)).toEqual({ foo: 1, bar: 2, baz: 4 });
                    }]));
            });

            describe('$reset', function () {
                it('should reset without new values', inject([
                    'dn' + ucfType + 'Storage', function ($storage) {
                        $storage.foo = 1;
                        $storage.bar = 2;
                        $storage.$reset();
                        expect($clearObject($storage)).toEqual({});
                    }]));

                it('should reset with new values', inject([
                    'dn' + ucfType + 'Storage', function ($storage) {
                        $storage.foo = 1;
                        $storage.bar = 2;
                        $storage.$reset({ bar: 3, baz: 4 });
                        expect($clearObject($storage)).toEqual({ bar: 3, baz: 4 });
                    }]));
            });

            describe('window.' + type + 'Storage => dn' + type + 'Storage', function () {
                beforeEach(function () {
                    storage.setItem('invalid-prefix', 'foobar');
                    storage.setItem('ngWebStorage-foo', 1);
                    storage.setItem('ngWebStorage-bar', '{"name":"foobar"}');
                });

                it('should set initial values', inject([
                    'dn' + ucfType + 'Storage', function ($storage) {
                        expect($clearObject($storage)).toEqual({
                            foo: 1,
                            bar: { name: 'foobar' }
                        });
                    }]));

                if (type === 'local') {
                    it('should update value on StorageEvent', inject([
                        'dn' + ucfType + 'Storage', function ($storage) {
                            try  {
                                window.dispatchEvent(new window['StorageEvent']('storage', {
                                    key: 'ngWebStorage-foo',
                                    newValue: '"baz"'
                                }));
                            } catch (e) {
                                pending();
                            }
                            expect($storage.foo).toBe('baz');
                        }]));

                    it('should remove value on StorageEvent', inject([
                        'dn' + ucfType + 'Storage', function ($storage) {
                            try  {
                                window.dispatchEvent(new window['StorageEvent']('storage', {
                                    key: 'ngWebStorage-foo'
                                }));
                            } catch (e) {
                                pending();
                            }
                            expect($storage.foo).toBe(undefined);
                        }]));
                }
            });

            describe('dn' + ucfType + 'Storage => window.' + type + 'Storage', function () {
                it('should add values', function (done) {
                    return inject([
                        'dn' + ucfType + 'Storage', '$rootScope', function ($storage, $rootScope) {
                            $storage.foobar = { key: 'value' };
                            $rootScope.$apply();
                            window.setTimeout(function () {
                                expect(storage.getItem('ngWebStorage-foobar')).toEqual('{"key":"value"}');
                                done();
                            }, 100);
                        }]);
                });
            });
        });

        describe('dn' + ucfType + 'StorageStore', function () {
            it('should `put` value to storage', inject([
                'dn' + ucfType + 'StorageStore', 'dn' + ucfType + 'Storage', function ($store, $storage) {
                    $store.put('foo', 'bar');
                    expect($storage.foo).toBe('bar');
                }]));

            it('should `get` value to storage', inject([
                'dn' + ucfType + 'StorageStore', 'dn' + ucfType + 'Storage', function ($store, $storage) {
                    $storage.foo = 'bar';
                    expect($store.get('foo')).toBe('bar');
                }]));

            it('should `remove` value to storage', inject([
                'dn' + ucfType + 'StorageStore', 'dn' + ucfType + 'Storage', function ($store, $storage) {
                    $storage.foo = 'bar';
                    $store.remove('foo');
                    expect($storage.foo).toBe(undefined);
                }]));
        });
    });
});
//# sourceMappingURL=dnWebStorage.spec.js.map
