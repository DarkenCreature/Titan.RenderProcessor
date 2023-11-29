# Titan.RenderProcessor
a framework to render html dynamically in the frontend, based on JSON-dataobjects

# Why?

In my current main-project I need to have a renderer for html-strings. So for example I load a html template directly from the database and want to render it on my page, without having to write complex javascript code to select single nodes, assign all variables and so on. I wanted to have a framework that renders my html strings in the frontend, without traces in the actual html-code.


# Usage

The Titan RenderProcessor uses mainly vanilla webcomponents to process rendering. You can also use any html element for rendering, but it is recommended to use your own webcomponents 

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
    `;
}
```
