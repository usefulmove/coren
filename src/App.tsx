import "./App.css";
import { useState } from "react";
import {
  Grid,
  Typography,
  TextField,
  IconButton,
  Tooltip,
} from "@mui/material";
import { CommandInterpreter } from "./CommandInterpreter";
import { GitHub, HelpOutline } from "@mui/icons-material";
import { InputAdornment } from "@mui/material";

const APPNAME = "Coren ( . . . )";
const VERSION = "ver. 0.0.12a";

type Ops = string[]; // operations list

const CInterp = new CommandInterpreter();

function App() {
  const [outputStack, setOutputStack] = useState<string[]>([]);
  const [outputMessage, setOutputMessage] = useState("");
  const [inputFieldValue, setInputFieldValue] = useState("");
  const [userCmdList, setUserCmdList] = useState<string[]>([]);
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(-1);

  CInterp.setOutputFn(setOutputMessage);

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

      setOutputMessage(""); // clear output message

      const expr = (e.target as HTMLInputElement).value;

      // evaluate expression on current stack and update output stack
      // transformStack :: Stack -> Stack
      const transformStack = CInterp.evaluateOps(
        CInterp.exprToOps(expr) as Ops
      );
      setOutputStack(transformStack(outputStack));

      clearInputField();
      setUserCmdList(CInterp.getUserCmdNames()); // update user command display
    }
  };

  const clearInputField = () => setInputFieldValue("");

  return (
    <Grid container padding={4} spacing={3}>
      <Grid item xs={12}>
        <Typography variant="h5" color="secondary">
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
          label="S-expression"
          variant="outlined"
          color="primary"
          placeholder="Enter an expression"
          focused
          autoFocus
          value={inputFieldValue}
          onChange={(e) => setInputFieldValue(e.target.value)}
          onKeyDown={handleKeyDown}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">exp:</InputAdornment>
            ),
            sx: {
              "& .MuiOutlinedInput-notchedOutline": {
                borderRadius: 3,
              },
            },
          }}
          inputProps={{ spellCheck: "false" }}
          sx={{
            input: {
              color: (theme) => theme.palette.secondary.main,
              fontFamily: "Monospace",
            },
            width: "100%",
          }}
        />
      </Grid>
      <Grid item xs={1} sx={{ display: { sx: "none", sm: "block" } }} />
      <Grid item xs={1} sx={{ display: { sx: "none", sm: "block" } }} />
      <Grid item xs={12} sm={10}>
        <>
          <Typography
            variant="body2"
            color="primary"
            sx={{ fontFamily: "monospace", color: "#686868" }}
          >
            {outputMessage}
          </Typography>
          <Typography
            variant="subtitle1"
            color="secondary"
            sx={{ fontFamily: "Monospace", paddingTop: 2 }}
          >
            {outputStack.length === 0 ? "( stack clear )" : ""}
          </Typography>
          {[...outputStack].reverse().map((entry, i) => (
            <div key={i}>
              <Typography
                component="span"
                align="left"
                sx={{
                  fontSize: 16,
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
              sx={{ fontSize: 18, color: (theme) => theme.palette.info.main }}
            >
              custom:
            </Typography>
            {userCmdList.map((cmd) => {
              return (
                <Typography key={cmd} color="secondary" sx={{ fontSize: 18 }}>
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
          ( Refresh page to clear all. Enter 'cmds' to list commands and 'cls'
          to clear stack. )
        </Typography>
      </Grid>
      <Grid item xs={12}>
        <Tooltip title="Usage Guide" arrow enterDelay={500}>
          <IconButton
            target="_blank"
            href="https://github.com/usefulmove/coren/blob/main/USAGE.md"
          >
            <HelpOutline fontSize="small" sx={{ color: "#454545" }} />
          </IconButton>
        </Tooltip>
        <Tooltip title="GitHub repository" arrow enterDelay={500}>
          <IconButton
            target="_blank"
            href="https://github.com/usefulmove/coren/\#readme"
          >
            <GitHub fontSize="small" sx={{ color: "#454545" }} />
          </IconButton>
        </Tooltip>
      </Grid>
    </Grid>
  );
}

export default App;
