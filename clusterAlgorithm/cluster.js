let tooltip = document.getElementById("tooltip");
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

function clearCanv() {
    canv.removeEventListener('mousemove', onCanvasHover);
    ctx.clearRect(0, 0, canv.width, canv.height);
    points = [];
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canv.width, canv.height);
}

function euclideanDistance(pointA, pointB) {
    return Math.sqrt(
        pointA.reduce((sum, val, i) => sum + (val - pointB[i]) ** 2, 0)
    );
}

const colors = ["#e6194b", "#3cb44b", "#ffe119", "#0082c8", "#f58231", "#911eb4", "#46f0f0", "#f032e6", "#d2f53c", "#fabebe"];
let points = [];
let squareSize = 500;
let clusteringResults = {
    kmeans: [],
    hierarchical: [],
};
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


function drawClusters(method) {
    ctx.clearRect(0, 0, canv.width, canv.height);
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canv.width, canv.height);

    const clusters = clusteringResults[method];

    clusters.forEach((cluster, i) => {
        for (let [x, y] of cluster) {
            ctx.fillStyle = colors[i];
            ctx.beginPath();
            ctx.arc(x, y, 9, 0, Math.PI * 2);
            ctx.fill();
        }
    });
}

function clusterize() {
    canv.addEventListener('mousemove', onCanvasHover);
    const method = document.getElementById("method").value;
    const k = parseInt(document.getElementById("numOfClusters").value);

    if (k>10){
        showAlert(`Максимальное число кластеров - 10`);
        return;
    }
    else if (points.length < k) {
        showAlert(`Нужно хотя бы ${k} точек!`);
        return;
    }

    clusteringResults.kmeans = kMeans(points, k);
    clusteringResults.hierarchical = hierarchicalClustering(points, k);

    switch (method){
        case 'kmeans':
            drawClusters('kmeans');
            break;
        case 'hierarchical':
            drawClusters('hierarchical');
            break;
    }
}


function getClusterIndex(method, x, y) {
    const clusters = clusteringResults[method];
    for (let i = 0; i < clusters.length; i++) {
        for (let [px, py] of clusters[i]) {
            if (Math.abs(px - x) < 1e-5 && Math.abs(py - y) < 1e-5) {
                return i;
            }
        }
    }
    return null;
}
function onCanvasHover(e) {
    const rect = canv.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const radius = 6;

    let info = null;

    for (const [x, y] of points) {
        const dx = mouseX - x;
        const dy = mouseY - y;
        if (Math.sqrt(dx * dx + dy * dy) <= radius) {
            const kMeansCluster = getClusterIndex("kmeans", x, y);
            const hierarchicalCluster = getClusterIndex("hierarchical", x, y);

            info = `
                <div style="display: flex; align-items: center;">
                    <div style="width: 10px; height: 10px; background-color: ${colors[kMeansCluster]}; margin-right: 5px;"></div>
                    KMeans
                </div>
                <div style="display: flex; align-items: center;">
                    <div style="width: 10px; height: 10px; background-color: ${colors[hierarchicalCluster]}; margin-right: 5px;"></div>
                    Hierarchical
                </div>
            `;
            break;
        }
    }

    if (info) {
        tooltip.innerHTML = info;
        tooltip.style.left = e.clientX + 10 + 'px';
        tooltip.style.top = e.clientY + 10 + 'px';
        tooltip.style.display = 'block';
    } else {
        tooltip.style.display = 'none';
    }
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

function clusterDistance(clusterA, clusterB) {
    let maxDist = -Infinity;
    for (let a of clusterA) {
        for (let b of clusterB) {
            const dist = euclideanDistance(a, b);
            if (dist > maxDist) maxDist = dist;
        }
    }
    return maxDist;
}

function hierarchicalClustering(data, targetClusterCount) {
    let clusters = data.map(point => [point]);

    while (clusters.length > targetClusterCount) {
        let minDist = Infinity;
        let mergeA = 0, mergeB = 0;

        for (let i = 0; i < clusters.length; i++) {
            for (let j = i + 1; j < clusters.length; j++) {
                const dist = clusterDistance(clusters[i], clusters[j]);
                if (dist < minDist) {
                    minDist = dist;
                    mergeA = i;
                    mergeB = j;
                }
            }
        }

        const merged = clusters[mergeA].concat(clusters[mergeB]);
        clusters.splice(mergeB, 1);
        clusters.splice(mergeA, 1);
        clusters.push(merged);
    }

    return clusters;
}







