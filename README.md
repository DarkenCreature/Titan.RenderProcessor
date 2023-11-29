# Titan.RenderProcessor
a framework to render html dynamically in the frontend, based on JSON-dataobjects and vanilla js webcomponents

# Why?

The Titan RenderProcessor gives you the ability to render html strings dynamically in your frontend, without having the overheat of a big framework. The renderer just exists of one single .js-file witch you can easily integrate in your own project. You can rapidly achieve results in developing dynamic html-components without taking care of querying elements, assigning click logic and so on. Titan RenderProcessor does this for you just with a couple of html attributes.

# Usage

For integrating Titan RenderProcessor in your project, you only have to implement the .js script of the RenderProcessor. For this example we do so by loading the script in the header of our html page:

``` html
<html>
  <head>
    <script src="src/titan-renderprocessor.js"></scipt>
  </head>
  <body></body>
</html>
```


### Provided attributes

The Titan RenderingProcessor provides the following html-attributes:

- bind-text: binds a value as innertext
- bind-class: binds a classname
- bind-style: binds a value to the style attribute
- bind-raw: binds a (html)-string as innerhtml
- bind-click: binds a click-handler to the html element
- args: provides the definition of arguments assigned to a click event

Each attribute can simply handle a property of the context-object or a complex scripting argument. For simply assigning a property of the context-object you can use the attribute as follows:

``` html
<div bind-text="LastName"></div>
```

If you want, as example bind two properties of the dataobject to a html-element, you can code the binding-expression like this example:

``` html
<div bind-text="{[LastName] + ', ' + [FirstName]}"></div>
```

This example will result in a concatination of the property 'LastName' with the string ', ' and the property 'FirstName'.

> [!TIP]
> Always make sure, to wrap the expression inside curly brackets ({ }). If you want to reference properties of your context-object, always make sure to wrap the propertynames with square brackets ([ ]).




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


# Basics of rendering

The rendering-process can simply be started by calling the "renderComponent" method on a instance of the "RenderProcessor" class. The method takes two parameters:
- the object you want to render
- a dataobject with the data you want to use for rendering

### Rendering specific element with specific data

Let´s say we have the following html element in our document:

``` html
<div id="demo">
  <p>Welcome <span bind-text="LastName"></span> <span bind-text="FirstName"></span>!</p>
</div>
```

We can call the rendering by executing the following javascript code:

``` javascript
new RenderProcessor().renderComponent(
  document.getElementById('demo'),
  { LastName: 'Smith', FirstName: 'John' }
);
```

The content of the html-element then changes to this:

``` html
<div id="demo">
  <p>Welcome <span>Smith</span> <span>John</span>!</p>
</div>
```

As you see, we have rendered our html-element with the given dataobject. We can now provide different values to render the html-element with different data.

The important thing here is, that in the final html result, if you inspect your site, it is not possible to comprehend what the html template was looked like. So you can´t manipulate the bindings in the inspector.

### Rendering specific element with a iteration

If you have a dataobject, providing an iteration property, like a array, you can render each element of this array as seperate html-elements. To do so we edit our html-elemnt as follows:

``` html
<div id="demo">
  <p>Welcome <span bind-text="LastName"></span> <span bind-text="FirstName"></span>!</p>
  <ul>
    <li for-each="ProgrammingSkills" bind-text="language"></li>
  </ul>
</div>
```

Now we can render this element providing a more complex dataobject:

``` javascript
new RenderProcessor().renderComponent(
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
  <p>Welcome <span>Smith</span> <span>John</span>!</p>
  <ul>
    <li>C#</li>
    <li>JavaScript</li>
    <li>Python</li>
    <li>MySQL</li>
  </ul>
</div>
```







# =====================
# =====================
# =====================
# =====================




With the call of the function we given the renderer a empty dataobject. This makes no sense, because the renderer then can not assign any data or structure to the provided element. To solve this problem you can assign any data to the provided object. Lets say we have a html element like this one:


In this case we call the renderer by giving him the needed data for rendering this html-element:





The attributes of the Titan RenderingProcessor all work the same way. You can assign a attribute to a specific html-element and the RenderingProcessor will interpret and process this attribute.

A attribute is always interpreted with the current **context** in witch the RenderingProcessor stays. At the top level, in the default configuration (with the use of webcomponents), the context is assigned to the "data" property of the webcomponent. If your webcomponent doesn´t implement a data-attribute, the rendering-process will fail.

> [!IMPORTANT]
> You can call the RenderingProcessor without a webcomponent. If you do so, make sure to call it with a dataobject as context.

If you have a html-element with an iterator-attribute like "for-each", the context of all child elements change to the child-elements of the iterated element. Lets say, in the constructor of your webcomponent, you assign a data object like this one:

``` javascript
class DemoComponent extends TitanComponent {
  constructor(){
    super();
    this.data = {
      FirstName: 'John',
      LastName: 'Smith',
      ProgrammingSkills: [
        { language: 'C#', experience: 5 },
        { language: 'JavaScript', experience: 5 },
        { language: 'Python', experience: 1 },
        { language: 'MySQL', experience: 4 }
      ]
    };
  }

  template = `
    <div>
      <h1>
        Hello! I´m <span bind-text="FirstName"></span> <span bind-text="LastName"></span>!
      </h1>
      <p>My skills are:</p>
      <ul>
        <li for-each="ProgrammingSkills" bind-text="language"></li>
      </ul>
    </div>
  `:
}
```



### bind attributes

bind-class: binds a value as class attribute


# types of binding values

You can define attributes on two different way:

## take object-property: 
