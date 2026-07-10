function evaluate(node) {
  if (node.type === "UnaryExpression") {
    const value = evaluate(node.argument);

    if (node.operator === "-") return -value;
    return value;
  }

  if (node.type === "Literal") {
    return node.value;
  }

  if (node.type === "BinaryExpression") {
    const leftValue = evaluate(node.left);
    const rightValue = evaluate(node.right);

    return applyOperator(node.operator, leftValue, rightValue);
  }

  throw new Error(`Tipo de nó desconhecido: ${node.type}`);
}

const operators = {
  "+": (a, b) => a + b,
  "-": calculateSubtraction,
  "*": (a, b) => a * b,
  "/": (a, b) => {
    if (b === 0) throw new Error("Divisão por zero");
    return a / b;
  },
};

function applyOperator(operator, left, right) {
  const result = operators[operator](left, right);
  return normalize(result);
}

function calculateSubtraction(a, b) {
  const precision = Math.max(getSizeDecimal(a), getSizeDecimal(b));

  return (a - b).toFixed(precision);
}

function getSizeDecimal(n) {
  return n.toString().split(".")[1]?.length ?? 0;
}

function normalize(value) {
  return Number(value);
}

export default evaluate;
