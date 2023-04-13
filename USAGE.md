# Usage Guide

- [stack manipulation](#commands-stack-manipulation)
- [memory usage](#commands-memory-usage)
- [maths](#commands-maths)
- [conversion](#commands-conversion)
- [binary](#commands-binary)
- [user-defined functions](#commands-user-defined-functions)
- [higher-order functions](#commands-higher-order-functions)


---
## Commands

### show commands
```
exp: cmds
  (list of available commands shown)
```

## Commands (stack manipulation)

### push onto stack
```
exp: 1 2 3 4
  4
  3
  2
  1
```
Note: The last value '4' is on the top of the stack.

### drop / dropn
drop element from the top of the stack
```
exp: 3 4 drop
  3
```
drop n elements from the top of the stack
```
exp: 1 2 3 4 2 dropn
  2
  1
```

### duplicate (dup)
duplicate last element
```
exp: 3 4 dup
  4
  4
  3
```

### swap
reverse order of last two elements
```
exp: 1 2 3 4 swap
  3
  4
  2
  1
```

### clear stack (cls)
clear all elements from the stack
```
exp: 1 2 3 4 cls

```

### reverse stack (rev)
```
exp: 1 2 3 4 rev
  1
  2
  3
  4
```

### roll / rolln
roll stack elements such that the last element becomes the first
```
exp: 1 2 3 4 roll
  3
  2
  1
  4
```
roll stack n times
```
exp: 1 2 3 4 2 rolln
  2
  1
  4
  3
```

### rotate (rot / rotn)
rotate stack elements such that the first element becomes the last (reverse direction from roll operation)
```
exp: 1 2 3 4 rot
  1
  4
  3
  2
```
rotate stack n times
```
exp: 1 2 3 4 2 rotn
  2
  1
  4
  3
```

### iota (io)
push an integer range (starting at 1) onto the stack
```
exp: 8 io
  8
  7
  6
  5
  4
  3
  2
  1
```

### range (to)
push a number range onto the stack by specifying the range start, end, and step size
```
exp: 0 10 2 to
  10
  8
  6
  4
  2
  0
```
```
exp: 20 -10 5 to
  -10
  -5
  0
  5
  10
  15
  20
```


---
## Commands (memory usage)

### store and retrieve
 Values can be stored using generic variables that are not associated with either built-in commands or user-defined functions using the `store` command as shown below.
```
exp: 1 2 3 remember_me store 4 5 6 cls remember_me
  3
```


---
## Commands (maths)

### add
```
exp: 3 4 +
  7
```

### sum (add all)
```
exp: 1 2 3 4 sum
  10
```

### subtract
```
exp: 3 4 -
  -1
```

### multiply
```
exp: 3 4 *
  12
```

### product (multiply all)
```
exp: 1 2 3 4 prod
  24
```

### divide
```
exp: 3 4 /
  0.75
```

### change sign
```
exp: 3 chs
  -3
```

### absolute value
```
exp: -3 abs
  3
```

### round
```
exp: 10.2 round
  10
```

### floor
```
exp: 10.2 floor
  10
```

### ceiling
```
exp: 10.2 ceil
  11
```

### invert (1/x)
```
exp: 3 inv
  0.3333333333333333
```

### square root
```
exp: 2 sqrt
  1.4142135623730951
```

### nth root
```
exp: 9 2 nroot
  3
```

### find principal roots
For this operation, the coefficients `a b c` of the quadratic equation `ax^2 + bx + c = 0` are pushed onto the stack. The real and imaginary components of the principal roots (root1 and root2) of the equation are returned to the stack in the order `real1 imag1 real2 imag2`. The example below finds the roots of the equation `x^2 - 9 = 0`.
```
exp: 1 0 -9 proot
  0
  -3
  0
  3
```

### exponentiation
```
exp: 2 4 ^
  16
```

### modulus
```
exp: 5 2 %
  1
```

### factorial
```
exp: 5 !
  120
```

### greatest common divisor
```
exp: 10 55 gcd
  5
```

### pi
```
exp: pi
  3.141592653589793
```

### Euler's number (e)
```
exp: e
  2.718281828459045
```

### convert degrees to radians (and reverse)
```
exp: pi 2 /
  1.5707963267948966

exp: pi 2 / rad_deg
  90

exp: 90 deg_rad
  1.5707963267948966
```

### sine / arcsine
```
exp: pi 2 / sin
  1

exp: pi 2 / sin asin
  1.5707963267948966
```

### cosine / arcosine
```
exp: 0 cos
  1

exp: 0 cos acos
  0
```

### tangent / arctangent
```
exp: pi 4 / tan
  0.9999999999999999

exp: pi 4 / tan atan 4 x
  3.141592653589793
```

### log (base 10)
```
exp: 10 2 ^ log
  2
```

### log (base 2)
```
exp: 256 log2
  8
```

### log (base n)
```
exp: 256 2 logn
  8
```

### natural log
```
exp: e ln
  1
```

### max
return the maximum of the last two elements on the stack
```
exp: 1 2 3 4 max
  4
  2
  1
```

### min
return the minimum of the last two elements on the stack
```
exp: 1 2 3 4 min
  3
  2
  1
```

### mean
return the average of all elements on the stack
```
exp: 1 2 3 4 mean
  2.5
```

### rand
read positive integer (n) from stack and returns a random integer in the range 0 to n-1
```
exp: 6 rand
  3

exp: 6 rand
  5
```


---
## Commands (conversion)

### convert between hexadecimal, binary, and decimal
```
exp: c0 hex_dec
  192

exp: 192 dec_hex
  c0

exp: 192 dec_bin
  1100000

exp: 11000000 bin_dec
  192

exp: 1100000 bin_hex
  c0

exp: c0 hex_bin
  11000000
```

### temperature conversion (Fahrenheit, Celsius)
```
exp: 212 f_c
  100
```

```
exp: 0 c_f
  32
```

### length conversion (miles, kilometers) (feet, meters)
```
exp: 1 mi_km
  1.609344
```
```
exp: 1 m_ft
  3.281
```

### ascii conversion
```
exp: a ascii_dec
  97
```
```
exp: 97 dec_ascii
  a
```

### RGB color conversion
```
exp: 0 192 255 rgb_hex
  #00c0ff
```
```
exp: #00c0ff hex_rgb
  255
  192
  0
```


---
## Commands (binary)

### and (bitwise)
```
exp: 2 1 and
  0
```

### or (bitwise)
```
exp: 2 1 or
  3
```

### xor (bitwise)
```
exp: 3 5 or
  6
```
```
exp: 3 3 or
  0
```

### bit shift
```
exp: 4 2 >>
  1
```
```
exp: 1 2 <<
  4
```

### number of high bits
```
exp: 7 ones
  3
```


---
## Commands (user-defined functions)

### function definition
User-defined functions can be defined by indicating the start of a function with an open parenthesis `(` symbol followed by the function name then a list of operations and terminated with the close parenthesis `)` symbol. The user function is executed by calling the function name as shown in the examples below.
```
exp: ( square dup * ) 16 square
  256
```
```
exp: ( double 2 * ) 250 double
  500
```


---
## Commands (higher-order functions)

### map
map an anonymous function to each of the stack elements
```
exp: 1 2 3 4 5 ( _ 3 ^ ) map
  125
  64
  27
  8
  1
```

Note: Commands that manipulate the entire stack (such as `sum`, `prod`, `cls`) cannot be used in anonymous functions passed to higher-order functions.

### fold (reduce)
use an anonymous function to collapse the values on the stack into a single value
```
Compute the sum of the squares of the numbers from 1 to 5.

exp: 1 2 3 4 5 ( _ 2 ^ ) map ( _ + ) fold
  55
```
