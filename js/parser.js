class Parser {
  constructor(tokens) {
    this.tokens = tokens;
    this.current = 0;
  }

  peek() {
    return this.tokens[this.current];
  }

  consume() {
    return this.tokens[this.current++];
  }

  // 1+2+3

  parseExpression() {
    let node = this.parseTerm();

    while (["+", "-"].includes(this.peek())) {
      const operator = this.consume();
      const right = this.parseTerm();

      node = {
        type: "BinaryExpression",
        operator,
        left: node,
        right,
      };
    }
    return node;
  }

  parseTerm() {
    let node = this.parseFactor();

    while (["*", "/"].includes(this.peek())) {
      const operator = this.consume();
      const right = this.parseFactor();

      node = {
        type: "BinaryExpression",
        operator: operator,
        left: node,
        right: right,
      };
    }
    return node;
  }

  parseFactor() {
    const token = this.peek();

    if (token === "+") {
      this.consume();
      return this.parseFactor();
    }

    if (token === "-") {
      this.consume();
      return {
        type: "UnaryExpression",
        operator: "-",
        argument: this.parseFactor(),
      };
    }

    if (typeof token === "number") {
      this.consume();
      return {
        type: "Literal",
        value: token,
      };
    }

    throw new Error(`Esperava um número, mas encontrou: ${token}`);
  }
}

export default Parser;
