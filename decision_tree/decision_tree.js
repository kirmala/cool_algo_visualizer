const trainingData = [
  ['Green', 3, 150, 'Smooth', 'Apple'],
  ['Yellow', 3, 170, 'Smooth', 'Apple'],
  ['Red', 1, 120, 'Rough', 'Grape'],
  ['Red', 1, 110, 'Smooth', 'Grape'],
  ['Yellow', 3, 200, 'Bumpy', 'Lemon'],
  ['Green', 4, 160, 'Smooth', 'Apple'],
  ['Red', 2, 140, 'Smooth', 'Grape'],
  ['Yellow', 3, 180, 'Bumpy', 'Lemon'],
  ['Red', 2, 130, 'Rough', 'Grape'],
  ['Green', 3, 155, 'Smooth', 'Apple'],
  ['Yellow', 4, 210, 'Bumpy', 'Lemon'],
];

let headers = null;

function setHeaders(userHeaders, trainingData) {
  const headersSize = trainingData[0].length - 1;

  if (Array.isArray(userHeaders) && userHeaders.length === headersSize) {
      headers = userHeaders
      console.log(headers)
      return;
  }

  // Fallback to default headers
  headers = [];
  for (let i = 0; i < headersSize; i++) {
      headers.push("header" + (i + 1));
  }
  console.log(headers)
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

const nodeRadius = 60;
const levelHeight = 150;
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

function drawTree(node, path) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const positions = [];
  layoutTree(node, nodeRadius, canvas.width - nodeRadius, 0, positions);

  // Draw edges
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


// const tree = buildTree(trainingData);  // Build the decision tree from the training data

// let path = [];

// // Initial drawing of the tree
// drawTree(tree, path);

// Define the testing data
const testing_data = [
  ['Green', 3, 150, 'Smooth'],
  ['Red', 2, 135, 'Rough'],
  ['Yellow', 3, 190, 'Bumpy'],
  ['Green', 4, 165, 'Smooth'],
  ['Red', 1, 125, 'Smooth'],
];

// const data = testing_data[0];
// path = classifyPath(data, tree).path;  // Get the classification path for the current data point
// drawTree(tree, path);

// for (let i = 0; i < testing_data.length; i++) {
//     const data = testing_data[i];
//     path = classifyPath(data, tree);  // Get the classification path for the current data point
//     drawTree(treeData, path);  // Draw the tree with the highlighted path
// }