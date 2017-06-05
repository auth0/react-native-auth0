export function apply(rules, values) {
  let mapped = {};
  for (let key of Object.keys(rules)) {
    let rule = rules[key];
    let value = values[key];
    if (value) {
      mapped[rule.toName || key] = value;
    } else if (rule.required) {
      throw new Error(rule.message || `The parameter ${key} is required`);
    }
  }
  return mapped;
}