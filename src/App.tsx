import "./App.css";
import { useState } from "react";
import { Grid, Typography, TextField, IconButton } from "@mui/material";
import { Command } from "./command";
import { HelpOutline } from "@mui/icons-material";

type Ops = string[]; // operations list
type Op = string; // operation
type Sexpr = string; // S-expression
const C = new Command();

function App() {
  const [outputStack, setOutputStack] = useState<string[]>([]);
  const [inputFieldValue, setInputFieldValue] = useState("");
  const [userCmdList, setUserCmdList] = useState<string[]>([]);

  const exprToOps = (expr: Sexpr): Ops =>
    expr.split(" ").filter((op: Op) => op.length > 0);

  const onEnter = (expr: Sexpr) => {
    console.log("evaluating expression = ", expr);
    const ops = exprToOps(expr);

    // evaluate expression and set output stack to result
    setOutputStack(C.evaluateOps(ops)(outputStack));

    clearInput(); // clear input field

    setUserCmdList(C.getUserCmdNames());
  };

  const clearInput = () => setInputFieldValue("");

  return (
    <Grid container padding={4} spacing={3}>
      <Grid item xs={12}>
        <Typography variant="h4" className="title" color="secondary">
          Coren
        </Typography>
        <Typography
          variant="body2"
          sx={{ color: (theme) => theme.palette.info.main }}
        >
          ( ver. 0.0.6 )
        </Typography>
      </Grid>
      <Grid item xs={1} sx={{ display: { sx: "none", sm: "block" } }} />
      <Grid item xs={12} sm={10}>
        <TextField
          id="expression"
          label="expression"
          variant="outlined"
          color="primary"
          placeholder="Enter an expression"
          sx={{
            input: {
              color: (theme) => theme.palette.secondary.main,
              fontFamily: "Monospace",
            },
            width: "100%",
          }}
          focused
          autoFocus
          value={inputFieldValue}
          onChange={(e) => setInputFieldValue(e.target.value)}
          onKeyDown={(e) => {
            e.key == "Enter"
              ? onEnter((e.target as HTMLInputElement).value)
              : {};
          }}
        />
      </Grid>
      <Grid item xs={1} sx={{ display: { sx: "none", sm: "block" } }} />
      <Grid item xs={1} sx={{ display: { sx: "none", sm: "block" } }} />
      <Grid item xs={12} sm={10}>
        <>
          <Typography
            variant="subtitle1"
            color="secondary"
            sx={{ fontFamily: "Monospace" }}
          >
            {outputStack.length === 0 ? "( stack empty )" : ""}
          </Typography>
          {[...outputStack].reverse().map((entry, i) => (
            <div key={i}>
              <Typography
                component="span"
                align="left"
                sx={{
                  fontSize: 14,
                  fontFamily: "Monospace",
                  color: (theme) => theme.palette.info.main,
                }}
              >
                {i + 1}.{" "}
              </Typography>
              <Typography
                variant="h6"
                component="span"
                color={i === 0 ? "secondary" : "primary"}
                sx={{ fontFamily: "Monospace" }}
                align="left"
              >
                {entry}
              </Typography>
            </div>
          ))}
        </>
      </Grid>
      <Grid item xs={1} sx={{ display: { sx: "none", sm: "block" } }}>
        {userCmdList.length > 0 ? (
          <>
            <Typography
              sx={{ fontSize: 16, color: (theme) => theme.palette.info.main }}
            >
              custom:
            </Typography>
            {userCmdList.map((cmd) => {
              return (
                <Typography key={cmd} color="secondary" sx={{ fontSize: 16 }}>
                  {cmd}
                </Typography>
              );
            })}
          </>
        ) : null}
      </Grid>
      <Grid item xs={12}>
        <Typography
          sx={{ fontSize: 20, color: (theme) => theme.palette.info.main }}
        >
          ( Refresh page to clear all. Enter `cls` to clear stack. )
        </Typography>
      </Grid>
      <Grid item xs={12}>
        <IconButton
          target="_blank"
          href="https://github.com/usefulmove/coren/blob/main/USAGE.md"
        >
          <HelpOutline color="secondary" fontSize="small" />
        </IconButton>
      </Grid>
    </Grid>
  );
}

export default App;
