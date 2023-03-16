import * as R from "../node_modules/ramda/";

type Stack = string[];
type Op = string;
type Ops = string[];
type StackFunction = (input: Stack) => Stack;

const getOp = (stck: Stack): [Op, Stack] => {
  const op: Op = stck.at(-1);
  const rest: Stack = stck.slice(0, -1);
  return [op, rest];
};

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
  cmds = new Map<string, StackFunction>(); // built-in commands
  userCmds = new Map<string, Ops>(); // user-defined and anonymous functions

  loadingUserDefFunc = false;

  // evaluateOps
  public evaluateOps =
    (ops: Ops) =>
    (stck: Stack): Stack => {
      console.log({ ops, stck });

      const out_st: Stack = ops.reduce((interimStack: Stack, op: Op): Stack => {
        console.log({ interimStack, op });

        switch (this.cmds.has(op)) {
          case true: // command (known)
            console.log("loading? . . . ", this.loadingUserDefFunc);
            switch (this.loadingUserDefFunc) {
              case false: // default (general case)
                return this.cmds.get(op)(interimStack);
              case true:
                console.log(`loading user function definition . . . ${op}`);
                this.loadingUserDefFunc = this.loadUserDefFunc(op);
                return [...interimStack];
            }
          case false:
            return [...interimStack, op]; // value (unknown command)
        }
      }, stck);

      return out_st;
    };

  // user-defined functions
  udfStartChar: string = "(";
  udfEndChar: string = ")";

  // TODO: troubleshoot closure behavior
  loadUserDefFunc = (op: Op): boolean => {
    let instantiated = false;
    let name: string;

    return (op: Op): boolean => {
      switch (instantiated) {
        case false:
          name = op;
          this.userCmds.set(name, []);
          instantiated = true;
          return true; // continue loading
        case true:
          if (op === this.udfEndChar) return false; // stop loading (recording) user function

          this.userCmds.get(name).push(op);

          return true; // continue loading
      }
    };
  };

  // constructor - create built-in commands
  constructor() {
    // simple nullary operations
    this.cmds.set("pi", (stck: Stack): Stack => [...stck, Math.PI.toString()]);
    this.cmds.set("e", (stck: Stack): Stack => [...stck, Math.E.toString()]);

    // simple unary operations
    type UnaryOperator = (a: number) => number;

    const executeUnaryOp = (op: UnaryOperator): ((stck: Stack) => Stack) => {
      return (stck: Stack): Stack => {
        const [a, rest] = getNumber(stck);
        return [...rest, op(parseFloat(a)).toString()];
      };
    };

    this.cmds.set("sqrt", executeUnaryOp(Math.sqrt));
    this.cmds.set("floor", executeUnaryOp(Math.floor));
    this.cmds.set("ceil", executeUnaryOp(Math.ceil));
    this.cmds.set("round", executeUnaryOp(Math.round));
    this.cmds.set("abs", executeUnaryOp(Math.abs));
    this.cmds.set(
      "inv",
      executeUnaryOp((a: number) => 1 / a)
    );

    const radToDeg = (a: number): number => (a * 180) / Math.PI;
    const degToRad = (a: number): number => (a * Math.PI) / 180;
    this.cmds.set("deg_rad", executeUnaryOp(degToRad));
    this.cmds.set("rad_deg", executeUnaryOp(radToDeg));
    this.cmds.set("sin", executeUnaryOp(Math.sin));
    this.cmds.set("cos", executeUnaryOp(Math.cos));
    this.cmds.set("tan", executeUnaryOp(Math.tan));
    this.cmds.set("asin", executeUnaryOp(Math.asin));
    this.cmds.set("acos", executeUnaryOp(Math.acos));
    this.cmds.set("atan", executeUnaryOp(Math.atan));

    this.cmds.set(
      "c_f",
      executeUnaryOp((a) => (a * 9) / 5 + 32)
    );
    this.cmds.set(
      "f_c",
      executeUnaryOp((a) => ((a - 32) * 5) / 9)
    );

    // simple binary operations
    const add = (a: number, b: number): number => a + b;
    const subtract = (a: number, b: number): number => a - b;
    const multiply = (a: number, b: number): number => a * b;
    const divide = (a: number, b: number): number => a / b;
    const mod = (a: number, b: number): number => a % b;
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
    this.cmds.set("%", executeBinaryOp(mod));
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

    // ???
    this.cmds.set(
      "sum",
      (stck: Stack): Stack => [
        stck.reduce((sum, a) => sum + parseFloat(a), 0).toString(),
      ]
    );
    this.cmds.set(
      "prod",
      (stck: Stack): Stack => [
        stck.reduce((prod, a) => prod * parseFloat(a), 1).toString(),
      ]
    );
    this.cmds.set("io", (stck: Stack): Stack => {
      const [a, rest] = getNumber(stck);
      return [
        ...rest,
        ...Array.from(Array(a).keys()).map((a) => (a + 1).toString()),
      ];
    });

    // higher-order functions
    this.cmds.set(this.udfStartChar, (stck: Stack): Stack => {
      console.log("here!");
      this.loadingUserDefFunc = true;
      return [...stck];
    });
  }
}
