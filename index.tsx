import React, { Component } from "react";
import { View, StyleProp, ViewStyle, BackHandler } from "react-native";

interface RouteProp {
  key: string;
  route: (props?: any) => JSX.Element;
}

interface StackProp {
  name: string;
  initialRoute?: string;
  initialStack?: string;
  routes?: RouteProp[];
  stacks?: StackProp[];
}

interface Props {
  stack: StackProp;
  style?: StyleProp<ViewStyle>;
}

interface State {
  currentStack: Stack;
  currentRoute: Route;
  currentProps: any;
}

interface Navigation {
  getStacks(): string;
  getRoutes(): string;
  getCurrentStack(): string;
  getCurrentRoute(): string;
  goBack(): boolean;
  goHome(): boolean;
  navigate(key: string, props?: any): boolean;
  navigateFromRoot(stacks: string[], key: string, props?: any): boolean;
  rootStack: Stack;
  initialStack: Stack;
  initialRoute: Route;
}

interface Stack {
  name: string;
  routes?: Route[];
  stacks?: Stack[];
  initial?: Route;
  parentStack?: Stack;
}

interface Route {
  key: string;
  route: () => JSX.Element;
  parentStack: Stack;
  previousRoute?: Route;
  previousProps?: any;
}

class NlndNavigation extends Component<Props, State> {
  navigation: Navigation;

  getRoute = (props: RouteProp, stack: Stack) => {
    const route: Route = {
      key: props.key,
      route: props.route,
      parentStack: stack,
    };

    return route;
  };

  getStack = (props: StackProp, parentStack?: Stack) => {
    const stack: Stack = {
      name: props.name,
    };

    if (props.routes) {
      stack.routes = props.routes!.map((item) => this.getRoute(item, stack));
      stack.initial = stack.routes.filter(
        (item) => item.key === props.initialRoute,
      )[0];
    }
    if (props.stacks) {
      stack.stacks = props.stacks!.map((item) => this.getStack(item, stack));
    }
    stack.parentStack = parentStack;

    return stack;
  };

  getStacks = (stack: Stack): string => {
    const names = [];
    names.push(stack);

    if (!stack.stacks) {
      return stack.name;
    }

    return stack.stacks.map((item) => this.getStacks(item)).join(",");
  };

  getRoutes = (stack: Stack): string => {
    const names = [];
    names.push(stack);

    if (!stack.stacks) {
      return stack.routes!.map((item) => item.key).join(",");
    }

    return stack.stacks.map((item) => this.getRoutes(item)).join(",");
  };

  goBack = () => {
    if (this.state.currentRoute.previousRoute) {
      const prev = this.state.currentRoute.previousRoute;
      const prevProps = this.state.currentRoute.previousProps;
      this.setState({
        currentRoute: prev,
        currentStack: prev.parentStack,
        currentProps: prevProps,
      });
      return true;
    }

    return false;
  };

  goHome = () => {
    if (this.state.currentRoute != this.state.currentStack.initial) {
      this.setState({ currentRoute: this.state.currentStack.initial! });
      return true;
    }
    return false;
  };

  navigate = (route: string, props: any) => {
    const routes = this.state.currentStack.routes!.filter(
      (item) => item.key === route,
    );

    if (routes.length === 1) {
      const currentRoute = routes[0];
      currentRoute.previousRoute = this.state.currentRoute;
      currentRoute.previousProps = this.state.currentProps;
      this.setState({ currentRoute, currentProps: props });
      return true;
    }
    return false;
  };

  navigateFromRoot = (stacks: string[], key: string, props: any) => {
    let currentStack = this.navigation.rootStack;

    for (let i in stacks) {
      if (currentStack.name === stacks[Number(i)]) {
        if (currentStack.routes) {
          const route = currentStack.routes!.filter((item) => item.key === key);
          if (route.length === 1) {
            const currentRoute = route[0];
            currentRoute.previousRoute = this.state.currentRoute;
            currentRoute.previousProps = this.state.currentProps;
            this.setState({
              currentRoute,
              currentStack,
              currentProps: props,
            });
            return true;
          }
        }
      }
      const st = currentStack.stacks!.filter(
        (s) => s.name === stacks[Number(i) + 1],
      );
      if (st.length === 1) {
        currentStack = st[0];
        continue;
      }
      return false;
    }

    return false;
  };

  constructor(props: Props) {
    super(props);

    const rootStack = this.getStack(props.stack);
    let initialStack = rootStack;
    if (!props.stack.routes || props.stack.routes.length === 0) {
      if (!props.stack.initialStack) {
        throw new Error(
          "Your current stack, has not routes installed. Please provide 'initialStack' parameter to get the initial routes from",
        );
      }
      initialStack = rootStack.stacks!.filter(
        (item) => item.name === props.stack.initialStack,
      )[0];
    }

    this.navigation = {
      rootStack: rootStack,
      initialStack: initialStack,
      initialRoute: initialStack.initial!,
      getStacks: () => this.getStacks(rootStack),
      getRoutes: () => this.getRoutes(rootStack),
      getCurrentRoute: () => this.state.currentRoute.key,
      getCurrentStack: () => this.state.currentStack.name,
      goBack: this.goBack,
      goHome: this.goHome,
      navigate: this.navigate,
      navigateFromRoot: this.navigateFromRoot,
    };

    BackHandler.addEventListener("hardwareBackPress", () => {
      if (
        !(
          this.state.currentStack === this.navigation.rootStack &&
          this.state.currentRoute === this.navigation.initialRoute
        )
      ) {
        this.goBack();
        return true;
      }
    });

    this.state = {
      currentStack: initialStack,
      currentRoute: this.navigation.initialRoute,
      currentProps: null,
    };
  }

  render = () => {
    const Comp = this.state.currentRoute.route;
    return (
      <View style={this.props.style}>
        <Comp {...this.state.currentProps} navigation={this.navigation} />
      </View>
    );
  };
}

interface NlndNavigationProps {
  navigation: Navigation;
}

export { NlndNavigation, NlndNavigationProps, Stack as NavigationStack };
