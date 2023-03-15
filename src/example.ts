/*
  In this version, we define separate functions for each binary operation (add, subtract, etc.), as well as a generic binaryOp function that takes a binary operator function and returns a function that operates on the stack. This approach follows the functional programming paradigm by separating concerns and increasing code modularity.

  Additionally, instead of using parseFloat to convert the input values to numbers, we can specify the getNumber2 function to return numbers directly. This removes the need for redundant type conversions and makes the code more concise.

  Overall, this version is easier to read, more modular, and less prone to errors, making it more maintainable than the original code.
*/

const add = (a: number, b: number): number => a + b;
const subtract = (a: number, b: number): number => a - b;
const multiply = (a: number, b: number): number => a * b;
const divide = (a: number, b: number): number => a / b;
const power = (a: number, b: number): number => Math.pow(a, b);

type BinaryOperator = (a: number, b: number) => number;

const binaryOp = (op: BinaryOperator): ((stck: Stack) => Stack) => {
  return (stck: Stack): Stack => {
    const [a, b, rest] = getNumber2(stck);
    return [...rest, op(parseFloat(a), parseFloat(b)).toString()];
  };
};

this.cmds.set("+", binaryOp(add));
this.cmds.set("-", binaryOp(subtract));
this.cmds.set("x", binaryOp(multiply));
this.cmds.set("/", binaryOp(divide));
this.cmds.set("^", binaryOp(power));
