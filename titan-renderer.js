class TitanRenderProcessor {

    renderComponent(comp, dataObj = null) {
        comp.querySelectorAll('[bind-rerender]').forEach(el => {
            el.template = el.innerHTML;
            comp.registerEvent(el.getAttribute('bind-rerender'), {
                tgtElement: el,
                callBack: (el) => {
                    el.innerHTML = el.template;
                    new TitanRenderProcessor().render(el, el.closest('[ttn-role]').data, null);
                }
            });

            el.removeAttribute('bind-rerender');
        });
        this.render(comp, dataObj == null ? comp.data : dataObj, null);
    }

    render(element, contextEl, contextHistory = null) {
        // change context history
        if (contextHistory == null) {
            contextHistory = [];
        }
        if (typeof (contextEl) == 'object') {
            contextHistory.push(contextEl);
        }

        // render all for-each loops
        while (element.querySelector('[for-each]') != null) {
            this.renderForEachLoops(element.querySelector('[for-each]'), contextEl, contextHistory);
        }

        // render self
        this.renderBindings(element, contextEl, contextHistory);
    }

    renderBindings(element, context, contextHistory) {
        var contexts = [
            { tag: 'bind-text', method: 'bindText' },
            { tag: 'bind-raw', method: 'bindRaw' },
            { tag: 'bind-class', method: 'bindClass' },
			{ tag: 'bind-style', method: 'bindStyle' },
            { tag: 'bind-click', method: 'bindClickEvent' }
        ];

        var renderer = this;
        contexts.forEach(c => {
            if (element.hasAttribute(c.tag)) { renderer[c.method](element, context, contextHistory); }
            element.querySelectorAll(`[${c.tag}]`).forEach(e => renderer[c.method](e, context, contextHistory));
        });
    }

    renderForEachLoops(element, context, contextHistory) {
        // register inner html as template and assign template
        var iterator = element.getAttribute('for-each');
        var holder = element.parentElement;
        holder.template = holder.innerHTML;
        holder.tempForEachTemplate = element.outerHTML;
        element.removeAttribute('for-each');

        var currHistory = [];
        contextHistory.forEach(e => { currHistory.push(e); });

        var tempDataObj = context;
        if (iterator == '$') {
            tempDataObj = context;
        } else {
            if (iterator.indexOf('$') > -1) {
                tempDataObj = context[iterator.split('$')[1]]
            } else {
                iterator.split('.').forEach(t => {
                    currHistory.push(tempDataObj[t])
                    tempDataObj = tempDataObj[t];
                });
                currHistory.pop();
            }
        }
        currHistory.push(tempDataObj);

        tempDataObj.forEach(obj => {
            element.insertAdjacentHTML('beforebegin', holder.tempForEachTemplate);

            var tempNewEl = holder.querySelector('[for-each]');
            tempNewEl.removeAttribute('for-each');

            this.render(tempNewEl, obj, currHistory);
            this.renderBindings(tempNewEl, obj, currHistory);
        });

        holder.removeChild(element);
        this.renderBindings(holder, context, currHistory);
    }

    bindText(e, context, contextHistory) {
        var path = e.getAttribute('bind-raw');
        e.innerText = this.getBindingValue(context, contextHistory, e.getAttribute('bind-text'));
        e.removeAttribute('bind-text');
    }

    bindRaw(e, c, cH) {
        var path = e.getAttribute('bind-raw');
        var value = ((path.substring(0, 1) == "{") ? this.getBindingExpression(c, cH, path) : this.getBindingValue(c, cH, path));
        e.innerHTML = value;
        e.removeAttribute('bind-raw');
    }

    bindClass(e, c, cH) {
        var path = e.getAttribute('bind-class');
        var value = ((path.substring(0, 1) == "{") ? this.getBindingExpression(c, cH, path) : this.getBindingValue(c, cH, path));
        if ((value ?? '') != '') {
            e.classList.add(value);
        }
        e.removeAttribute('bind-class');
    }
	
	bindStyle(e, c, cH) {
		var path = e.getAttribute('bind-style');
        var value = ((path.substring(0, 1) == "{") ? this.getBindingExpression(c, cH, path) : this.getBindingValue(c, cH, path));
        if ((value ?? '') != '') {
			e.setAttribute('style',
				e.hasAttribute('style') ? e.getAttribute('style') + ' ' + value : value
			);
        }
        e.removeAttribute('bind-style');
	}

    getBindingExpression(context, contextHistory, path) {
        var regex = /\[[A-Z|a-z|0-9|.|\/| ]{0,99}\]/g;
        var matches = path.match(regex);
        if (matches != null) {
            matches.forEach(m => {
                var value = this.getBindingValue(context, contextHistory, m.slice(1, -1));
                if (typeof (value) == 'string') {
                    value = `'${value}'`;
                }
                path = path.replace(m, value);
            });
        }
        return eval(path.slice(1, -1));
    }

    getBindingValue(context, contextHistory, path) {
        if (path == "$") {
            return context ?? '';
        } else {
            var count = (path.match(/.\//g) || []).length;
            path = path.replaceAll('./', '');

            if (count == 0) {
                try {
                    return context[path] ?? '';
                } catch {
                    return '';
                }
            } else {
                try {
                    return contextHistory[contextHistory.length - 1 - count][path] ?? '';
                } catch {
                    return '';
                }
            }
        }
    }

    bindClickEvent(e, c, cH) {

        var path = e.getAttribute('bind-click');
        var value = ((path.substring(0, 1) == "{") ? this.getBindingExpression(c, cH, path) : this.getBindingValue(c, cH, path));
        if (value || null && value || '' || path.substring(0, 1) == "{") {
            value = value;
        } else {
            value = path;
        }

        if (value != null && value != '')
        {
            e.clickHandler = {
                method: value, // e.getAttribute('bind-click'),
                target: e.closest(`[ttn-role="${(e.getAttribute('bind-target') ?? 'component')}"]`),
                args: {}
            };

            if (e.getAttribute('args') != null) {
                e.getAttribute('args').split(',').forEach(a => {
                    var argName = a;
                    var argValue = null;

                    if (a.split('=').length == 2) {
                        argName = a.split('=')[0];
                        argValue = this.getBindingValue(c, cH, a.split('=')[1]);
                    } else {
                        // argValue = context[a];
                        argValue = this.getBindingValue(c, cH, a);
                    }

                    e.clickHandler.args[argName] = argValue;
                });
            }

            e.addEventListener('click', function () {
                this.clickHandler.target[this.clickHandler.method](this, this.clickHandler.args);
            });
            e.style.cursor = 'pointer';
        }

        e.removeAttribute('bind-click');
        e.removeAttribute('bind-target');
        e.removeAttribute('args');
    }

}

class TitanComponent extends HTMLElement {
    constructor() {
        super();
        this._state = {};
        this.$__eventSheduler = [];
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
        this.preRender();
        this.render();
    }

    preRender() {
        if (!this.hasAttribute('[ttn-role]')) {
            this.setAttribute('ttn-role', 'component');
        }
    }

    createDeepProxy(obj, parent = null) {
        let handler = {
            get: (target, property) => {
                // access to property
                const value = target[property];
                return value && typeof value === 'object' ? this.createDeepProxy(value, target) : value;
            },
            set: (target, property, value) => {
                // set / change property
                target[property] = value;
                this.render();
                return true;
            }
        };
        return new Proxy(obj, handler);
    }

}
