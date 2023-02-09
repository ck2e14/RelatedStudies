let renderStates = {
   renderModal: false,
};

let stateManager = {
   get(target, property) {
      console.log(property + " is " + target[property]);
   },
};

let renderStatesProxy = new Proxy(renderStates, stateManager);
console.log(renderStatesProxy.renderModal);
