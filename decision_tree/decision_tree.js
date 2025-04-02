
function parse(csvText) {
    if (!csvText) {
        throw new Error('Input is empty');
    }

    const lines = csvText.split('\n').filter(line => line.trim() !== '');
    const result = [];

    for (let i = 0; i < lines.length; i++) {
        const parts = lines[i].split(';').map(part => part.trim());
        if (parts.some(part => part === '')) {
            throw new Error(`Line ${i+1} has empty values`);
        }
        result.push(parts)
    }
    return result;
}

function uniqueVals(rows, col) {
    return [...new Set(rows.map(row => row[col]))];
}

function classCounts(rows) {

    const counts = {};
    
    for (const row of rows) {
 
        const label = row[row.length - 1];
        
        if (!counts.hasOwnProperty(label)) {
            counts[label] = 0;
        }
        counts[label]++;
    }
    
    return counts;
}

function isNumeric(value) {
    return !isNaN(parseFloat(value)) && isFinite(value);
}

class Question {
    constructor(column, value) {
        this.column = column;
        this.value = value;
    }

    match(example) {
        const val = example[this.column];
        return isNumeric(val) 
            ? val >= this.value 
            : val === this.value;
    }
}

document.addEventListener('DOMContentLoaded', function() {
    const toggleBtn = document.getElementById('decisionTreeBtn');
    const userDataset = document.getElementById('datasetContainer');
    const object = document.getElementById('objectContainer');
    
    toggleBtn.addEventListener('click', function() {
        userDataset.classList.toggle('hidden');
        object.classList.toggle('hidden');
    });

    document.getElementById('datasetSubmitBtn').addEventListener('click', function() {
        const userInput = document.getElementById('datasetInput').value.trim();
        try {
            const dataset = parse(userInput)
            console.log(dataset)

        } catch (error) {
            alert(`Error: ${error.message}`);
        }
    });

    document.getElementById('objectSubmitBtn').addEventListener('click', function() {
        const userInput = document.getElementById('objectInput').value;
        console.log('User entered:', userInput);
    });
});
