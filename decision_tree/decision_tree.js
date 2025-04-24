let headers = null;

function setHeaders(userHeaders, trainingData) {
  const headersSize = trainingData[0].length - 1;

  if (Array.isArray(userHeaders) && userHeaders.length === headersSize) {
      headers = userHeaders
      console.log(headers)
      return headersSize;
  }

  headers = [];
  for (let i = 0; i < headersSize; i++) {
      headers.push("header" + (i + 1));
  }
  console.log(headers)
  return headersSize
}

function uniqueValues(rows, col) {
  return [...new Set(rows.map(row => row[col]))];
}

function classCounts(rows) {
  const counts = {};
  for (const row of rows) {
    const label = row[row.length - 1];
    counts[label] = (counts[label] || 0) + 1;
  }
  return counts;
}

function countsToRows(counts) {
  const rows = [];
  for (const [label, count] of Object.entries(counts)) {
    for (let i = 0; i < count; i++) {
      rows.push(label);
    }
  }
  return rows;
}


function isNumeric(value) {
  return typeof value === 'number';
}


class Question {
  constructor(column, value) {
    this.column = column;
    this.value = value;
  }
  match(example) {
    const val = example[this.column];
    return isNumeric(val) ? val >= this.value : val === this.value;
  }
  toString() {
    const condition = isNumeric(this.value) ? '>=' : '==';
    return `Is ${headers[this.column]} ${condition} ${this.value}?`;
  }
}


function partition(rows, question) {
  const trueRows = [], falseRows = [];
  for (const row of rows) {
    (question.match(row) ? trueRows : falseRows).push(row);
  }
  return [trueRows, falseRows];
}


function gini(rows) {
  const counts = classCounts(rows);
  let impurity = 1;
  for (const lbl in counts) {
    const prob = counts[lbl] / rows.length;
    impurity -= prob ** 2;
  }
  return impurity;
}


function infoGain(left, right, currentUncertainty) {
  const p = left.length / (left.length + right.length);
  return currentUncertainty - p * gini(left) - (1 - p) * gini(right);
}


function findBestSplit(rows) {
  let bestGain = 0, bestQuestion = null;
  const currentUncertainty = gini(rows);
  const nFeatures = rows[0].length - 1;
  for (let col = 0; col < nFeatures; col++) {
    for (const val of uniqueValues(rows, col)) {
      const question = new Question(col, val);
      const [trueRows, falseRows] = partition(rows, question);

      if (trueRows.length === 0 || falseRows.length === 0) continue;

      const gain = infoGain(trueRows, falseRows, currentUncertainty);

      if (gain >= bestGain) {
        bestGain = gain;
        bestQuestion = question;
      }

    }
  }
  return [bestGain, bestQuestion];
}


class Leaf {
  constructor(rows) {
    this.predictions = classCounts(rows);
  }
}

class DecisionNode {
  constructor(question, trueBranch, falseBranch) {
    this.question = question;
    this.trueBranch = trueBranch;
    this.falseBranch = falseBranch;
  }
}

function buildTree(rows) {
  const [gain, question] = findBestSplit(rows);
  if (gain === 0) return new Leaf(rows);
  const [trueRows, falseRows] = partition(rows, question);
  const trueBranch = buildTree(trueRows);
  const falseBranch = buildTree(falseRows);
  return new DecisionNode(question, trueBranch, falseBranch);
}

function pruneTree(node, minGain) {
  if (!(node instanceof DecisionNode)) return node;
  
  // Prune branches first (post-order traversal)
  node.trueBranch = pruneTree(node.trueBranch, minGain);
  node.falseBranch = pruneTree(node.falseBranch, minGain);
  
  // Only prune nodes with two leaf children
  if (node.trueBranch instanceof Leaf && 
      node.falseBranch instanceof Leaf) {
    
    // Calculate Gini impurity for merged node
    const mergedPredictions = mergePredictions(
      node.trueBranch.predictions, 
      node.falseBranch.predictions
    );
    const mergedGini = gini(countsToRows(mergedPredictions));
    giniGain = infoGain(countsToRows(node.trueBranch.predictions), countsToRows(node.falseBranch.predictions), mergedGini)

    if (giniGain < minGain) {
      return new Leaf(countsToRows(mergedPredictions)); // Replace with leaf
    }
  }
  return node;
}

function mergePredictions(p1, p2) {
  const merged = {...p1};
  for (const [key, value] of Object.entries(p2)) {
    merged[key] = (merged[key] || 0) + value;
  }
  return merged;
}

function printLeaf(counts) {
  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  const probs = [];
  for (const lbl in counts) {
    probs.push(`${lbl}: ${Math.round((counts[lbl] / total) * 100)}%`);
  }
  return probs.join(', ');
}

function classifyPath(row, node) {
  let path = [];  // To store the path of nodes visited
  if (node instanceof Leaf) {
      path.push(node);
      return { path, predictions: node.predictions };
  }

  path.push(node);
  if (node.question.match(row)) {
      const result = classifyPath(row, node.trueBranch);
      path = path.concat(result.path);
      return { path, predictions: result.predictions };
  } else {
      const result = classifyPath(row, node.falseBranch);
      path = path.concat(result.path);
      return { path, predictions: result.predictions };
  }
}
  

const canvas = document.getElementById("treeCanvas");

const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const nodeRadius = 40;
const levelHeight = 120;
const nodePadding = 20;

function measureTreeDepth(node) {
  if (!(node instanceof DecisionNode)) return 1;
  return 1 + Math.max(measureTreeDepth(node.trueBranch), measureTreeDepth(node.falseBranch));
}

function countLeaves(node) {
  if (!(node instanceof DecisionNode)) return 1;
  return countLeaves(node.trueBranch) + countLeaves(node.falseBranch);
}

function layoutTree(node, xStart, xEnd, depth, positions) {
  const x = (xStart + xEnd) / 2;
  const y = depth * levelHeight + nodeRadius;
  positions.push({ node, x, y });

  if (node instanceof DecisionNode) {
    const totalLeaves = countLeaves(node);
    const trueLeaves = countLeaves(node.trueBranch);
    const falseLeaves = countLeaves(node.falseBranch);
    const xMid = xStart + (xEnd - xStart) * (trueLeaves / totalLeaves);

    layoutTree(node.trueBranch, xStart, xMid, depth + 1, positions);
    layoutTree(node.falseBranch, xMid, xEnd, depth + 1, positions);
  }
}

function calculateTreeDimensions(node) {
  const depth = measureTreeDepth(node);
  const leaves = countLeaves(node);
  
  const requiredWidth = (leaves * (nodeRadius * 2 + nodePadding)) + nodePadding;
  const requiredHeight = (depth * levelHeight) + (nodeRadius * 2);
  
  return { requiredWidth, requiredHeight };
}

function drawTree(node, path) {
  const { requiredWidth, requiredHeight } = calculateTreeDimensions(node);
  
  const canvasWidth = Math.max(requiredWidth, window.innerWidth);
  const canvasHeight = Math.max(requiredHeight, 500);
  
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;

  canvas.style.width = `${canvasWidth}px`;
  canvas.style.height = `${canvasHeight}px`;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const positions = [];
  layoutTree(node, nodeRadius, canvas.width - nodeRadius, 0, positions);

  for (let parent of positions) {
    const { node, x, y } = parent;
    if (node instanceof DecisionNode) {
      const trueChild = positions.find(p => p.node === node.trueBranch);
      const falseChild = positions.find(p => p.node === node.falseBranch);
      drawLine(x, y, trueChild.x, trueChild.y, "True");
      drawLine(x, y, falseChild.x, falseChild.y, "False");
    }
  }

  for (let { node, x, y } of positions) {
    drawNode(x, y, node, path.includes(node));
  }
}

function drawNode(x, y, node, isHighlighted) {
  ctx.beginPath();
  ctx.arc(x, y, nodeRadius, 0, 2 * Math.PI);
  ctx.fillStyle = isHighlighted ? "#ff0000" : (node.question ? "#fff" : "#ddf");
  ctx.fill();
  ctx.strokeStyle = "#333";
  ctx.stroke();

  ctx.fillStyle = "#000";
  ctx.font = "14px sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  let text;

  if (node instanceof DecisionNode) {
    text = node.question.toString(); // e.g. "Is color == Red?"
  } else {
    // Leaf: convert prediction counts into percentages
    const total = Object.values(node.predictions).reduce((a, b) => a + b, 0);
    text = Object.entries(node.predictions)
      .map(([label, count]) => `${label}: ${Math.round((count / total) * 100)}%`)
      .join("\n");
  }

  wrapText(ctx, text, x, y);
}

function drawLine(x1, y1, x2, y2, label) {
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.strokeStyle = "#999";
  ctx.stroke();

  ctx.fillStyle = "#000";
  ctx.font = "12px sans-serif";
  ctx.fillText(label, (x1 + x2) / 2, (y1 + y2) / 2 - 5);
}

function wrapText(ctx, text, x, y) {
  const lines = text.split("\n");
  lines.forEach((line, i) => {
    ctx.fillText(line, x, y + (i - lines.length / 2) * 16 + 8);
  });
}
