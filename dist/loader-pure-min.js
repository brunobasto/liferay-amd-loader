!(function() {
	var global = {};
	(global.__CONFIG__ = window.__CONFIG__), (function(e, t) {
		'use strict';
		var n = t(e);
		'object' == typeof module &&
			module &&
			(module.exports = n), 'function' == typeof define &&
			define.amd &&
			define(t), (e.EventEmitter = n);
	})('undefined' != typeof global ? global : this, function(e) {
		'use strict';
		function t() {
			this._events = {};
		}
		return (t.prototype = {
			constructor: t,
			on: function(e, t) {
				var n = (this._events[e] = this._events[e] || []);
				n.push(t);
			},
			off: function(e, t) {
				var n = this._events[e];
				if (n) {
					var o = n.indexOf(t);
					o > -1 && n.splice(o, 1);
				}
			},
			emit: function(e, t) {
				var n = this._events[e];
				if (n) {
					n = n.slice(0);
					for (var o = 0; o < n.length; o++) {
						var r = n[o];
						r.call(r, t);
					}
				}
			}
		}), t;
	}), (function(e, t) {
		'use strict';
		var n = t(e);
		'object' == typeof module &&
			module &&
			(module.exports = n), 'function' == typeof define &&
			define.amd &&
			define(t), (e.ConfigParser = n);
	})('undefined' != typeof global ? global : this, function(e) {
		'use strict';
		function t(e) {
			(this._config = {}), (this._modules = {}), (this._conditionalModules = {}), this._parseConfig(e);
		}
		return (t.prototype = {
			constructor: t,
			addModule: function(e) {
				var t = this._modules[e.name];
				if (t)
					for (var n in e)
						Object.prototype.hasOwnProperty.call(e, n) &&
							(t[n] = e[n]);
				else this._modules[e.name] = e;
				return this._registerConditionalModule(e), this._modules[
					e.name
				];
			},
			getConfig: function() {
				return this._config;
			},
			getConditionalModules: function() {
				return this._conditionalModules;
			},
			getModules: function() {
				return this._modules;
			},
			mapModule: function(e, t) {
				if (!this._config.maps && !t) return e;
				var n;
				return (n = Array.isArray(e) ? e : [e]), t &&
					(n = n.map(this._getModuleMapper(t))), this._config.maps &&
					(n = n.map(
						this._getModuleMapper(this._config.maps)
					)), Array.isArray(e) ? n : n[0];
			},
			_getModuleMapper: function(e) {
				return function(t) {
					var n;
					return (n = this._mapExactMatch(t, e)), n ||
						(n = this._mapPartialMatch(t, e)), n ||
						(n = this._mapWildcardMatch(t, e)), n || t;
				}.bind(this);
			},
			_mapExactMatch: function(e, t) {
				for (var n in t)
					if (Object.prototype.hasOwnProperty.call(t, n)) {
						var o = t[n];
						if (o.value && o.exactMatch && e === n) return o.value;
					}
			},
			_mapPartialMatch: function(e, t) {
				for (var n in t)
					if (Object.prototype.hasOwnProperty.call(t, n)) {
						var o = t[n];
						if (
							!o.exactMatch &&
							(
								o.value && (o = o.value),
								e === n || 0 === e.indexOf(n + '/')
							)
						)
							return o + e.substring(n.length);
					}
			},
			_mapWildcardMatch: function(e, t) {
				if ('function' == typeof t['*']) return t['*'](e);
			},
			_parseConfig: function(e) {
				for (var t in e)
					Object.prototype.hasOwnProperty.call(e, t) &&
						('modules' === t
							? this._parseModules(e[t])
							: (this._config[t] = e[t]));
				return this._config;
			},
			_parseModules: function(e) {
				for (var t in e)
					if (Object.prototype.hasOwnProperty.call(e, t)) {
						var n = e[t];
						(n.name = t), this.addModule(n);
					}
				return this._modules;
			},
			_registerConditionalModule: function(e) {
				if (e.condition) {
					var t = this._conditionalModules[e.condition.trigger];
					t ||
						(this._conditionalModules[
							e.condition.trigger
						] = t = []), t.push(e.name);
				}
			}
		}), t;
	}), (function(e, t) {
		'use strict';
		var n = t(e);
		'object' == typeof module &&
			module &&
			(module.exports = n), 'function' == typeof define &&
			define.amd &&
			define(t), (e.DependencyBuilder = n);
	})('undefined' != typeof global ? global : this, function(global) {
		'use strict';
		function DependencyBuilder(e) {
			(this._configParser = e), (this._pathResolver = new global.PathResolver()), (this._result = []);
		}
		var hasOwnProperty = Object.prototype.hasOwnProperty;
		return (DependencyBuilder.prototype = {
			constructor: DependencyBuilder,
			resolveDependencies: function(e) {
				this._queue = e.slice(0);
				var t;
				try {
					this._resolveDependencies(), (t = this._result
						.reverse()
						.slice(0));
				} finally {
					this._cleanup();
				}
				return t;
			},
			_cleanup: function() {
				var e = this._configParser.getModules();
				for (var t in e)
					if (hasOwnProperty.call(e, t)) {
						var n = e[t];
						(n.conditionalMark = !1), (n.mark = !1), (n.tmpMark = !1);
					}
				(this._queue.length = 0), (this._result.length = 0);
			},
			_processConditionalModules: function(e) {
				var t = this._configParser.getConditionalModules()[e.name];
				if (t && !e.conditionalMark) {
					for (
						var n = this._configParser.getModules(), o = 0;
						o < t.length;
						o++
					) {
						var r = n[t[o]];
						this._queue.indexOf(r.name) === -1 &&
							this._testConditionalModule(r.condition.test) &&
							this._queue.push(r.name);
					}
					e.conditionalMark = !0;
				}
			},
			_resolveDependencies: function() {
				for (
					var e = this._configParser.getModules(), t = 0;
					t < this._queue.length;
					t++
				) {
					var n = e[this._queue[t]];
					n ||
						(n = this._configParser.addModule({
							name: this._queue[t],
							dependencies: []
						})), n.mark || this._visit(n);
				}
			},
			_testConditionalModule: function(testFunction) {
				return 'function' == typeof testFunction
					? testFunction()
					: eval('false || ' + testFunction)();
			},
			_visit: function(e) {
				if (e.tmpMark)
					throw new Error(
						'Error processing module: ' +
							e.name +
							'. The provided configuration is not Directed Acyclic Graph.'
					);
				if ((this._processConditionalModules(e), !e.mark)) {
					e.tmpMark = !0;
					for (
						var t = this._configParser.getModules(), n = 0;
						n < e.dependencies.length;
						n++
					) {
						var o = e.dependencies[n];
						if (
							'require' !== o &&
							'exports' !== o &&
							'module' !== o
						) {
							o = this._pathResolver.resolvePath(e.name, o);
							var r = this._configParser.mapModule(o, e.map),
								i = t[r];
							i ||
								(i = this._configParser.addModule({
									name: r,
									dependencies: []
								})), this._visit(i);
						}
					}
					(e.mark = !0), (e.tmpMark = !1), this._result.unshift(
						e.name
					);
				}
			},
			_queue: []
		}), DependencyBuilder;
	}), (function(e, t) {
		'use strict';
		var n = t(e);
		'object' == typeof module &&
			module &&
			(module.exports = n), 'function' == typeof define &&
			define.amd &&
			define(t), (e.URLBuilder = n);
	})('undefined' != typeof global ? global : this, function(e) {
		'use strict';
		function t(e) {
			this._configParser = e;
		}
		var n = /^https?:\/\/|\/\/|www\./;
		return (t.prototype = {
			constructor: t,
			build: function(e) {
				var t = [],
					o = [],
					r = [],
					i = [],
					s = [],
					a = this._configParser.getConfig(),
					u = a.basePath || '',
					l = this._configParser.getModules();
				u.length && '/' !== u.charAt(u.length - 1) && (u += '/');
				for (var d = 0; d < e.length; d++) {
					var f = l[e[d]];
					if (f.fullPath)
						s.push({
							modules: [f.name],
							url: this._getURLWithParams(f.fullPath)
						});
					else {
						var c = this._getModulePath(f),
							p = 0 === c.indexOf('/');
						n.test(c)
							? s.push({
									modules: [f.name],
									url: this._getURLWithParams(c)
								})
							: !a.combine || f.anonymous
								? s.push({
										modules: [f.name],
										url: this._getURLWithParams(
											a.url + (p ? '' : u) + c
										)
									})
								: p
									? (t.push(c), r.push(f.name))
									: (o.push(c), i.push(f.name));
					}
					f.requested = !0;
				}
				return o.length &&
					(
						(s = s.concat(
							this._generateBufferURLs(i, o, {
								basePath: u,
								url: a.url,
								urlMaxLength: a.urlMaxLength
							})
						)),
						(o.length = 0)
					), t.length &&
					(
						(s = s.concat(
							this._generateBufferURLs(r, t, {
								url: a.url,
								urlMaxLength: a.urlMaxLength
							})
						)),
						(t.length = 0)
					), s;
			},
			_generateBufferURLs: function(e, t, n) {
				var o,
					r = n.basePath || '',
					i = [],
					s = n.urlMaxLength || 2e3,
					a = { modules: [e[0]], url: n.url + r + t[0] };
				for (o = 1; o < t.length; o++) {
					var u = e[o],
						l = t[o];
					a.url.length + r.length + l.length + 1 < s
						? (a.modules.push(u), (a.url += '&' + r + l))
						: (
								i.push(a),
								(a = { modules: [u], url: n.url + r + l })
							);
				}
				return (a.url = this._getURLWithParams(a.url)), i.push(a), i;
			},
			_getModulePath: function(e) {
				var t = e.path || e.name,
					o = this._configParser.getConfig().paths || {},
					r = !1;
				return Object.keys(o).forEach(function(e) {
					(t !== e && 0 !== t.indexOf(e + '/')) ||
						(t = o[e] + t.substring(e.length));
				}), r || 'function' != typeof o['*'] || (t = o['*'](t)), n.test(
					t
				) ||
					t.lastIndexOf('.js') === t.length - 3 ||
					(t += '.js'), t;
			},
			_getURLWithParams: function(e) {
				var t = this._configParser.getConfig(),
					n = t.defaultURLParams || {},
					o = Object.keys(n);
				if (!o.length) return e;
				var r = o
					.map(function(e) {
						return e + '=' + n[e];
					})
					.join('&');
				return e + (e.indexOf('?') > -1 ? '&' : '?') + r;
			}
		}), t;
	}), (function(e, t) {
		'use strict';
		var n = t(e);
		'object' == typeof module &&
			module &&
			(module.exports = n), 'function' == typeof define &&
			define.amd &&
			define(t), (e.PathResolver = n);
	})('undefined' != typeof global ? global : this, function(e) {
		'use strict';
		function t() {}
		return (t.prototype = {
			constructor: t,
			resolvePath: function(e, t) {
				if (
					'require' === t ||
					'exports' === t ||
					'module' === t ||
					(0 !== t.indexOf('.') && 0 !== t.indexOf('..'))
				)
					return t;
				var n = e.split('/');
				n.splice(-1, 1);
				for (
					var o = t.split('/'), r = o.splice(-1, 1), i = 0;
					i < o.length;
					i++
				) {
					var s = o[i];
					if ('.' !== s)
						if ('..' === s) {
							if (!n.length) {
								n = n.concat(o.slice(i));
								break;
							}
							n.splice(-1, 1);
						} else n.push(s);
				}
				return n.push(r), n.join('/');
			}
		}), t;
	}), (function(e, t) {
		'use strict';
		var n = t(e);
		'object' == typeof module &&
			module &&
			(module.exports = n), 'function' == typeof define &&
			define.amd &&
			define(t), (e.Loader = new n()), (e.require = e.Loader.require.bind(
			e.Loader
		)), (e.define = e.Loader.define.bind(e.Loader)), (e.define.amd = {});
	})('undefined' != typeof global ? global : this, function(e) {
		'use strict';
		function t(n) {
			t.superclass.constructor.apply(
				this,
				arguments
			), (this._config = n || e.__CONFIG__), (this._modulesMap = {});
		}
		(t.prototype = Object.create(
			e.EventEmitter.prototype
		)), (t.prototype.constructor = t), (t.superclass = e.EventEmitter.prototype);
		var n = {
			addModule: function(e) {
				return this._getConfigParser().addModule(e);
			},
			define: function() {
				var e = this,
					t = arguments[0],
					n = arguments[1],
					o = arguments[2],
					r = arguments[3] || {};
				r.anonymous = !1;
				var i = arguments.length;
				if (
					(
						i < 2
							? (
									(o = arguments[0]),
									(n = ['module', 'exports']),
									(r.anonymous = !0)
								)
							: 2 === i &&
									('string' == typeof t
										? (
												(n = ['module', 'exports']),
												(o = arguments[1])
											)
										: (
												(n = arguments[0]),
												(o = arguments[1]),
												(r.anonymous = !0)
											)),
						r.anonymous
					)
				) {
					var s = function(t) {
						if ((e.off('scriptLoaded', s), 1 !== t.length))
							e._reportMismatchedAnonymousModules(o.toString());
						else {
							var i = t[0],
								a = e.getModules()[i];
							a &&
								a.pendingImplementation &&
								e._reportMismatchedAnonymousModules(
									o.toString()
								), e._define(i, n, o, r);
						}
					};
					e.on('scriptLoaded', s);
				} else this._define(t, n, o, r);
			},
			getConditionalModules: function() {
				return this._getConfigParser().getConditionalModules();
			},
			getModules: function() {
				return this._getConfigParser().getModules();
			},
			require: function() {
				var e,
					t,
					n,
					o,
					r = this;
				if (Array.isArray(arguments[0]))
					(n = arguments[0]), (o = 'function' == typeof arguments[1]
						? arguments[1]
						: null), (e = 'function' == typeof arguments[2]
						? arguments[2]
						: null);
				else
					for (n = [], t = 0; t < arguments.length; ++t)
						if ('string' == typeof arguments[t])
							n[t] = arguments[t];
						else if ('function' == typeof arguments[t]) {
							(o = arguments[t]), (e = 'function' ==
								typeof arguments[++t]
								? arguments[t]
								: null);
							break;
						}
				var i,
					s = r._getConfigParser(),
					a = s.mapModule(n);
				new Promise(function(e, t) {
					r._resolveDependencies(a).then(function(o) {
						var u = s.getConfig();
						0 !== u.waitTimeout &&
							(i = setTimeout(function() {
								var e = s.getModules(),
									r = new Error(
										'Load timeout for modules: ' + n
									);
								(r.dependencies = o), (r.mappedModules = a), (r.missingDependencies = o.filter(
									function(t) {
										return (
											'undefined' ==
											typeof e[t].implementation
										);
									}
								)), (r.modules = n), (r.dependecies = r.dependencies), t(r);
							}, u.waitTimeout ||
								7e3)), r._loadModules(o).then(e, t);
					}, t);
				}).then(
					function(e) {
						if ((clearTimeout(i), o)) {
							var t = r._getModuleImplementations(a);
							o.apply(o, t);
						}
					},
					function(t) {
						clearTimeout(i), e && e.call(e, t);
					}
				);
			},
			_createModulePromise: function(e) {
				var t = this;
				return new Promise(function(n, o) {
					var r = t._getConfigParser().getModules(),
						i = r[e];
					if (i.exports) {
						var s = t._getValueGlobalNS(i.exports);
						if (s) n(s);
						else {
							var a = function(r) {
								if (r.indexOf(e) >= 0) {
									t.off('scriptLoaded', a);
									var s = t._getValueGlobalNS(i.exports);
									s
										? n(s)
										: o(
												new Error(
													'Module ' +
														e +
														' does not export the specified value: ' +
														i.exports
												)
											);
								}
							};
							t.on('scriptLoaded', a);
						}
					} else {
						var u = function(o) {
							o === e &&
								(
									t.off('moduleRegister', u),
									(t._modulesMap[e] = !0),
									n(e)
								);
						};
						t.on('moduleRegister', u);
					}
				});
			},
			_define: function(e, t, n, o) {
				var r = o || {},
					i = this._getConfigParser(),
					s = this._getPathResolver();
				(t = t.map(function(t) {
					return s.resolvePath(e, t);
				})), (r.name = e), (r.dependencies = t), (r.pendingImplementation = n), i.addModule(
					r
				), this._modulesMap[r.name] ||
					(this._modulesMap[r.name] = !0), this.emit(
					'moduleRegister',
					e
				);
			},
			_getConfigParser: function() {
				return this._configParser ||
					(this._configParser = new e.ConfigParser(
						this._config
					)), this._configParser;
			},
			_getDependencyBuilder: function() {
				return this._dependencyBuilder ||
					(this._dependencyBuilder = new e.DependencyBuilder(
						this._getConfigParser()
					)), this._dependencyBuilder;
			},
			_getValueGlobalNS: function(e) {
				for (
					var t = e.split('.'), n = (0, eval)('this')[t[0]], o = 1;
					n && o < t.length;
					o++
				) {
					if (!Object.prototype.hasOwnProperty.call(n, t[o]))
						return null;
					n = n[t[o]];
				}
				return n;
			},
			_getMissingDependencies: function(e) {
				for (
					var t = this._getConfigParser(),
						n = t.getModules(),
						o = Object.create(null),
						r = 0;
					r < e.length;
					r++
				)
					for (
						var i = n[e[r]],
							s = t.mapModule(i.dependencies, i.map),
							a = 0;
						a < s.length;
						a++
					) {
						var u = s[a],
							l = n[u];
						'require' === u ||
							'exports' === u ||
							'module' === u ||
							(l && l.pendingImplementation) ||
							(o[u] = 1);
					}
				return Object.keys(o);
			},
			_getModuleImplementations: function(e) {
				for (
					var t = [], n = this._getConfigParser().getModules(), o = 0;
					o < e.length;
					o++
				) {
					var r = n[e[o]];
					t.push(r ? r.implementation : void 0);
				}
				return t;
			},
			_getPathResolver: function() {
				return this._pathResolver ||
					(this._pathResolver = new e.PathResolver()), this
					._pathResolver;
			},
			_getURLBuilder: function() {
				return this._urlBuilder ||
					(this._urlBuilder = new e.URLBuilder(
						this._getConfigParser()
					)), this._urlBuilder;
			},
			_filterModulesByProperty: function(e, t) {
				var n = t;
				'string' == typeof t && (n = [t]);
				for (
					var o = [], r = this._getConfigParser().getModules(), i = 0;
					i < e.length;
					i++
				) {
					var s = e[i],
						a = r[e[i]];
					if (a) {
						if (
							'require' !== a &&
							'exports' !== a &&
							'module' !== a
						) {
							for (var u = 0, l = 0; l < n.length; l++)
								if (a[n[l]]) {
									u = !0;
									break;
								}
							u || o.push(s);
						}
					} else o.push(s);
				}
				return o;
			},
			_loadModules: function(e) {
				var t = this;
				return new Promise(function(n, o) {
					var r = t._filterModulesByProperty(e, [
						'requested',
						'pendingImplementation'
					]);
					if (r.length) {
						for (
							var i = t._getURLBuilder().build(r), s = [], a = 0;
							a < i.length;
							a++
						)
							s.push(t._loadScript(i[a]));
						Promise.all(s)
							.then(function(n) {
								return t._waitForModules(e);
							})
							.then(function(e) {
								n(e);
							})['catch'](function(e) {
								o(e);
							});
					} else
						t._waitForModules(e).then(function(e) {
							n(e);
						})['catch'](function(e) {
							o(e);
						});
				});
			},
			_loadScript: function(e) {
				var t = this;
				return new Promise(function(n, o) {
					var r = document.createElement('script');
					(r.src =
						e.url), (r.async = !1), (r.onload = r.onreadystatechange = function() {
						(this.readyState &&
							'complete' !== this.readyState &&
							'load' !== this.readyState) ||
							(
								(r.onload = r.onreadystatechange = null),
								n(r),
								t.emit('scriptLoaded', e.modules)
							);
					}), (r.onerror = function() {
						document.head.removeChild(r), o(r);
					}), document.head.appendChild(r);
				});
			},
			_resolveDependencies: function(e) {
				var t = this;
				return new Promise(function(n, o) {
					try {
						var r = t
							._getDependencyBuilder()
							.resolveDependencies(e);
						n(r);
					} catch (i) {
						o(i);
					}
				});
			},
			_reportMismatchedAnonymousModules: function(e) {
				var t = 'Mismatched anonymous define() module: ' + e,
					n = this._config.reportMismatchedAnonymousModules;
				if (!n || 'exception' === n) throw new Error(t);
				console && console[n] && console[n].call(console, t);
			},
			_setModuleImplementation: function(e) {
				for (
					var t = this,
						n = this._getConfigParser().getModules(),
						o = 0;
					o < e.length;
					o++
				) {
					var r = e[o];
					if ('undefined' == typeof r.implementation)
						if ('undefined' == typeof r.exports) {
							for (
								var i = [],
									s = { exports: {} },
									a = t._getConfigParser(),
									u = 0;
								u < r.dependencies.length;
								u++
							) {
								var l = r.dependencies[u];
								if ('exports' === l) i.push(s.exports);
								else if ('module' === l) i.push(s);
								else if ('require' === l) {
									var d = t._createLocalRequire(r);
									(d.toUrl = function(e) {
										var n = t._getURLBuilder().build([e]);
										return n[0].url;
									}), i.push(d);
								} else {
									var f = n[a.mapModule(l, r.map)],
										c = f.implementation;
									i.push(c);
								}
							}
							var p;
							(p = 'function' == typeof r.pendingImplementation
								? r.pendingImplementation.apply(
										r.pendingImplementation,
										i
									)
								: r.pendingImplementation), 'undefined' !=
								typeof p
								? (r.implementation = p)
								: (r.implementation = s.exports);
						} else
							r.pendingImplementation = r.implementation = this._getValueGlobalNS(
								r.exports
							);
				}
			},
			_createLocalRequire: function(t) {
				var n = this._getConfigParser(),
					o = this._getPathResolver();
				return function(r) {
					var i = arguments.length;
					if (!(i > 1)) {
						(r = o.resolvePath(t.name, r)), (r = n.mapModule(
							r,
							t.map
						));
						var s = n.getModules()[r];
						if (!s || 'undefined' == typeof s.implementation)
							throw new Error(
								'Module "' +
									r +
									'" has not been loaded yet for context: ' +
									t.name
							);
						return s.implementation;
					}
					e.require.apply(e.Loader, arguments);
				};
			},
			_waitForModule: function(e) {
				var t = this,
					n = t._modulesMap[e];
				return n ||
					(
						(n = t._createModulePromise(e)),
						(t._modulesMap[e] = n)
					), n;
			},
			_waitForModules: function(e) {
				var t = this;
				return new Promise(function(n, o) {
					for (var r = [], i = 0; i < e.length; i++)
						r.push(t._waitForModule(e[i]));
					Promise.all(r).then(function(r) {
						var i = t._getConfigParser().getModules(),
							s = function() {
								for (var o = [], r = 0; r < e.length; r++)
									o.push(i[e[r]]);
								t._setModuleImplementation(o), n(o);
							},
							a = t._getMissingDependencies(e);
						a.length ? t.require(a, s, o) : s();
					}, o);
				});
			}
		};
		return Object.keys(n).forEach(function(e) {
			t.prototype[e] = n[e];
		}), (t.prototype.define.amd = {}), t;
	});
	var namespace = null,
		exposeGlobal = !0;
	if (
		(
			'object' == typeof global.__CONFIG__ &&
				(
					'string' == typeof global.__CONFIG__.namespace &&
						(namespace = global.__CONFIG__.namespace),
					'boolean' == typeof global.__CONFIG__.exposeGlobal &&
						(exposeGlobal = global.__CONFIG__.exposeGlobal)
				),
			namespace
		)
	) {
		var ns = window[global.__CONFIG__.namespace]
			? window[global.__CONFIG__.namespace]
			: {};
		(ns.Loader = global.Loader), (window[global.__CONFIG__.namespace] = ns);
	} else window.Loader = global.Loader;
	exposeGlobal &&
		(
			(window.Loader = global.Loader),
			(window.require = global.require),
			(window.define = global.define)
		), (global.Loader.version = function() {
		return '2.1.0';
	});
})();
