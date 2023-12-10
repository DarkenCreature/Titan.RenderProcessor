class TestClass extends TitanComponent {
    constructor(){
        super();
        this.$__state.data = {
            FirstName: 'Thomas',
            Skills: [
                { name: 'C#', experiences: [
                    { name: 'private', years: 10 },
                ]},
                { name: 'JavaScript', experiences: [
                    { name: 'private', years: 10 },
                    { name: 'job', years: 5 },
                ]},
                { name: 'Java', experiences: [
                    { name: 'job', years: 1 },
                ]}
            ],
            count: 26
        }
    }

    increment(){
        this.data.count++;
    }

    decrease(){
        this.data.count--;
    }

    render(){
        this.innerHTML = `
            <div>
                <h1 bind-text="{'Hello ' + [FirstName]}"></h1>
                <h3 bind-raw="{'Ich bin <span>' + [FirstName] + '</span> und <span>' + [count] + '</span> Jahre alt!'}"></h3>

                <div class="d-f">
                    <div class="w-50">
                        <input type="text"
                            bind-value="FirstName"
                            bind-attribute="{([FirstName] == 'Thomas' ? 'disabled' : '')}"
                            bind-class="{[FirstName] == 'Thomas' ? 'cool' : ''}"/>
                    </div>

                    <div class="w-50">
                        <select bind-value="FirstName">
                            <option>Thomas</option>
                            <option>Jeanine</option>
                        </select>
                    </div>

                    <div for-each="Skills" class="d-f w-100">
                        <input bind-value="name" type="text" class="w-50"/>
                        <input bind-value="name" type="text" class="w-50"/>
                    </div>
                </div>

                
                <div for-each="Skills">
                    <h3 bind-text="name"></h3>
                    <ul style="list-style: none;">
                        <li for-each="experiences"
                            bind-text="{[name] + ' (' + [years] + ')'    }"></li>
                    </ul>
                    <hr>
                </div>
                
                
                <h1 bind-text="count"></h1>
                <button bind-click="decrease">-</button>
                <button bind-click="increment">+</button>
            </div>
        `;

        var _proc = new TitanRenderProcessor();
        /// this.dataObj = this.createDeepProxy(this.data);
        _proc.renderComponent(this); //, this.dataObj);
    }
    
}

customElements.define('test-class', TestClass);
