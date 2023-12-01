class TitanRenderProcessor {

	errorCodes = [
		{ code: 'TTN-RP-091', descr: 'TTN-RP-091: expressions are not allowed for binding of value attributes! Element:' }
	];
	
	getErrMsg(code){
		return this.errorCodes.filter(c => { return c.code == code })[0].descr;
	}

	contexts = [
        { tag: 'bind-text', method: 'bindText' },
        { tag: 'bind-raw', method: 'bindRaw' },
        { tag: 'bind-class', method: 'bindClass' },
        { tag: 'bind-attribute', method: 'bindAttribute' },
        { tag: 'bind-value', method: 'bindValue' },
		{ tag: 'bind-style', method: 'bindStyle' },
		{ tag: 'bind-click', method: 'bindClickEvent' },
		{ tag: 'bind-change', method: 'bindChangeEvent' }
    ]

    renderComponent(comp, dataObj = null) {
        comp.querySelectorAll('[bind-rerender]').forEach(el => {
            el.template = el.innerHTML;
            comp.registerEvent(el.getAttribute('bind-rerender'), {
                tgtElement: el,
                callBack: (el) => {
                    el.innerHTML = el.template;
					var src = el.closest('[ttn-role]');
					var srcData = dataObj == null ? (src.data == null ? src.dataObj : src.data) : dataObj;
                    new TitanRenderProcessor().render(el, srcData);
                }
            });

            el.removeAttribute('bind-rerender');
        });
        this.render(comp, dataObj == null ? (comp.data == null ? comp.dataObj : comp.data) : dataObj, null);
    }

    render(e, c, cH = null) {
        // change context history
        if (cH == null) {
            cH = [];
        }
        if (typeof (c) == 'object') {
            cH.push(c);
        }

        // render all for-each loops
        while (e.querySelector('[for-each]') != null) {
            this.renderForEachLoops(e.querySelector('[for-each]'), c, cH);
        }

        // render self
        this.renderBindings(e, c, cH);
    }

    renderBindings(e, c, cH) {
        var renderer = this;
		
		// render ifs
		e.querySelectorAll(`[if]:not([for-each])`).forEach(e => renderer.renderIf(e, c, cH));
		
		// render bindings
        this.contexts.forEach(f => {
            if (e.hasAttribute(f.tag)) { renderer[f.method](e, c, cH); }
            e.querySelectorAll(`[${f.tag}]`).forEach(e => renderer[f.method](e, c, cH));
        });
    }
	
	renderIf(e, c, cH) {
		var path = e.getAttribute('if');
        var value = this.dissolveBinding(path, e, c, cH);
		if(!value) {
			e.parentElement.removeChild(e);
		} else {
			e.removeAttribute('if');
		}
	}

    renderForEachLoops(e, c, cH) {
        // register inner html as template and assign template
        var iterator = e.getAttribute('for-each');
		var ifExpr = e.hasAttribute('if') ? e.getAttribute('if') : null;
        var holder = e.parentElement;
        holder.template = holder.innerHTML;
        holder.tempForEachTemplate = e.outerHTML;
        e.removeAttribute('for-each');
        e.removeAttribute('if');

        var currHistory = [];
        cH.forEach(e => { currHistory.push(e); });

        var tempDataObj = c;
        if (iterator == '$') {
            tempDataObj = c;
			currHistory.push(c);
        } else {
            if (iterator.indexOf('$') > -1) {
                tempDataObj = c[iterator.split('$')[1]]
            } else {
                iterator.split('.').forEach(t => {
					tempDataObj = tempDataObj[t];
                    currHistory.push(tempDataObj);
                });
                // currHistory.pop();
            }
        }
        // currHistory.push(tempDataObj);

		var added = false;
        tempDataObj.forEach(obj => {
			if(!added){
				//currHistory.push(obj);
			}
			added = true;
			if(ifExpr == null || this.dissolveBinding(ifExpr, tempNewEl, obj, currHistory)) {
				e.insertAdjacentHTML('beforebegin', holder.tempForEachTemplate);

				var tempNewEl = holder.querySelector('[for-each]');
				tempNewEl.removeAttribute('for-each');
				tempNewEl.removeAttribute('if');

				this.render(tempNewEl, obj, currHistory);
				this.renderBindings(tempNewEl, obj, currHistory);
			}
        });

        holder.removeChild(e);
        this.renderBindings(holder, c, currHistory);
    }

    bindText(e, c, cH) {
		var path = e.getAttribute('bind-text');
        var value = this.dissolveBinding(path, e, c, cH);
        e.innerText = value;
        e.removeAttribute('bind-text');
    }

    bindRaw(e, c, cH) {
        var path = e.getAttribute('bind-raw');
        var value = this.dissolveBinding(path, e, c, cH);
        e.innerHTML = value;
        e.removeAttribute('bind-raw');
    }

    bindClass(e, c, cH) {
        var path = e.getAttribute('bind-class');
        var value = this.dissolveBinding(path, e, c, cH);
        if ((value ?? '') != '') {
            e.classList.add(value);
        }
        e.removeAttribute('bind-class');
    }
	
	bindAttribute(e, c, cH) {
        var path = e.getAttribute('bind-attribute');
        var value = this.dissolveBinding(path, e, c, cH);
        if ((value ?? '') != '') {
			if(typeof(value) == 'object' || typeof(value) == 'array') {
				e.setAttribute(value[0], value[1]);
			} else {
				e.setAttribute(value, '');
			}
        }
        e.removeAttribute('bind-attribute');
    }
	
	bindValue(e, c, cH) {
        var path = e.getAttribute('bind-value');
		if(path.substring(0, 1) == "{")
		{
			this.errorCodes.filter(c => {})
			console.error(`TTN-RP-091: ${this.getErrMsg('TTN-RP-091')}`, e);
		}
		else
		{
			var value = this.dissolveBinding(path, e, c, cH);
			if ((value ?? '') != '') {
				e.value = value;
			}
			e.$__binding = {
				context: path == '$' ? cH[cH.length - 1] : c,
				index: path == '$' ? cH[cH.length - 1].indexOf(value) : null,
				path: path
			};
			
			// create bind reference
			var bindReference = {
				context: e.$__binding.context,
				property: (e.$__binding.index ?? e.$__binding.path),
				object: e
			};
			
			// push new
			var bindings = e.closest('[ttn-role]').$__stateManager.bindedVariables;
			if(bindings.filter(b => { return
				b.context == bindReference.context
				&& b.property == bindReference.property
				&& b.object == bindReference.object;
			}).length == 0) {
				bindings.push(bindReference);
			}
			
			e.addEventListener("change", function(){
				if(this.$__binding.index == null) {
					this.$__binding.context[this.$__binding.path] = this.value;
				} else {
					this.$__binding.context[this.$__binding.index] = this.value;
				}
			});
		}
		
        e.removeAttribute('bind-value');
    }
	
	bindStyle(e, c, cH) {
		var path = e.getAttribute('bind-style');
        var value = this.dissolveBinding(path, e, c, cH);
        if ((value ?? '') != '') {
			e.setAttribute('style',
				e.hasAttribute('style') ? e.getAttribute('style') + ' ' + value : value
			);
        }
        e.removeAttribute('bind-style');
	}

	dissolveBinding(path, e, c, cH){
		return ((path.substring(0, 1) == "{") ? this.getBindingExpression(c, cH, path) : this.getBindingValue(c, cH, path));
	}

    getBindingExpression(c, cH, path) {
        var regex = /\[[A-Z|a-z|0-9|.|\/| ]{0,99}\]/g;
        var matches = path.match(regex);
        if (matches != null) {
            matches.forEach(m => {
                var value = this.getBindingValue(c, cH, m.slice(1, -1));
                if (typeof (value) == 'string') {
                    value = `'${value}'`;
                }
                path = path.replace(m, value);
            });
        }
		
		path = path.replace('$', (typeof(c) == 'string' ? `${c}` : c));
        return eval(path.slice(1, -1));
    }

    getBindingValue(c, cH, path) {
        if (path == "$") {
            return c ?? '';
        } else {
            var count = (path.match(/.\//g) || []).length;
            path = path.replaceAll('./', '');

            if (count == 0) {
                try {
                    return c[path] ?? '';
                } catch {
                    return '';
                }
            } else {
                try {
                    return cH[cH.length - 1 - count][path] ?? '';
                } catch {
                    return '';
                }
            }
        }
    }
	
	fetchArgs(e, c, cH) {
		if (e.getAttribute('args') != null) {
            e.getAttribute('args').split(',').forEach(a => {
				var argName = a;
                var argValue = null;

                if (a.split('=').length == 2) {
					argName = a.split('=')[0];
                    // argValue = this.getBindingValue(c, cH, a.split('=')[1]);
					argValue = this.dissolveBinding(a.split('=')[1], null, c, cH);
                } else {
					// argValue = this.getBindingValue(c, cH, a);
					argValue = this.dissolveBinding(a, null, c, cH);
                }

                e.$__clickHandler.args[argName] = argValue;
            });
        }
	}

    bindClickEvent(e, c, cH) {

        var path = e.getAttribute('bind-click');
        var value = this.dissolveBinding(path, e, c, cH);
        if (value || null && value || '' || path.substring(0, 1) == "{") {
            value = value;
        } else {
            value = path;
        }

        if (value != null && value != '')
        {
            e.$__clickHandler = {
                method: value, // e.getAttribute('bind-click'),
                target: e.closest(`[ttn-role="${(e.getAttribute('bind-target') ?? 'component')}"]`),
                args: {}
            };
			this.fetchArgs(e, c, cH);

            e.addEventListener('click', function () {
                this.$__clickHandler.target[this.$__clickHandler.method](this, this.$__clickHandler.args);
            });
            e.style.cursor = 'pointer';
        }

        e.removeAttribute('bind-click');
        e.removeAttribute('bind-target');
        e.removeAttribute('args');
    }

	bindChangeEvent(e, c, cH) {
		var path = e.getAttribute('bind-change');
        var value = this.dissolveBinding(path, e, c, cH);
        if (value || null && value || '' || path.substring(0, 1) == "{") {
            value = value;
        } else {
            value = path;
        }

        if (value != null && value != '')
        {
            e.$__clickHandler = {
                method: value,
                target: e.closest(`[ttn-role="${(e.getAttribute('bind-target') ?? 'component')}"]`),
                args: {}
            };
			this.fetchArgs(e, c, cH);

            e.addEventListener('change', function () {
				this.$__clickHandler.args.value = this.value;
                this.$__clickHandler.target[this.$__clickHandler.method](this, this.$__clickHandler.args);
            });
            e.style.cursor = 'pointer';
        }

        e.removeAttribute('bind-change');
        e.removeAttribute('bind-target');
        e.removeAttribute('args');
	}

}



class TitanComponent extends HTMLElement {
    constructor() {
        super();
        this._state = {};
        this.$__eventSheduler = [];
		this.$__stateManager = {
			bindedVariables: []
		};
    }	

    getRemoveAttribute(attributName) {
        var value = this.getAttribute(attributName);
        this.removeAttribute(attributName);
        return value;
    }

    raiseEvent(eventName) {
        if (this.$__eventSheduler[eventName] != null) {
            this.$__eventSheduler[eventName].forEach(e => {
                e.callBack(e.tgtElement);
            });
        }
    }

    registerEvent(eventName, handler) {
        if (this.$__eventSheduler[eventName] == null) {
            this.$__eventSheduler[eventName] = [];
        }
        this.$__eventSheduler[eventName].push(handler);
    }

    connectedCallback() {
        this.preInitialRender();
        this.render();
    }

    preInitialRender() {
        if (!this.hasAttribute('[ttn-role]')) {
            this.setAttribute('ttn-role', 'component');
        }
    }
	
	// event after set prop
	preSetProp(target, property, value){
		return true;
	}
	
	// event after changed prop
	postSetProp(target, property, value){
	}
	
	refreshBindings(target, property, value){
		var relBindings = this.$__stateManager.bindedVariables.filter(b => {
			return b.property == property && JSON.stringify(target) == JSON.stringify(b.context);
		});
		relBindings.forEach(b => {
			b.object.value = value;
		});
	}

	// creates a deep proxy on a data object
    createDeepProxy(obj, parent = null) {
        let handler = {
			path: 'test',
            get: (target, property) => {
                // access to property
                const value = target[property];
                return value && typeof value === 'object' ? this.createDeepProxy(value, target) : value;
            },
            set: (target, property, value) => {
                // set / change property
				if(this.preSetProp(target, property, value)) {
					target[property] = value;
				}
				
				this.refreshBindings(target, property, value);
				this.postSetProp(target, property, value);
                return true;
            }
        };
        return new Proxy(obj, handler);
    }

}
