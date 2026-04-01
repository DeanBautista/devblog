export function formatMetricValue(value) {
  const numericValue = Number(value) || 0;

  if (numericValue >= 1000000) {
    return `${(numericValue / 1000000).toFixed(1)}M`;
  }

  if (numericValue >= 1000) {
    return `${(numericValue / 1000).toFixed(1)}K`;
  }

  return `${numericValue}`;
}

export function getFirstName(name, fallbackName = 'Alex Vane') {
  const fullName = name || fallbackName;
  return fullName.split(' ')[0] || fullName;
}
