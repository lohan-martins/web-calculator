function tokenize(expression) {
  const tokens = [];
  let number = "";

  for (const char of expression) {
    if (/\d|\./.test(char)) {
      number += char;
    } else {
      if (number) {
        tokens.push(Number(number));
        number = "";
      }

      tokens.push(char);
    }
  }

  if (number) {
    tokens.push(Number(number));
  }

  return tokens;
}

export default tokenize;