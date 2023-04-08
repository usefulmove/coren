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
type StackFn = (s: Stack) => Stack; // stack transform functions (morphisms)

// iota :: number -> number[]
const iota = R.range(1);

// parseIntBase :: number -> string -> number
const parseIntBase = R.curry(R.flip(parseInt));

const getOp = (stck: Stack): [Op, Stack] => {
  const op: Op = R.last(stck) ?? "";
  const rest: Stack = R.init(stck) as Stack;
  return [op, rest];
};

const getStackNumber = (stck: Stack): [Stack, number] => {
  const n: number = parseFloat(R.last(stck) ?? "0");
  const rest: Stack = R.init(stck) as Stack;
  return [rest, n];
};

const getStackNumberHex = (stck: Stack): [Stack, number] => {
  const n: number = parseIntBase(16)(R.last(stck) ?? "0");
  const rest: Stack = R.init(stck) as Stack;
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
    return R.reject((x) => x === this.lambdaOp)(names);
  };

  // evaluateOps :: Ops -> Stack -> Stack
  public evaluateOps =
    (ops: Ops) =>
    (stck: Stack): Stack =>
      R.reduce((interimStack: Stack, op: Op): Stack => {
        // loading user function
        if (this.loadingUserFunction) {
          this.loadingUserFunction = this.loadUserFunction(op);
          return [...interimStack];
        }
        // built-in command - run command function on interim stack
        if (this.cmdfns.has(op)) {
          const f = this.cmdfns.get(op);
          return f!(interimStack);
        }
        // user function - make recursive call to evaluateOps using stored ops
        if (this.userCmdOps.has(op)) {
          const userOps = this.userCmdOps.get(op)!;
          const updateStack = this.evaluateOps(userOps);
          return updateStack(interimStack);
        }
        // unknown (not built-in or user command) - add to stack
        return [...interimStack, op];
      }, stck)(ops);

  // user-defined functions
  lambdaOp: string = "_";
  userfnStart: string = "(";
  userfnEnd: string = ")";

  loadUserFunction = (() => {
    // state maintained within closure of iife
    let instantiated = false;
    let functionName: string;
    let functionDepth: number; // function nesting depth

    return (op: Op): boolean => {
      if (!instantiated) {
        functionName = op;
        this.userCmdOps.set(functionName, []);
        functionDepth = 0;
        instantiated = true;
        return true; // continue loading
      }

      if (op === this.userfnEnd) {
        if (functionDepth === 0) {
          instantiated = false; // reset state
          return false; // stop loading (recording)
        } else {
          functionDepth -= 1; // decrement function depth
          return true; // continue loading
        }
      }

      if (op === this.userfnStart) {
        functionDepth += 1;
        return true; // continue loading
      }

      this.userCmdOps.get(functionName)!.push(op);
      return true; // continue loading
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

    // pi command
    this.cmdfns.set(
      "pi",
      (stck: Stack): Stack => [...stck, Math.PI.toString()]
    );

    // e command
    this.cmdfns.set("e", (stck: Stack): Stack => [...stck, Math.E.toString()]);

    // magic8 command
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

    // abs command
    this.cmdfns.set("abs", executeUnaryOp(Math.abs));

    // chs command
    this.cmdfns.set(
      "chs",
      executeUnaryOp((a: number) => -a)
    );

    // floor command
    this.cmdfns.set("floor", executeUnaryOp(Math.floor));

    // ceil command
    this.cmdfns.set("ceil", executeUnaryOp(Math.ceil));

    // inv command
    this.cmdfns.set(
      "inv",
      executeUnaryOp((a: number) => 1 / a)
    );

    // ln command
    this.cmdfns.set("ln", executeUnaryOp(Math.log));

    // log command
    this.cmdfns.set("log", executeUnaryOp(Math.log10));

    // log2 command
    this.cmdfns.set("log2", executeUnaryOp(Math.log2));

    // log10 command
    this.cmdfns.set("log10", executeUnaryOp(Math.log10));

    // rand command
    this.cmdfns.set(
      "rand",
      executeUnaryOp((a) => Math.floor(a * Math.random()))
    );

    // round command
    this.cmdfns.set("round", executeUnaryOp(Math.round));

    // sgn command
    this.cmdfns.set("sgn", executeUnaryOp(Math.sign));

    // sqrt command
    this.cmdfns.set("sqrt", executeUnaryOp(Math.sqrt));

    // tng command
    this.cmdfns.set(
      "tng",
      executeUnaryOp((a) => (a * (a + 1)) / 2)
    );

    // ! (factorial) command
    this.cmdfns.set(
      "!",
      executeUnaryOp((a: number) => R.product(iota(a + 1)))
    );

    // trigonometric functions
    const DEG_PER_RAD = 180 / Math.PI;
    // radToDeg :: number -> number
    const radToDeg = (a: number): number => a * DEG_PER_RAD;
    // degToRad :: number -> number
    const degToRad = (a: number): number => a / DEG_PER_RAD;

    // deg_rad command
    this.cmdfns.set("deg_rad", executeUnaryOp(degToRad));

    // rad_deg command
    this.cmdfns.set("rad_deg", executeUnaryOp(radToDeg));

    // sin command
    this.cmdfns.set("sin", executeUnaryOp(Math.sin));

    // cos command
    this.cmdfns.set("cos", executeUnaryOp(Math.cos));

    // tan command
    this.cmdfns.set("tan", executeUnaryOp(Math.tan));

    // asin command
    this.cmdfns.set("asin", executeUnaryOp(Math.asin));

    // acos command
    this.cmdfns.set("acos", executeUnaryOp(Math.acos));

    // atan command
    this.cmdfns.set("atan", executeUnaryOp(Math.atan));

    // conversion functions

    // c_f (Celsius to Fahrenheit) command
    this.cmdfns.set(
      "c_f",
      executeUnaryOp((a) => (a * 9) / 5 + 32)
    );

    // f_c (Farhenheit to Celsius) command
    this.cmdfns.set(
      "f_c",
      executeUnaryOp((a) => ((a - 32) * 5) / 9)
    );

    const KILOMETERS_PER_MILE = 1.60934;

    // mi_km (miles to kilometers) command
    this.cmdfns.set(
      "mi_km",
      executeUnaryOp((a) => a * KILOMETERS_PER_MILE)
    );

    // km_mi (kilometers to miles) command
    this.cmdfns.set(
      "km_mi",
      executeUnaryOp((a) => a / KILOMETERS_PER_MILE)
    );

    const FEET_PER_METER = 3.28084;

    // m_ft (meters to feet) command
    this.cmdfns.set(
      "m_ft",
      executeUnaryOp((a) => a * FEET_PER_METER)
    );

    // ft_m (feet to meters) command
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

    // simple 3-ary operations ------------------------------------------------
    // take three numbers from the stack and apply a binary operation and return
    // a single number result to the top of stack

    // principle roots
    this.cmdfns.set("proot", (stck: Stack): Stack => {
      const [rest, a, b, c] = getStackNumber3(stck);
      const disc = b * b - 4 * a * c; // discriminant

      let real1, imag1, real2, imag2;
      if (disc < 0) {
        real1 = -b / (2 * a); // r_1 real
        imag1 = Math.sqrt(-disc) / (2 * a); // r_1 imag
        real2 = (-b / (2 * a)).toString(); // r_2 real
        imag2 = (-1 * Math.sqrt(-disc)) / (2 * a); // r_2 imag
      } else {
        real1 = (-b + Math.sqrt(disc)) / (2 * a); // r_1 real
        imag1 = 0; // r_1 imag
        real2 = (-b - Math.sqrt(disc)) / (2 * a); // r_2 real
        imag2 = 0; // r_2 imag
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
      const a: number = parseIntBase(16)(R.last(stck) ?? "0");
      const rest: Stack = R.init(stck) as Stack;
      return [...rest, a.toString()];
    });
    this.cmdfns.set("dec_bin", (stck: Stack): Stack => {
      const [rest, a] = getStackNumber(stck);
      return [...rest, a.toString(2)];
    });
    this.cmdfns.set("bin_dec", (stck: Stack): Stack => {
      const a: number = parseIntBase(2)(R.last(stck) ?? "0");
      const rest: Stack = R.init(stck) as Stack;
      return [...rest, a.toString()];
    });
    this.cmdfns.set("dec_oct", (stck: Stack): Stack => {
      const [rest, a] = getStackNumber(stck);
      return [...rest, a.toString(8)];
    });
    this.cmdfns.set("oct_dec", (stck: Stack): Stack => {
      const a: number = parseIntBase(8)(R.last(stck) ?? "0");
      const rest: Stack = R.init(stck) as Stack;
      return [...rest, a.toString()];
    });
    this.cmdfns.set("hex_bin", (stck: Stack): Stack => {
      const a: number = parseIntBase(16)(R.last(stck) ?? "0");
      const rest: Stack = R.init(stck) as Stack;
      return [...rest, a.toString(2)];
    });
    this.cmdfns.set("bin_hex", (stck: Stack): Stack => {
      const a: number = parseIntBase(2)(R.last(stck) ?? "0");
      const rest: Stack = R.init(stck) as Stack;
      return [...rest, a.toString(16)];
    });
    this.cmdfns.set("dec_asc", (stck: Stack): Stack => {
      const [rest, a] = getStackNumber(stck);
      return [...rest, String.fromCharCode(a)];
    });
    this.cmdfns.set("asc_dec", (stck: Stack): Stack => {
      const a: number = (R.last(stck) ?? "").charCodeAt(0);
      const rest: Stack = R.init(stck) as Stack;
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
    this.cmdfns.set(this.userfnStart, (stck: Stack): Stack => {
      this.loadingUserFunction = true;
      return [...stck];
    });
    this.cmdfns.set("map", (stck: Stack): Stack => {
      const lambdaOps = this.userCmdOps.get(this.lambdaOp)!;
      const evaluateLambda = (s: string) => this.evaluateOps(lambdaOps)([s]);
      return R.map(evaluateLambda)(stck).flat();
    });
    const fold = (stck: Stack): Stack => {
      const lambdaOps = this.userCmdOps.get(this.lambdaOp)!;
      const updateStack = this.evaluateOps(lambdaOps);
      let interimStack: Stack = stck;
      while (interimStack.length > 1) {
        interimStack = updateStack(interimStack);
      }
      return interimStack;
    };
    this.cmdfns.set("fold", fold);
    this.cmdfns.set("reduce", fold);

    // RGB color conversions ---------------------------------------------------

    // clampRGBval :: number -> number
    const clampRGBval = R.pipe(R.clamp(0, 255), Math.round);

    // convertToHexString :: number ->string -> string
    const convertToHexString = (a: number) =>
      R.pipe(
        parseFloat,
        (n) => n * a,
        clampRGBval,
        (n) => n.toString(16),
        (s) => (s.length === 1 ? "0" + s : s)
      );

    // hexToRGB :: string -> number[]
    const hexToRGB = (s: string) => {
      const hex = s.startsWith("#") ? s.slice(1) : s;
      const rgb = R.splitEvery(2)(hex);
      return R.map(parseIntBase(16))(rgb);
    };

    // convertRGB :: number -> string[] -> string
    const convertRGB = (a: number) =>
      R.pipe(R.map(convertToHexString(a)), R.reduce(R.concat, "#"));

    this.cmdfns.set("rgb_hex", (stck: Stack): Stack => {
      const sRGBarr: string[] = R.takeLast(3)(stck);
      const rest: Stack = R.dropLast(3)(stck) as Stack;
      return [...rest, convertRGB(1)(sRGBarr)];
    });

    this.cmdfns.set("rgbx", (stck: Stack): Stack => {
      const [rest, a] = getStackNumber(stck);
      const sRGBarr: string[] = R.takeLast(3)(rest);
      const rest2: Stack = R.dropLast(3)(rest) as Stack;
      return [...rest2, convertRGB(a)(sRGBarr)];
    });

    this.cmdfns.set("hex_rgb", (stck: Stack): Stack => {
      const s: string = R.last(stck) ?? "";
      const rest: Stack = R.init(stck) as Stack;
      const rgbStringArr = R.map(R.toString)(hexToRGB(s));
      return [...rest, ...rgbStringArr];
    });

    this.cmdfns.set("hex_rgbavg", (stck: Stack): Stack => {
      const sarr = R.takeLast(2)(stck);
      const rest: Stack = R.dropLast(2)(stck) as Stack;
      const averageHexRGBString = R.pipe(
        R.map(hexToRGB),
        // @ts-ignore
        R.transpose,
        R.map(R.mean),
        R.map(R.toString),
        convertRGB(1)
      );
      // @ts-ignore
      return [...rest, averageHexRGBString(sarr)];
    });

    // general stack morphisms ------------------------------------------------

    // addParsed :: number -> string -> number
    const addParsed = (a: number, s: string): number => R.add(a)(parseFloat(s));

    // multiplyParsed :: number -> string -> number
    const multiplyParsed = (a: number, s: string): number =>
      R.multiply(a)(parseFloat(s));

    // cls command
    this.cmdfns.set("cls", (stck: Stack): Stack => []);

    // drop, dropn commands
    this.cmdfns.set("drop", (stck: Stack): Stack => R.init(stck) as Stack);
    this.cmdfns.set("dropn", (stck: Stack): Stack => {
      const [rest, a] = getStackNumber(stck);
      return R.dropLast(a)(rest) as Stack;
    });

    // dup command
    this.cmdfns.set(
      "dup",
      (stck: Stack): Stack => [...stck, R.last(stck) ?? ""]
    );

    // rev command
    this.cmdfns.set("rev", (stck: Stack): Stack => R.reverse(stck) as Stack);
    this.cmdfns.set(
      "reverse",
      (stck: Stack): Stack => R.reverse(stck) as Stack
    );

    // roll, rolln, rot, rotn commands
    this.cmdfns.set("roll", (stck: Stack): Stack => {
      const a = R.last(stck);
      const rest = R.init(stck);
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
      const rest = R.tail(stck);
      return [...rest, a] as Stack;
    });
    this.cmdfns.set("rotn", (stck: Stack): Stack => {
      const [rest, n] = getStackNumber(stck);
      const bottom = R.take(n)(rest);
      const top = R.drop(n)(rest);
      return [...top, ...bottom] as Stack;
    });

    // swap command
    this.cmdfns.set("swap", (stck: Stack): Stack => {
      const [a, b] = R.takeLast(2)(stck);
      const rest: Stack = R.dropLast(2)(stck) as Stack;
      return [...rest, b, a];
    });

    // head command
    this.cmdfns.set("head", (stck: Stack): Stack => [R.head(stck)] as Stack);

    // tail command
    this.cmdfns.set("tail", (stck: Stack): Stack => R.tail(stck));

    // init command
    this.cmdfns.set("init", (stck: Stack): Stack => R.init(stck));

    // last command
    this.cmdfns.set("last", (stck: Stack): Stack => [R.last(stck)] as Stack);

    // taken command
    this.cmdfns.set("taken", (stck: Stack): Stack => {
      const [rest, a] = getStackNumber(stck);
      return R.takeLast(a)(rest);
    });

    // sum command
    this.cmdfns.set(
      "sum",
      (stck: Stack): Stack => [R.reduce(addParsed, 0)(stck).toString()]
    );

    // prod command
    this.cmdfns.set(
      "prod",
      (stck: Stack): Stack => [R.reduce(multiplyParsed, 1)(stck).toString()]
    );

    // avg command
    this.cmdfns.set("avg", (stck: Stack): Stack => {
      const sum = R.reduce(addParsed, 0)(stck);
      return [(sum / stck.length).toString()];
    });

    // io (iota) command
    this.cmdfns.set("io", (stck: Stack): Stack => {
      const [rest, a] = getStackNumber(stck);
      return [...rest, ...R.map(R.toString)(iota(a + 1))];
    });

    // to command
    this.cmdfns.set("to", (stck: Stack): Stack => {
      const range = (from: number, end: number, step: number): number[] => {
        return to > from
          ? R.unfold((n) => (n <= end ? [n, n + Math.abs(step)] : false), from)
          : R.unfold((n) => (n >= end ? [n, n - Math.abs(step)] : false), from);
      };
      const [rest, from, to, step] = getStackNumber3(stck);
      return [...rest, ...R.map(R.toString)(range(from, to, step))];
    });

    // cmds command
    this.cmdfns.set("cmds", (stck: Stack): Stack => {
      const cmds = [...this.cmdfns.keys()];
      const formatCmds = R.pipe(
        R.reject(R.equals(this.userfnStart)),
        R.sort(R.comparator(R.lt)),
        R.join(" ")
      );
      return [...stck, formatCmds(cmds)];
    });
  }
}
