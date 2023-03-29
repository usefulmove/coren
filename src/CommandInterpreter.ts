import * as R from "ramda";

/*
  Note: Base data structure is an array used as a stack. Atoms on the list
  are either be symbols (commands) or values. Each calculation is a list of
  operations that are processed in order of occurrence. This is an imple-
  mentation of a list processor (LISP) for Reverse Polish Notation (RPN)
  S-expressions.

    operations list structure
      ( object : command or value )
      "5"
      "sqrt"
      "1
      "-"
      "2"
      "/"

  A list evaluation engine takes the list of strings and executes the 
  corresponding operations then returns the resulting mutated stack.
*/

type Stack = string[]; // stack
type Op = string; // operation
type Ops = string[]; // operations list
type StackFn = (input: Stack) => Stack; // stack transformation function

const getOp = (stck: Stack): [Op, Stack] => {
  const op: Op = R.last(stck) ?? "";
  const rest: Stack = R.dropLast(1)(stck) as Stack;
  return [op, rest];
};

const getStackNumber = (stck: Stack): [Stack, number] => {
  const n: number = parseFloat(R.last(stck) ?? "0");
  const rest: Stack = R.dropLast(1)(stck) as Stack;
  return [rest, n];
};

const getStackNumberHex = (stck: Stack): [Stack, number] => {
  const n: number = parseInt(R.last(stck) ?? "0", 16);
  const rest: Stack = R.dropLast(1)(stck) as Stack;
  return [rest, n];
};

const getStackNumber2 = (stck: Stack): [Stack, number, number] => {
  const [restb, b] = getStackNumber(stck);
  const [rest, a] = getStackNumber(restb);
  return [rest, a, b];
};

const getStackNumber3 = (stck: Stack): [Stack, number, number, number] => {
  const [restc, c] = getStackNumber(stck);
  const [restb, b] = getStackNumber(restc);
  const [rest, a] = getStackNumber(restb);
  return [rest, a, b, c];
};

const getStackNumber3Hex = (stck: Stack): [Stack, number, number, number] => {
  const [restc, c] = getStackNumberHex(stck);
  const [restb, b] = getStackNumberHex(restc);
  const [rest, a] = getStackNumberHex(restb);
  return [rest, a, b, c];
};

export class CommandInterpreter {
  cmdfns = new Map<string, StackFn>(); // built-in commands
  userCmdOps = new Map<string, Ops>(); // user-defined and anonymous functions

  loadingUserFunction = false;

  // user-defined functions
  public getUserCmdNames = (): string[] => {
    const names = [...this.userCmdOps.keys()];
    return names.filter((x) => x !== this.lambdaOp);
  };

  // evaluateOps
  public evaluateOps =
    (ops: Ops) =>
    (stck: Stack): Stack => {
      return ops.reduce((interimStack: Stack, op: Op): Stack => {
        // loading user function
        if (this.loadingUserFunction) {
          this.loadingUserFunction = this.loadUserFunction(op);
          return [...interimStack];
        }
        // built-in command - run command function on interim stack
        if (this.cmdfns.has(op)) {
          return this.cmdfns.get(op)!(interimStack);
        }
        // user function - make recursive call to evaluateOps using stored ops
        if (this.userCmdOps.has(op)) {
          const uops = this.userCmdOps.get(op)!;
          const updateStack = this.evaluateOps(uops);
          return updateStack(interimStack);
        }
        // unknown (not built-in or user command) - add to stack
        return [...interimStack, op]; 
      }, stck);
    };

  // user-defined functions
  lambdaOp: string = "_";
  userfnStartChar: string = "(";
  userfnEndChar: string = ")";

  loadUserFunction = (() => {
    let instantiated = false;
    let functionName: string;
    let functionDepth: number = 0; // function nesting depth

    return (op: Op): boolean => {
      switch (instantiated) {
        case false:
          functionName = op;
          this.userCmdOps.set(functionName, []);
          instantiated = true;
          return true; // continue loading
        case true:
          if (op === this.userfnEndChar) {
            switch (functionDepth) {
              case 0:
                // stop loading (recording) user function
                instantiated = false; // reset
                return false;
              default:
                functionDepth -= 1; // continue loading
            }
          }
          if (op === this.userfnStartChar) {
            functionDepth += 1;
          }
          this.userCmdOps.get(functionName)!.push(op);
          return true; // continue loading
      }
    };
  })();

  magic8 = new Map<number, string>([
    [0, "it is certain"],
    [1, "it is decidedly so"],
    [2, "without a doubt"],
    [3, "yes definitely"],
    [4, "you may rely on it"],
    [5, "as I see it, yes"],
    [6, "most likely"],
    [7, "outlook good"],
    [8, "yes"],
    [9, "signs point to yes"],
    [10, "reply hazy try again"],
    [11, "ask again later"],
    [12, "better not tell you now"],
    [13, "cannot predict now"],
    [14, "concentrate and ask again"],
    [15, "don't count on it"],
    [16, "my reply is no"],
    [17, "my sources say no"],
    [18, "outlook not so good"],
    [19, "very doubtful"],
  ]);

  // constructor - create built-in commands
  constructor() {
    // simple nullary operations -----------------------------------------------
    this.cmdfns.set(
      "pi",
      (stck: Stack): Stack => [...stck, Math.PI.toString()]
    );
    this.cmdfns.set("e", (stck: Stack): Stack => [...stck, Math.E.toString()]);
    this.cmdfns.set("magic8", (stck: Stack): Stack => {
      const ind = Math.floor(Math.random() * this.magic8.size);
      return [...stck, this.magic8.get(ind) ?? "error"];
    });

    // simple unary operations -------------------------------------------------
    // take a single number from the stack and apply a unary operation and
    // return a single number result to the top of stack
    type UnaryOperator = (a: number) => number;

    const executeUnaryOp = (op: UnaryOperator): ((stck: Stack) => Stack) => {
      return (stck: Stack): Stack => {
        const [rest, a] = getStackNumber(stck);
        return [...rest, op(a).toString()];
      };
    };

    this.cmdfns.set("abs", executeUnaryOp(Math.abs));
    this.cmdfns.set(
      "chs",
      executeUnaryOp((a: number) => -a)
    );
    this.cmdfns.set("floor", executeUnaryOp(Math.floor));
    this.cmdfns.set("ceil", executeUnaryOp(Math.ceil));
    this.cmdfns.set(
      "inv",
      executeUnaryOp((a: number) => 1 / a)
    );
    this.cmdfns.set("ln", executeUnaryOp(Math.log));
    this.cmdfns.set("log", executeUnaryOp(Math.log10));
    this.cmdfns.set("log2", executeUnaryOp(Math.log2));
    this.cmdfns.set("log10", executeUnaryOp(Math.log10));
    this.cmdfns.set(
      "rand",
      executeUnaryOp((a) => Math.floor(a * Math.random()))
    );
    this.cmdfns.set("round", executeUnaryOp(Math.round));
    this.cmdfns.set("sgn", executeUnaryOp(Math.sign));
    this.cmdfns.set("sqrt", executeUnaryOp(Math.sqrt));
    this.cmdfns.set(
      "tng",
      executeUnaryOp((a) => (a * (a + 1)) / 2)
    );
    this.cmdfns.set(
      "!",
      executeUnaryOp((a: number) => R.product(R.range(1)(a + 1)))
    );

    // trigonometric functions
    const DEG_PER_RAD = 180 / Math.PI;
    const radToDeg = (a: number): number => a * DEG_PER_RAD;
    const degToRad = (a: number): number => a / DEG_PER_RAD;
    this.cmdfns.set("deg_rad", executeUnaryOp(degToRad));
    this.cmdfns.set("rad_deg", executeUnaryOp(radToDeg));
    this.cmdfns.set("sin", executeUnaryOp(Math.sin));
    this.cmdfns.set("cos", executeUnaryOp(Math.cos));
    this.cmdfns.set("tan", executeUnaryOp(Math.tan));
    this.cmdfns.set("asin", executeUnaryOp(Math.asin));
    this.cmdfns.set("acos", executeUnaryOp(Math.acos));
    this.cmdfns.set("atan", executeUnaryOp(Math.atan));

    // conversion functions
    this.cmdfns.set(
      "c_f",
      executeUnaryOp((a) => (a * 9) / 5 + 32)
    );
    this.cmdfns.set(
      "f_c",
      executeUnaryOp((a) => ((a - 32) * 5) / 9)
    );
    const KILOMETERS_PER_MILE = 1.60934;
    this.cmdfns.set(
      "mi_km",
      executeUnaryOp((a) => a * KILOMETERS_PER_MILE)
    );
    this.cmdfns.set(
      "km_mi",
      executeUnaryOp((a) => a / KILOMETERS_PER_MILE)
    );
    const FEET_PER_METER = 3.28084;
    this.cmdfns.set(
      "m_ft",
      executeUnaryOp((a) => a * FEET_PER_METER)
    );
    this.cmdfns.set(
      "ft_m",
      executeUnaryOp((a) => a / FEET_PER_METER)
    );

    // simple binary operations ------------------------------------------------
    // take two numbers from the stack and apply a binary operation and return
    // a single number result to the top of stack
    type BinaryOperator = (a: number, b: number) => number;

    const executeBinaryOp = (op: BinaryOperator): ((stck: Stack) => Stack) => {
      return (stck: Stack): Stack => {
        const [rest, a, b] = getStackNumber2(stck);
        return [...rest, op(a, b).toString()];
      };
    };

    this.cmdfns.set("+", executeBinaryOp(R.add));
    this.cmdfns.set("-", executeBinaryOp(R.subtract));
    this.cmdfns.set("x", executeBinaryOp(R.multiply));
    this.cmdfns.set("/", executeBinaryOp(R.divide));
    this.cmdfns.set("%", executeBinaryOp(R.modulo));
    this.cmdfns.set("^", executeBinaryOp(Math.pow));
    this.cmdfns.set("min", executeBinaryOp(Math.min));
    this.cmdfns.set("max", executeBinaryOp(Math.max));
    this.cmdfns.set(
      "nroot",
      executeBinaryOp((a, b) => Math.pow(a, 1 / b))
    );
    const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
    this.cmdfns.set("gcd" as string, executeBinaryOp(gcd));
    this.cmdfns.set(
      "logn",
      executeBinaryOp((a, b) => Math.log(a) / Math.log(b))
    );

    // bitwise binary functions
    this.cmdfns.set(
      "and",
      executeBinaryOp((a, b) => a & b)
    );
    this.cmdfns.set(
      "nand",
      executeBinaryOp((a, b) => ~(a & b))
    );
    this.cmdfns.set(
      "nor",
      executeBinaryOp((a, b) => ~(a | b))
    );
    this.cmdfns.set(
      "not",
      executeUnaryOp((a) => ~a)
    );
    const countOnes = (a: number): number => {
      let count = 0;
      while (a) {
        count += a & 1;
        a >>= 1;
      }
      return count;
    };
    this.cmdfns.set("ones", executeUnaryOp(countOnes));
    this.cmdfns.set(
      "or",
      executeBinaryOp((a, b) => a | b)
    );
    this.cmdfns.set(
      "xor",
      executeBinaryOp((a, b) => a ^ b)
    );
    this.cmdfns.set(
      "xnor",
      executeBinaryOp((a, b) => ~(a ^ b))
    );
    this.cmdfns.set(
      ">>",
      executeBinaryOp((a, b) => a >> b)
    );
    this.cmdfns.set(
      "<<",
      executeBinaryOp((a, b) => a << b)
    );

    // stack operations
    this.cmdfns.set("cls", (stck: Stack): Stack => []);
    this.cmdfns.set(
      "drop",
      (stck: Stack): Stack => R.dropLast(1)(stck) as Stack
    );
    this.cmdfns.set("dropn", (stck: Stack): Stack => {
      const [rest, a] = getStackNumber(stck);
      return R.dropLast(a)(rest) as Stack;
    });
    this.cmdfns.set(
      "dup",
      (stck: Stack): Stack => [...stck, R.last(stck) ?? ""]
    );
    this.cmdfns.set("rev", (stck: Stack): Stack => R.reverse(stck) as Stack);
    this.cmdfns.set("roll", (stck: Stack): Stack => {
      const a = R.last(stck);
      const rest = R.dropLast(1)(stck);
      return [a, ...rest] as Stack;
    });
    this.cmdfns.set("rolln", (stck: Stack): Stack => {
      const [rest, n] = getStackNumber(stck);
      const top = R.takeLast(n)(rest);
      const bottom = R.dropLast(n)(rest);
      return [...top, ...bottom] as Stack;
    });
    this.cmdfns.set("rot", (stck: Stack): Stack => {
      const a = R.head(stck);
      const rest = R.drop(1)(stck);
      return [...rest, a] as Stack;
    });
    this.cmdfns.set("rotn", (stck: Stack): Stack => {
      const [rest, n] = getStackNumber(stck);
      const bottom = R.take(n)(rest);
      const top = R.drop(n)(rest);
      return [...top, ...bottom] as Stack;
    });
    this.cmdfns.set("swap", (stck: Stack): Stack => {
      const [a, b] = R.takeLast(2)(stck);
      const rest: Stack = R.dropLast(2)(stck) as Stack;
      return [...rest, b, a];
    });

    // simple 3-ary operations ------------------------------------------------
    // take three numbers from the stack and apply a binary operation and return
    // a single number result to the top of stack

    // principle roots
    this.cmdfns.set("proot", (stck: Stack): Stack => {
      const [rest, a, b, c] = getStackNumber3(stck);
      const disc = b * b - 4 * a * c; // discriminant

      let real1, imag1, real2, imag2;
      switch (disc < 0) {
        case true: {
          real1 = -b / (2 * a); // r_1 real
          imag1 = Math.sqrt(-disc) / (2 * a); // r_1 imag
          real2 = (-b / (2 * a)).toString(); // r_2 real
          imag2 = (-1 * Math.sqrt(-disc)) / (2 * a); // r_2 imag
          break;
        }
        case false: {
          real1 = (-b + Math.sqrt(disc)) / (2 * a); // r_1 real
          imag1 = 0; // r_1 imag
          real2 = (-b - Math.sqrt(disc)) / (2 * a); // r_2 real
          imag2 = 0; // r_2 imag
          break;
        }
      }

      return [
        ...rest,
        real1.toString(),
        imag1.toString(),
        real2.toString(),
        imag2.toString(),
      ];
    });

    // numeric representation conversion (non-simple unary) --------------------
    this.cmdfns.set("dec_hex", (stck: Stack): Stack => {
      const [rest, a] = getStackNumber(stck);
      return [...rest, a.toString(16)];
    });
    this.cmdfns.set("hex_dec", (stck: Stack): Stack => {
      const a: number = parseInt(R.last(stck) ?? "0", 16);
      const rest: Stack = R.dropLast(1)(stck) as Stack;
      return [...rest, a.toString()];
    });
    this.cmdfns.set("dec_bin", (stck: Stack): Stack => {
      const [rest, a] = getStackNumber(stck);
      return [...rest, a.toString(2)];
    });
    this.cmdfns.set("bin_dec", (stck: Stack): Stack => {
      const a: number = parseInt(R.last(stck) ?? "0", 2);
      const rest: Stack = R.dropLast(1)(stck) as Stack;
      return [...rest, a.toString()];
    });
    this.cmdfns.set("dec_oct", (stck: Stack): Stack => {
      const [rest, a] = getStackNumber(stck);
      return [...rest, a.toString(8)];
    });
    this.cmdfns.set("oct_dec", (stck: Stack): Stack => {
      const a: number = parseInt(R.last(stck) ?? "0", 8);
      const rest: Stack = R.dropLast(1)(stck) as Stack;
      return [...rest, a.toString()];
    });
    this.cmdfns.set("hex_bin", (stck: Stack): Stack => {
      const a: number = parseInt(R.last(stck) ?? "0", 16);
      const rest: Stack = R.dropLast(1)(stck) as Stack;
      return [...rest, a.toString(2)];
    });
    this.cmdfns.set("bin_hex", (stck: Stack): Stack => {
      const a: number = parseInt(R.last(stck) ?? "0", 2);
      const rest: Stack = R.dropLast(1)(stck) as Stack;
      return [...rest, a.toString(16)];
    });
    this.cmdfns.set("dec_asc", (stck: Stack): Stack => {
      const [rest, a] = getStackNumber(stck);
      return [...rest, String.fromCharCode(a)];
    });
    this.cmdfns.set("asc_dec", (stck: Stack): Stack => {
      const a: number = (R.last(stck) ?? "").charCodeAt(0);
      const rest: Stack = R.dropLast(1)(stck) as Stack;
      return [...rest, a.toString()];
    });

    // user storage ------------------------------------------------------------
    this.cmdfns.set("store", (stck: Stack): Stack => {
      const [value, name] = R.takeLast(2)(stck);
      const rest: Stack = R.dropLast(2)(stck) as Stack;
      this.userCmdOps.set(name, [value]);
      return rest;
    });

    // higher-order functions --------------------------------------------------
    this.cmdfns.set(this.userfnStartChar, (stck: Stack): Stack => {
      this.loadingUserFunction = true;
      return [...stck];
    });
    this.cmdfns.set("map", (stck: Stack): Stack => {
      const lambdaOps = this.userCmdOps.get(this.lambdaOp)!;
      const evaluateLambda = (s: string) => this.evaluateOps(lambdaOps)([s]);
      return R.map(evaluateLambda)(stck).flat();
    });
    this.cmdfns.set("fold", (stck: Stack): Stack => {
      const lambdaOps = this.userCmdOps.get(this.lambdaOp)!;
      const updateStack = this.evaluateOps(lambdaOps);
      let interimStack: Stack = stck;
      while (interimStack.length > 1) {
        interimStack = updateStack(interimStack);
      }
      return interimStack;
    });

    // general stack transformation --------------------------------------------
    const addParsed = (a: number, s: string): number => R.add(a)(parseFloat(s));
    const multiplyParsed = (a: number, s: string): number =>
      R.multiply(a)(parseFloat(s));
    this.cmdfns.set(
      "sum",
      (stck: Stack): Stack => [R.reduce(addParsed, 0)(stck).toString()]
    );
    this.cmdfns.set(
      "prod",
      (stck: Stack): Stack => [R.reduce(multiplyParsed, 1)(stck).toString()]
    );
    this.cmdfns.set("avg", (stck: Stack): Stack => {
      const sum = R.reduce(addParsed, 0)(stck);
      return [(sum / stck.length).toString()];
    });
    this.cmdfns.set("io", (stck: Stack): Stack => {
      const [rest, a] = getStackNumber(stck);
      return [...rest, ...R.map(R.toString)(R.range(1)(a + 1))];
    });
    this.cmdfns.set("to", (stck: Stack): Stack => {
      const range = (from: number, end: number, step: number): number[] => {
        return to > from
          ? R.unfold((n) => (n <= end ? [n, n + Math.abs(step)] : false), from)
          : R.unfold((n) => (n >= end ? [n, n - Math.abs(step)] : false), from);
      };
      const [rest, from, to, step] = getStackNumber3(stck);
      return [...rest, ...R.map(R.toString)(range(from, to, step))];
    });
  }
}
