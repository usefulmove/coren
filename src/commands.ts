import * as R from "../node_modules/ramda/";

type Stack = string[];
type Op = string;

const getNumber = (stck: Stack): [number, Stack] => {
  const n: number = parseFloat(stck.at(-1));
  const rest: Stack = stck.slice(0, -1);
  return [n, rest];
};

const getNumber2 = (stck: Stack): [number, number, Stack] => {
  const [b, restb] = getNumber(stck);
  const [a, rest] = getNumber(restb);
  return [a, b, rest];
};

export class Commands {
  public evaluateOps =
    (ops: Ops) =>
    (stck: Stack): Stack => {
      console.log({ ops, stck });

      const out_st: Stack = R.reduce(
        (interimStack: Stack, op: Op): Stack =>
          this.cmds.has(op)
            ? this.cmds.get(op)(interimStack)
            : [...interimStack, op],
        stck,
        ops
      );

      return out_st;
    };

  cmds: Map<string, any> = new Map<string, any>();

  constructor() {
    // nullary operations
    this.cmds.set("pi", (stck: Stack): Stack => [...stck, Math.PI.toString()]);
    this.cmds.set("e", (stck: Stack): Stack => [...stck, Math.E.toString()]);

    // unary operations
    type UnaryOperator = (a: number) => number;

    const executeUnaryOp = (op: UnaryOperator): ((stck: Stack) => Stack) => {
      return (stck: Stack): Stack => {
        const [a, rest] = getNumber(stck);
        return [...rest, op(parseFloat(a)).toString()];
      };
    };

    this.cmds.set("sqrt", executeUnaryOp(Math.sqrt));
    this.cmds.set(
      "inv",
      executeUnaryOp((a: number) => 1 / a)
    );

    // binary operations
    const add = (a: number, b: number): number => a + b;
    const subtract = (a: number, b: number): number => a - b;
    const multiply = (a: number, b: number): number => a * b;
    const divide = (a: number, b: number): number => a / b;
    const power = (a: number, b: number): number => Math.pow(a, b);

    type BinaryOperator = (a: number, b: number) => number;

    const executeBinaryOp = (op: BinaryOperator): ((stck: Stack) => Stack) => {
      return (stck: Stack): Stack => {
        const [a, b, rest] = getNumber2(stck);
        return [...rest, op(parseFloat(a), parseFloat(b)).toString()];
      };
    };

    this.cmds.set("+", executeBinaryOp(add));
    this.cmds.set("-", executeBinaryOp(subtract));
    this.cmds.set("x", executeBinaryOp(multiply));
    this.cmds.set("/", executeBinaryOp(divide));
    this.cmds.set("^", executeBinaryOp(power));

    // stack operations
    this.cmds.set("cls", (stck: Stack): Stack => []);
    this.cmds.set("dup", (stck: Stack): Stack => [...stck, stck.at(-1)]);
    this.cmds.set("drop", (stck: Stack): Stack => [...stck.slice(0, -1)]);
    this.cmds.set("dropn", (stck: Stack): Stack => {
      const [a, rest] = getNumber(stck);
      return [...rest.slice(0, -a)];
    });
    this.cmds.set("swap", (stck: Stack): Stack => {
      const [a, b, rest] = getNumber2(stck);
      return [...rest, b, a];
    });
  }
}
