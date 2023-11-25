class RenderProcessor {
  
    renderComponent(comp, dataObj = null) {
        comp.querySelectorAll('[bind-rerender]').forEach(el => {
            el.template = el.innerHTML;
            comp.registerEvent(el.getAttribute('bind-rerender'), {
                tgtElement: el,
                callBack: (el) => {
                    el.innerHTML = el.template;
                    new RenderProcessor().render(el, el.closest('[role]').data, null);
                }
            });

            el.removeAttribute('bind-rerender');
        });
        this.render(comp, dataObj == null ? comp.data : dataObj, null);
    }

    render(element, contextEl, contextHistory = null)
    {
        if(contextHistory == null) {
            contextHistory = [];
        }
        if(typeof(contextEl) == 'object') {
            contextHistory.push(contextEl);
        }
        while(element.querySelector('[for-each]') != null) {
            this.renderForEachLoops(element.querySelector('[for-each]'), contextEl, contextHistory);
        }
    }

    renderBindings(element, context, contextHistory)
    {
        if(element.hasAttribute('bind-text')) { this.bindText(element, context, contextHistory); }
        if(element.hasAttribute('bind-raw')) { this.bindRaw(element, context, contextHistory); }
        if(element.hasAttribute('bind-class')) { this.bindClass(element, context, contextHistory); }
        if(element.hasAttribute('bind-click')) { this.bindClickEvent(element, context, contextHistory); }
    
        element.querySelectorAll('[bind-text]').forEach(e => { this.bindText(e, context, contextHistory); });
        element.querySelectorAll('[bind-raw]').forEach(e => { this.bindRaw(e, context, contextHistory); });
        element.querySelectorAll('[bind-class]').forEach(e => { this.bindClass(e, context, contextHistory); });
        element.querySelectorAll('[bind-click]').forEach(e => { this.bindClickEvent(e, context, contextHistory); });
    }

    renderForEachLoops(element, context, contextHistory)
    {
        // register inner html as template and assign template
        var iterator = element.getAttribute('for-each');
        var holder = element.parentElement;
        holder.template = holder.innerHTML;
        holder.tempForEachTemplate = element.outerHTML;
        holder.removeChild(element);
    
        var currHistory = [];
        contextHistory.forEach(e => { currHistory.push(e); });
        
        var tempDataObj = iterator == '$' ? context : context[iterator];
        currHistory.push(tempDataObj);
    
        tempDataObj.forEach(obj => {
            holder.insertAdjacentHTML('beforeend', holder.tempForEachTemplate);
            
            var tempNewEl = holder.querySelector('[for-each]');
            tempNewEl.removeAttribute('for-each');
    
            this.render(tempNewEl, obj, currHistory);
            this.renderBindings(tempNewEl, obj, currHistory);
        });
    
        this.renderBindings(holder, context, currHistory);
    }

    bindText(e, context, contextHistory) {
        var path = e.getAttribute('bind-raw');
        e.innerText = this.getBindingValue(context, contextHistory, e.getAttribute('bind-text'));
        e.removeAttribute('bind-text');
    }

    bindRaw(e, c, cH) {
        var path = e.getAttribute('bind-raw');
        var value = ((path.substring(0,1) == "{") ? this.getBindingExpression(c, cH, path) : this.getBindingValue(c, cH, path));
        e.innerHTML = value;
        e.removeAttribute('bind-raw');
    }

    bindClass(e, c, cH) {
        var path = e.getAttribute('bind-class');
        var value = ((path.substring(0,1) == "{") ? this.getBindingExpression(c, cH, path) : this.getBindingValue(c, cH, path));
        if((value ?? '') != ''){
            e.classList.add(value);
        }
        e.removeAttribute('bind-class');
    }

    getBindingExpression(context, contextHistory, path) {
        var regex = /\[[A-Z|a-z|0-9|.|\/| ]{0,99}\]/g;
        var matches = path.match(regex);
        if(matches != null) {
            matches.forEach(m => {
                var value = this.getBindingValue(context, contextHistory, m.slice(1,-1));
                if(typeof(value) == 'string') {
                    value = `'${value}'`;
                }
                path = path.replace(m, value);
            });
        }
        return eval(path.slice(1,-1));
    }

    getBindingValue(context, contextHistory, path){
        if(path == "$") {
            return context ?? '';
        } else {
            var count = (path.match(/.\//g) || []).length;
            path = path.replaceAll('./', '');
    
            if(count == 0){
                return context[path] ?? '';
            } else {
                return contextHistory[contextHistory.length - 1 - count][path] ?? '';
            }
        }
    }

    bindClickEvent(e, context, contextHistory) {
        e.clickHandler = {
            method: e.getAttribute('bind-click'),
            target: e.closest(`[role="${(e.getAttribute('bind-target') ?? 'parent')}"]`),
            args: {}
        };
    
        if(e.getAttribute('args') != null) {
            e.getAttribute('args').split(',').forEach(a => {
                var argName = a;
                var argValue = null;
    
                if (a.split('=').length == 2) {
                    argName = a.split('=')[0];
                    // argValue = context[a.split('=')[1]];
                    argValue = this.getBindingValue(context, contextHistory, a.split('=')[1]);
                } else {
                    // argValue = context[a];
                    argValue = this.getBindingValue(context, contextHistory, a);
                }
    
                e.clickHandler.args[argName] = argValue;
            });
        }
    
        e.addEventListener('click', function(){
            this.clickHandler.target[this.clickHandler.method](this, this.clickHandler.args);
        });
        e.style.cursor = 'pointer';
        e.removeAttribute('bind-click');
        e.removeAttribute('bind-target');
        e.removeAttribute('args');
    }
  
}
