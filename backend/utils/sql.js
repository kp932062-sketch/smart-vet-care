function parseJson(value, fallback = null) {
  if (value == null) {
    return fallback;
  }

  if (typeof value === 'object') {
    return value;
  }

  try {
    return JSON.parse(value);
  } catch (error) {
    return fallback;
  }
}

function toJson(value) {
  return value == null ? null : JSON.stringify(value);
}

function toBoolean(value) {
  return Boolean(Number(value));
}

function normalizeDate(value) {
  return value ? new Date(value) : null;
}

module.exports = {
  parseJson,
  toJson,
  toBoolean,
  normalizeDate
};
