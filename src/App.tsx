import "./App.css";
import { useState } from "react";
import { Grid, Typography, TextField, IconButton } from "@mui/material";
import { CommandInterpreter } from "./CommandInterpreter";
import { GitHub, HelpOutline } from "@mui/icons-material";

const APPNAME = "Coren ( one )";
const VERSION = "ver. 0.0.9";

const C = new CommandInterpreter();

type Ops = string[]; // operations list
type Op = string; // operation
type Sexpr = string; // S-expression

function App() {
  const [outputStack, setOutputStack] = useState<string[]>([]);
  const [inputFieldValue, setInputFieldValue] = useState("");
  const [userCmdList, setUserCmdList] = useState<string[]>([]);
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(-1);

  const exprToOps = (expr: Sexpr): Ops =>
    expr.split(" ").filter((op: Op) => op.length > 0);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowUp") {
      if (currentIndex > 0) {
        setCurrentIndex((prevIndex) => prevIndex - 1);
        setInputFieldValue(commandHistory[currentIndex - 1]);
      } else if (currentIndex === 0) {
        setCurrentIndex(-1);
        setInputFieldValue("");
      } else if (currentIndex === -1) {
        setInputFieldValue(commandHistory[commandHistory.length - 1]);
        setCurrentIndex(commandHistory.length - 1);
      }
    } else if (e.key === "ArrowDown") {
      if (currentIndex < commandHistory.length - 1) {
        setCurrentIndex((prevIndex) => prevIndex + 1);
        setInputFieldValue(commandHistory[currentIndex + 1]);
      } else {
        setCurrentIndex(-1);
        setInputFieldValue("");
      }
    } else if (e.key === "Enter") {
      if (inputFieldValue.trim() !== "") {
        setCommandHistory((prevHistory) => [...prevHistory, inputFieldValue]);
        setCurrentIndex(-1);
      }
      onEnter((e.target as HTMLInputElement).value);
    }
  };

  const onEnter = (expr: Sexpr) => {
    // evaluate expression and update output stack with result
    const updateStack = C.evaluateOps(exprToOps(expr));
    setOutputStack(updateStack(outputStack));

    clearInputField();
    setUserCmdList(C.getUserCmdNames()); // update user command display
  };

  const clearInputField = () => setInputFieldValue("");

  return (
    <Grid container padding={4} spacing={3}>
      <Grid item xs={12}>
        <Typography variant="h5" className="title" color="secondary">
          {APPNAME}
        </Typography>
        <Typography
          variant="body2"
          sx={{ color: (theme) => theme.palette.info.main }}
        >
          ( {VERSION} )
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
          onKeyDown={handleKeyDown}
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
            {outputStack.length === 0 ? "( stack clear )" : ""}
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
        <IconButton target="_blank" href="https://github.com/usefulmove/coren/">
          <GitHub color="secondary" fontSize="small" />
        </IconButton>
      </Grid>
    </Grid>
  );
}

export default App;
