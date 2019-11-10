## NLND Navigation

This is a simple view-manager for react-native that get's a group of routes and stacks and creates a view-manager which can act as the navigation system of the app.

This module does not provide any sort of UI navigation components like Tab navigations or Drawer navigations. It only provides the basic system where you can use the navigation functions to do what you want.

### Sample

This is a simple example to see how it works:

```js
import { NlndNavigation } from "nlnd-navigation";

const stacks = {
  name: "root",
  initialStack: "homestack",
  stacks: [
    {
      name: "homestack",
      initialRoute: "home",
      routes: [{ key: "home", route: Home }, { key: "page1", route: Page1 }],
      stacks: [
        {
          name: "page2stack",
          initialRoute: "page2",
          routes: [{ key: "page2", route: Page2 }]
        },
        {
          name: "page3stack",
          initialRoute: "page3",
          routes: [{ key: "page3", route: Page3 }]
        }
      ]
    }
  ]
};

const App = () => {
  return <NlndNavigation stack={stacks} />;
};
```

And you can do the navigations like so:

This is an example of in-stack navigations:

```js
<Button onPress={() => props.navigation.navigate("page1")} title="Page 1" />
```

To do inter-stack navigations, we provide a function that would route to your desired destination from root:

```js
<Button
  onPress={() =>
    props.navigation.navigateFromRoot(
      ["root", "homestack", "page2stack"],
      "page2"
    )
  }
  title="Page 2"
/>
```

This will route from root, to homestack, to page2stack and finally to the page2 component.

### Refrences

| Function                               | Return type                                                                                  | Description                                                       |
| -------------------------------------- | -------------------------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| getStacks()                            | string                                                                                       | Will return a comma seperated list of all stacks                  |
| getRoutes()                            | string                                                                                       | Will return a comma seperated list of all routes                  |
| getCurrentStack()                      | string                                                                                       | Will return the name of the current stack                         |
| getCurrentRoute()                      | string                                                                                       | Will return the name of the current route                         |
| goBack()                               | boolean                                                                                      | Goes back to the previous route. returns false on failure.        |
| goHome()                               | boolean                                                                                      | Goes to the initial route of the stack. returns false on failure. |
| navigate(key, props)                   | boolean                                                                                      | Will navigate to the given route, inside the stack.               |
| navigateFromRoot(stacks[], key, props) | Will route to the given key, starting from the root stack and moving along the stacks array. |

### Preview
<img src="navigation.gif" width="300" />

### Authors

Ali Rezaee <nlndipi@hotmail.com>
