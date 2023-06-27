/**
 * Creates an updater that runs a list of functions on each update call. Functions can be added and removed from the list.
 * @returns {Object} An object with `add`, `remove`, and `update` methods.
 */
export const createScriptManager = () => {
  let updateFunctions: ((time: number, delta: number) => void)[] = [];

  return {
    add: (updateFunction: (time: number, delta: number) => void) => {
      updateFunctions.push(updateFunction);
    },
    remove: (updateFunction: (time: number, delta: number) => void) => {
      updateFunctions = updateFunctions.filter((f) => f !== updateFunction);
    },
    update: (time: number, delta: number) => {
      for (let updateFunction of updateFunctions) {
        updateFunction(time, delta); // Call each function in the array
      }
    },
  };
};
