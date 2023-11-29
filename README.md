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

  // render method
  render(){
    this.innerHTML = this.template;
  }

  // method to handle button click
  pickColor(e, args){
    alert(`you picked the color '${args.Name}'!`);
    document.body.setAttribute('style', `background-color: ${args.HexCode};`);
  }

  // the template of the component
  template = `
      ``` html
      <div>
        <h1>That are some random colors:</h1>
        <h3>Pick a color to change background</h3>
        <ul style="list-style: none;">
          <!-- one list element for all colors -->
          <li for-each="colors">
            <div style="display: flex">
              <!-- round colored point with click handler -->
              <div style="width: 15px; height: 15px; border-radius: 50%; margin-right: 5px;"
                bind-style="{'background-color: ' + [hex] + ';'}"
                bind-click="pickColor" args="Name=name,HexCode=hex">
              </div>
              <!-- end point -->

              <span bind-text="name"></span>
            </div>
          </li>
          <!-- end list element -->
        </ul>
      </div>
      ```
    `;
}
```
