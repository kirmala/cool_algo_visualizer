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


document.addEventListener('DOMContentLoaded', function() {
    let tree = null;  // Declare tree variable

    // Handler for the dataset submission
    document.getElementById('datasetSubmitBtn').addEventListener('click', function() {
        const userDataset = document.getElementById('datasetInput').value.trim();
        const userHeaders = document.getElementById('headersInput').value.trim();
        
        let parsedDataset = null;
        let parsedHeaders = null;

        // Parse dataset
        try {
            parsedDataset = parse(userDataset);
        } catch (error) {
            alert(`Error parsing dataset: ${error.message}`);
            return;  // Exit if dataset parsing fails
        }

        // Parse headers, if provided
        try {
            parsedHeaders = userHeaders ? parse(userHeaders) : null;
        } catch (error) {
            console.log("Using default headers due to error:", error.message);
        }

        // Set headers and build tree
        setHeaders(parsedHeaders, parsedDataset);
        tree = buildTree(parsedDataset);

        // Initialize path and draw tree
        let path = [];
        drawTree(tree, path);
    });

    // Handler for the object classification
    document.getElementById('objectSubmitBtn').addEventListener('click', function() {
        const userObject = document.getElementById('objectInput').value.trim();
        
        if (!tree) {
            alert("Please submit a dataset first to build the decision tree.");
            return;  // Ensure a tree is built first
        }

        try {
            const parsedObject = parse(userObject);
            console.log("Classifying object:", parsedObject);

            // Get classification path and visualize with path highlighted
            const path = classifyPath(parsedObject, tree).path;
            drawTree(tree, path);
        } catch (error) {
            alert(`Error parsing object: ${error.message}`);
        }
    });
});
