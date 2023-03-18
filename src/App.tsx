import "./App.css";
import { useState } from "react";
import { Grid, Typography, TextField, Button } from "@mui/material";
import { Command } from "./command";

type Ops = string[]; // array of operations
type Op = string; // operation
type Sexpr = string; // S-exression
const C = new Command();

function App() {
  const [outputStack, setOutputStack] = useState([]);
  const [inputFieldValue, setInputFieldValue] = useState("");

  const exprToOps = (expr: Sexpr): Ops =>
    expr.split(" ").filter((op: Op) => op.length > 0);

  const onEnter = (expr: Sexpr) => {
    console.log("evaluating expression = ", expr);
    const ops = exprToOps(expr);

    // evaluate expression and set output stack to result
    setOutputStack(C.evaluateOps(ops)(outputStack));

    clearInput(); // clear input field
  };

  const clearInput = () => setInputFieldValue("");

  return (
    <Grid container padding={4} spacing={3}>
      <Grid item xs={12}>
        <Typography variant="h4" className="title" sx={{ color: "#cccaa6" }}>
          Coren
        </Typography>
      </Grid>
      <Grid item xs={12} container>
        <TextField
          id="expression"
          label="expression"
          variant="outlined"
          color="primary"
          placeholder="Enter an expression"
          sx={{
            input: { color: "#fffdd0", fontFamily: "Monospace" },
            width: "100%",
          }}
          focused
          autoFocus
          value={inputFieldValue}
          onChange={(e) => setInputFieldValue(e.target.value)}
          onKeyDown={(e) => {
            e.key == "Enter" ? onEnter(e.target.value) : {};
          }}
        />
      </Grid>
      <Grid item xs={12}>
        {[...outputStack].reverse().map((entry, i) => (
          <div key={i}>
            <Typography
              component="span"
              color={"#404040"}
              align="left"
              sx={{ fontSize: "14px", fontFamily: "Monospace" }}
            >
              {i + 1}.{" "}
            </Typography>
            <Typography
              variant="h6"
              component="span"
              color={i === 0 ? "#fffdd0" : "#0080ff"}
              sx={{ fontFamily: "Monospace" }}
              align="left"
            >
              {entry}
            </Typography>
          </div>
        ))}
        <br />
        <Typography variant="body2" color="#000000">
          ( ver. 0.0.3 )
        </Typography>
      </Grid>
    </Grid>
  );
}

export default App;
