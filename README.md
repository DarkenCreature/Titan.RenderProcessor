# Titan.RenderProcessor
a framework to render html dynamically in the frontend, based on JSON-dataobjects


``` html
<html>
  <head></head>
  <body>
    <test-component></test-component>
  </body>
</html>
```

Create Custom Component:

``` javascript
class TestComponent extends TitanComponent {
  constructor(){
    super();
  }

  render(){
    this.innerHTML = `
      <div>
        <h1>That are some random colors:</h1>
        <ul style="list-style: none;">
          <li for-each="colors">
            <div style="display: flex">
              <div style="width: 15px; height: 15px; border-radius: 50%; margin-right: 5px;"
                bind-style="{'background-color: ' + [hex] + ';'}"
                bind-click="pickColor" args="Name=name,HexCode=hex">
              </div>
              <span bind-text="name"></span>
            </div>
          </li>
        </ul>
      </div>
    `;
  }
}
```
