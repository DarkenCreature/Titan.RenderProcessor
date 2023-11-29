# Titan.RenderProcessor
a framework to render html dynamically in the frontend, based on JSON-dataobjects

# Why?

The Titan RenderProcessor gives you the ability to render html strings dynamically in your frontend, without having the overheat of a big framework. The renderer just exists of one single .js-file witch you can easily integrate in your own project. You can rapidly achieve results in developing dynamic html-components without taking care of querying elements, assigning click logic and so on. Titan RenderProcessor does this for you.

# Usage

It is recommended to use vanilla webcomponents for rendering with Titan RenderProcessor. But you can also use any html element for rendering.

## Basic: Integrate Titan RenderingProcessor

For integrating Titan RenderProcessor in your project, you only have to implement the .js script of the RenderProcessor. For this example we do so by loading the script in the header of our html page:

``` html
<html>
  <head>
    <script src="src/titan-renderprocessor.js"></scipt>
  </head>
  <body></body>
</html>
```


## Usage with webcomponents

As said before, it is recommended to use webcomponents in your project. So we do 

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
