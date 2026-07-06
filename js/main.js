import tokenize from "./tokenizer.js";
import Parser from "./parser.js";
import evaluate from "./evaluator.js";

const display = document.querySelector(".display");

const controlKeys = new Set(["backspace", "arrowleft", "arrowright", "arrowup", "arrowdown"]);

const commandMap = {
  0: "operand",
  1: "operand",
  2: "operand",
  3: "operand",
  4: "operand",
  5: "operand",
  6: "operand",
  7: "operand",
  8: "operand",
  9: "operand",

  "+": "operator",
  "-": "operator",
  "*": "operator",
  "/": "operator",
  "×": "operator",
  "÷": "operator",

  ",": "decimalSeparator",

  backspace: "delete",

  enter: "equal",
  "=": "equal",

  c: "clear",
};

const handlers = {
  operand: handleNumberInput,
  operator: handleOperatorInput,
  decimalSeparator: handleCommaInput,
  delete: deleteCharacter,
  equal: processResult,
  clear: clearDisplay,
};

document.querySelectorAll(".key").forEach((button) => {
  button.addEventListener("click", handleCalculatorClick);
});

display.addEventListener("keydown", (event) => handleCalculatorTyping(event));

function handleCalculatorTyping(event) {
  const key = event.key.toLowerCase();

  if (controlKeys.has(key)) return;

  event.preventDefault();

  const action = commandMap[key];

  if (!action) {
    showErrorFeedback();
    return;
  }

  dispatchAction(action, key);
}

function handleCalculatorClick(event) {
  const key = event.currentTarget.value;
  const action = commandMap[key];

  dispatchAction(action, key);
  display.focus();
}

function dispatchAction(action, key) {
  handlers[action]?.(key);
}

function handleNumberInput(key) {
  if (display.value === "0") {
    updateDisplayValue(key);
    return;
  }

  insertCharacter(key);
}

function updateDisplayValue(value) {
  display.value = value;
}

function insertCharacter(character) {
  const { start, end } = getSelection();

  const before = display.value.slice(0, start);
  const after = display.value.slice(end);

  const value = before + character + after;

  updateDisplayValue(value);
  updateCaretPosition(start + character.length);
  scrollToEnd();
}

function getSelection() {
  return {
    start: display.selectionStart,
    end: display.selectionEnd,
  };
}

function updateCaretPosition(position) {
  display.setSelectionRange(position, position);
}

function scrollToEnd() {
  display.scrollLeft = display.scrollWidth;
}

function handleOperatorInput(key) {
  if (isInvalidOperatorStart(key)) return showErrorFeedback();

  if (requiresConversion(key)) key = convertOperator(key);

  if (isOperatorAdjacent()) return showErrorFeedback();

  insertCharacter(key);
}

const invalidStartOperators = new Set(["*", "/", "×", "÷"]);

function isInvalidOperatorStart(key) {
  return invalidStartOperators.has(key) && display.selectionStart === 0;
}

function requiresConversion(key) {
  return key === "/" || key === "*";
}

const operatorConversionMap = {
  "/": "÷",
  "*": "×",
};

// Converte os carácteres "/" para "÷" ou "*" para "×"
function convertOperator(key) {
  return operatorConversionMap[key];
}

function isOperatorAdjacent() {
  const beforeCaret = getCharacterBeforeCaret();
  const afterCaret = getCharacterAfterCaret();

  return isOperator(beforeCaret) || isOperator(afterCaret);
}

function getCharacterBeforeCaret() {
  const start = display.selectionStart;

  return display.value.slice(start - 1, start);
}

function getCharacterAfterCaret() {
  const end = display.selectionEnd;

  return display.value.slice(end, end + 1);
}

const operators = new Set(["+", "-", "*", "/", "×", "÷"]);

function isOperator(key) {
  return operators.has(key);
}

function handleCommaInput() {
  if (!canInsertComma()) return showErrorFeedback();

  insertCharacter(",");
}

const operatorRegex = /[+\-*/×÷]/;

function getOperandAtCaret() {
  const { start, end } = getSelection();

  const before = display.value.slice(0, start);
  const after = display.value.slice(end);

  const leftOperand = before.split(operatorRegex).pop();
  const rightOperand = after.split(operatorRegex).shift();

  return leftOperand + rightOperand;
}

function canInsertComma() {
  const { start } = getSelection();
  const caretOperand = getOperandAtCaret();
  const beforeCaret = getCharacterBeforeCaret();

  return !caretOperand.includes(",") && start > 0 && !isOperator(beforeCaret);
}

function processResult() {
  if (display.value && validateExpression(display.value)) {
    const expression = formatExpression(display.value);
    const tokens = tokenize(expression);
    const parser = new Parser(tokens);
    const ast = parser.parseExpression();
    const result = replacePeriodToComma(evaluate(ast));

    updateDisplayValue(result);
  } else {
    showErrorFeedback();
  }
}

function validateExpression(value) {
  const firstCharacter = value.slice(0, 1);
  const lastCharacter = value.slice(-1);

  return firstCharacter !== "," && !isOperator(lastCharacter);
}

function formatExpression(expression) {
  return expression
    .replace(/÷/g, "/")
    .replace(/×/g, "*")
    .replace(/,/g, ".")
    .replace(/\b0+(\d+)/, "$1");
}

function replacePeriodToComma(value) {
  return value.toString().replace(/\./g, ",");
}

function deleteCharacter() {
  const { start, end } = getSelection();

    if (start === 0 && end === 0) return showErrorFeedback();

  const value = display.value;

  const deleteStart = start === end ? start - 1 : start;

  updateDisplayValue(value.slice(0, deleteStart) + value.slice(end));
  updateCaretPosition(deleteStart);
}


function clearDisplay() {
  updateDisplayValue("");
}

// --- Funcionalidade de Erro já foi analisada
const errorSound = new Audio("/assets/audio/error.mp3");
const ERROR_DURATION = 500;

let errorTimeout;

function showErrorFeedback() {
  display.classList.add("error");

  errorSound.currentTime = 0;
  errorSound.play();

  clearTimeout(errorTimeout);

  errorTimeout = setTimeout(() => {
    errorSound.pause();
    errorSound.currentTime = 0;

    display.classList.remove("error");
  }, ERROR_DURATION);
}
