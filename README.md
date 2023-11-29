# Titan.TitanRenderProcessor
a framework to render html dynamically in the frontend, based on JSON-dataobjects and vanilla js webcomponents

# Why?

The Titan TitanRenderProcessor gives you the ability to render html strings dynamically in your frontend, without having the overheat of a big framework. The renderer just exists of one single .js-file witch you can easily integrate in your own project. You can rapidly achieve results in developing dynamic html-components without taking care of querying elements, assigning click logic and so on. Titan TitanRenderProcessor does this for you just with a couple of html attributes.

# Installation & usage

### Installation

For integrating Titan TitanRenderProcessor in your project, you only have to implement the .js script of the TitanRenderProcessor. For this example we do so by loading the script in the header of our html page:

``` html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
  	<script src="titan-renderer.js"></script>
  </head>
  <body></body>
</html>
```


### Provided attributes

The Titan RenderingProcessor provides the following simple html-attributes:

- bind-text: binds a value as innertext
- bind-class: binds a value as classname
- bind-style: binds a value to the style attribute
- bind-raw: binds a (html)-string as innerhtml

Each attribute can simply handle a property of the context-object or a complex scripting argument. For simply assigning a property of the context-object you can use the attribute as follows:

``` html
<div bind-text="LastName"></div>
```

If you want, as example bind two properties of the dataobject to a html-element, you can code the binding-expression like this example:

``` html
<div bind-text="{[LastName] + ', ' + [FirstName]}"></div>
```

This example will result in a concatination of the property 'LastName' with the string ', ' and the property 'FirstName'.

> [!WARNING]
> If you are using calculations instead of simply referencing a property of the context-object, always make sure, to wrap the expression inside curly brackets ({ }). If you want to reference properties of your context-object, always make sure to wrap the propertynames with square brackets ([ ]).

Also the framwork provides some more complex attributes:

- bind-click: binds a click-handler to the html element
- bind-target: specifies the target of the click-event (default: component)
- args: provides the definition of arguments, submitted to a click event
- bind-rerender: marks the section to be rerendered after the named event is raised

These are getting explained in more detail in the following part of the documentation.




# Basics of rendering

The rendering-process can simply be started by calling the "renderComponent" method on a instance of the "TitanRenderProcessor" class. The method takes in two parameters:
- the object you want to render
- a dataobject with the data you want to use for rendering

The dataobject-parameter is optional (default *null*). If you don´t submit a dataobject to the method, the Titan TitanRenderProcessor uses the "data"-property of the given element. In case your using a queried html element, this property might raise an error, because the elements usally don´t have a "data"-property assigned. So in this case you have to make sure, to always provide a specific dataobject.

If you are working with webcomponents as recommended, it is good practice, to assign the "data"-property to your webcomponent and don´t submit a other object to the RenderingProcessor. By doing so, you make sure the RenderingProcessor always uses the "data"-property of your webcomponents. This gets explained in more details later.

### Example: rendering specific element with specific data

Let´s say we have the following html element in our document:

``` html
<div id="demo">
  <p>Welcome <span bind-text="FirstName"></span> <span bind-text="LastName"></span>!</p>
</div>
```

We can call the rendering by executing the following javascript code:

``` javascript
new TitanRenderProcessor().renderComponent(
  document.getElementById('demo'),
  { LastName: 'Smith', FirstName: 'John' }
);
```

The content of the html-element then changes to this:

``` html
<div id="demo">
  <p>Welcome <span>John</span> <span>Smith</span>!</p>
</div>
```

As you see, we have rendered our html-element with the given dataobject. We can now provide different values to render the html-element with different data.

The important thing here is, that in the final html result, if you inspect your site, it is not possible to comprehend what the html template was looked like. So you can´t manipulate the bindings in the inspector.

### Example: rendering specific element with a iteration

If you have a dataobject, providing an iteration property, like a array, you can render each element of this array as seperate html-elements. To do so we edit our html-elemnt as follows:

``` html
<div id="demo">
  <p>Welcome <span bind-text="FirstName"></span> <span bind-text="LastName"></span>!</p>
  <ul>
    <li for-each="ProgrammingSkills" bind-text="language"></li>
  </ul>
</div>
```

Now we can render this element providing a more complex dataobject:

``` javascript
new TitanRenderProcessor().renderComponent(
  document.getElementById('demo'),
  {
    LastName: 'Smith', FirstName: 'John',
    ProgrammingSkills: [
      { language: 'C#', experience: 5 },
      { language: 'JavaScript', experience: 5 },
      { language: 'Python', experience: 1 },
      { language: 'MySQL', experience: 4 }
    ]
  }
);
```

Now the result of the rendering is changing the html-element to this:

``` html
<div id="demo">
  <p>Welcome <span>John</span> <span>Smith</span>!</p>
  <ul>
    <li>C#</li>
    <li>JavaScript</li>
    <li>Python</li>
    <li>MySQL</li>
  </ul>
</div>
```

In the above example we iterated over a array of objects. In this case we can, as demonstrated, use the properties of any child element. But if we have a dataobject providing an array with strings only, you have no property to use for the binding. In this case you can use the self operator ($) to reference to the value of the iteration element (the currently iterated string).

Let us take a look at a example. We have the same dataobject, as above, but this time the skills are only strings, not objects:

``` javascript
new TitanRenderProcessor().renderComponent(
  document.getElementById('demo'),
  {
    LastName: 'Smith', FirstName: 'John',
    ProgrammingSkills: [
      'C#', 'JavaScript', 'Python', 'MySQL'
    ]
  }
);
```

In our html-template we now use the self-operator, to bind the string as inner text:

``` html
<div id="demo">
  <p>Welcome <span bind-text="FirstName"></span> <span bind-text="LastName"></span>!</p>
  <ul>
    <li for-each="ProgrammingSkills" bind-text="$"></li>
  </ul>
</div>
```



# Usage of webcomponents

The recommended way to use Titan RenderingProcessor is, to implement it in context of webcomponents. Because of this, we will take a look on how to write such a component with the use of the framework.

> [!NOTE]
> In the following content, we make use of templates, defined in strings inside of our webcomponent. This is possible, but note, that this isn´t actual a good practice. Normally you would fetch the template from another ressource, like a database as example.

**Target:** our goal is to achieve a webcomponent witch renders a list of colors as list. The colors should have a name and a hex colorcode. Inside the list the colors should be shown as a round circle, following by a label with the name of the color.

To get startet, we simply create a custom component named "TestComponent" and implement the TitanComponent base class:

``` javascript
class TestComponent extends TitanComponent {
  constructor(){
    super();
  }
}
customElements.define('test-component', TestComponent);
```

> [!IMPORTANT]
> Always make sure, to define the component by giving it a tag-name, for using it later in html. The Definition is made by calling "customElements.define([tag-name], [className]);"

If you build your own webcomponents, it is recommended to use the provided base class as shown. This is because it already implements methods used by several features of the RenderingProcessor.

Now we implement a template and the render method in our webcomponent. The render-method is called by the base class, when our component connects to the document (gets rendered in dom).

``` javascript
class TestComponent extends TitanComponent {
  constructor(){
    super();
    this.data = {
      colors: [
        { name: "Absolute Zero", hex: "#0048BA" },
        { name: "Acid Green", hex: "#B0BF1A" },
        { name: "Aero", hex: "#7CB9E8" },
        { name: "Aero Blue", hex: "#C9FFE5" }
      ]
    };
  }

  // render method
  render(){
    this.innerHTML = this.template;
  }

  // the template of the component
  template = `
      <div>
        <h1>That are some random colors:</h1>
        <ul style="list-style: none;">
          <!-- one list element for all colors -->
          <li for-each="colors">
            <div style="display: flex">
              <!-- round colored point -->
              <div style="width: 15px; height: 15px; border-radius: 50%; margin-right: 5px;"
                bind-style="{'background-color: ' + [hex] + ';'}">
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

> [!NOTE]
> The base class (TitanComponent) is covering the connectedCallback method to call the render-method.

Our webcomponent now renders a list of colors. If you want to extend the list of colors, feel free to add more colors in the dataobject. You can also make use of the following github-project, providing a json list of many colors (make sure to remove the quotes on the property names as done above): https://github.com/cheprasov/json-colors/blob/master/colors.json

**Bonus:** Now we want to implement a little bit of interaction-logic to our webcomponent. Let us implement a click-method on each color in the list, wich changes the background-color of our page to the clicked color. For that we need to do following things:

- bind a click-event to each list-item
- implement a function in our webcomponent, handling the click event

First we change our template of the component:

``` javascript
class TestComponent extends TitanComponent {
  // [...]

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

If you look at the template, you might notice the new binded arguments "bind-click" and "args". The "bind-click" argument defines the method to invoke on clicking the element. In this example it invokes the method "pickColor" in our webcomponent, witch we haven´t defined yet. The "args" attribute defines witch arguments we giving the method while invoking.

The current implementation of the args attribute means, that we provide an args-object with two properties: Name and HexCode. This properties get defined by the iteration element (properties name and hex). So the object witch we are submitting to the method looks like this:

{ Name: [nameOfColor], HexCode: [hexCode] }

Now we can implement the method to handling the click in our webcomponent:

``` javascript
class TestComponent extends TitanComponent {
  // [...]

  // method to handle button click
  pickColor(e, args){
    alert(`you picked the color '${args.Name}'!`);
    document.body.setAttribute('style', `background-color: ${args.HexCode};`);
  }
}
```

If you implement methods to handle click-events in your project, the method is always the same schema: the method takes the source element witch is clicked (e) and takes the object with the provided arguments (args), defined in the html structure. If you haven´t defined arguments, the args object is a empty object ({ }). It is never *null*.

Now our webcomponent is finished. It shows a list of colors and changes the background every time you click on one of the colors in the list.
