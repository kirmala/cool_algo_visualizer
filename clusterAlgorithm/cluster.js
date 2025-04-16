let canv = document.getElementById("canvas");
let ctx = canv.getContext("2d");
canv.width = 500;
canv.height = 500;

function showAlert(text) {
    document.getElementById("alertText").innerText = text;
    document.getElementById("myAlert").classList.remove("hidden");
}

function closeAlert() {
    document.getElementById("myAlert").classList.add("hidden");
}

let points = [];

let squareSize = 500;
let x = (canv.width - squareSize) / 2;
let y = (canv.height - squareSize) / 2;

ctx.fillStyle = "white";
ctx.fillRect(x, y, squareSize, squareSize);

canv.addEventListener("mousedown", function (e) {
    let rect = canv.getBoundingClientRect();
    let xPos = e.clientX - rect.left;
    let yPos = e.clientY - rect.top;
    points.push([xPos,yPos]);
    ctx.fillStyle = "black";
    ctx.beginPath();
    ctx.arc(xPos, yPos, 9, 0, Math.PI * 2);
    ctx.fill();
});

function clusterize() {
    let k = parseInt(document.getElementById("numOfClusters").value);
    if (points.length < k) {
        showAlert(`Нужно хотя бы ${k} точек!`);
        return;
    }
    const clusters = kMeans(points, k);


    const colors = ["red", "blue", "green", "orange", "purple"];
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    clusters.forEach((cluster, i) => {
        ctx.fillStyle = colors[i];
        cluster.forEach(([x, y]) => {
            ctx.beginPath();
            ctx.arc(x, y, 9, 0, Math.PI * 2);
            ctx.fill();
        });
    });
}

function kMeans(points, k, maxIterations = 100) {
    let centers = points.slice(0, k);
    let assignments = new Array(points.length).fill(-1);

    for (let iter = 0; iter < maxIterations; iter++) {
        let changed = false;

        for (let i = 0; i < points.length; i++) {
            const [x, y] = points[i];
            let minDist = Infinity;
            let bestCluster = -1;

            for (let j = 0; j < k; j++) {
                const [cx, cy] = centers[j];
                const dist = (x - cx) ** 2 + (y - cy) ** 2;
                if (dist < minDist) {
                    minDist = dist;
                    bestCluster = j;
                }
            }

            if (assignments[i] !== bestCluster) {
                assignments[i] = bestCluster;
                changed = true;
            }
        }

        if (!changed) break;

        const sums = new Array(k).fill(0).map(() => [0, 0]);
        const counts = new Array(k).fill(0);

        for (let i = 0; i < points.length; i++) {
            const cluster = assignments[i];
            sums[cluster][0] += points[i][0];
            sums[cluster][1] += points[i][1];
            counts[cluster]++;
        }

        for (let j = 0; j < k; j++) {
            if (counts[j] > 0) {
                centers[j] = [
                    sums[j][0] / counts[j],
                    sums[j][1] / counts[j]
                ];
            }
        }
    }

    const clusters = new Array(k).fill(0).map(() => []);
    for (let i = 0; i < points.length; i++) {
        clusters[assignments[i]].push(points[i]);
    }

    return clusters;
}
function clearCanv() {
    ctx.clearRect(0, 0, canv.width, canv.height);
    points = [];
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canv.width, canv.height);
}