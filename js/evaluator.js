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
  "-": (a, b) => a - b,
  "*": (a, b) => a * b,
  "/": (a, b) => {
    if (b === 0) throw new Error("Divisão por zero");
    return a / b;
  },
};

function applyOperator(operator, left, right) {
  return operators[operator](left, right);
}

export default evaluate;
