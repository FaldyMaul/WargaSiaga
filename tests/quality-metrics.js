"use strict";

function divide(numerator, denominator) {
  return denominator ? numerator / denominator : 0;
}

function round(value) {
  return Number(value.toFixed(3));
}

function binaryMetrics(rows) {
  const counts = { tp: 0, fp: 0, tn: 0, fn: 0 };
  for (const row of rows) {
    if (row.actual && row.predicted) counts.tp += 1;
    else if (!row.actual && row.predicted) counts.fp += 1;
    else if (!row.actual && !row.predicted) counts.tn += 1;
    else counts.fn += 1;
  }
  const precision = divide(counts.tp, counts.tp + counts.fp);
  const recall = divide(counts.tp, counts.tp + counts.fn);
  const specificity = divide(counts.tn, counts.tn + counts.fp);
  const f1 = divide(2 * precision * recall, precision + recall);
  const accuracy = divide(counts.tp + counts.tn, rows.length);
  return { ...counts, support: rows.length, accuracy: round(accuracy), precision: round(precision), recall: round(recall), specificity: round(specificity), f1: round(f1) };
}

module.exports = { binaryMetrics };
