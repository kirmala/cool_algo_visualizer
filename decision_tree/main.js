function showAlert(text) {
    document.getElementById("alertText").innerText = text;
    document.getElementById("myAlert").classList.remove("hidden");
}

function closeAlert() {
    document.getElementById("myAlert").classList.add("hidden");
}

function parseCSVText(csvText) {
    if (!csvText) {
        throw new Error('Входные данные пусты');
    }

    const lines = csvText.split('\n').filter(line => line.trim() !== '');
    const result = [];

    for (let i = 0; i < lines.length; i++) {
        const parts = lines[i].split(';').map(part => part.trim());
        if (parts.some(part => part === '')) {
            throw new Error(`Строка ${i+1} содержит пустые значения`);
        }
        result.push(parts)
    }
    return result;
}

function parseCSVFile(file, onSuccess, onError) {
    if (!file) {
        onError('Пожалуйста, выберите файл');
        return;
    }

    const reader = new FileReader();

    reader.onload = function(e) {
        try {
            const csvText = e.target.result;
            const parsedData = parseCSVText(csvText);
            onSuccess(parsedData);
        } catch (error) {
            onError(error.message);
        }
    };

    reader.onerror = function() {
        onError('Ошибка при чтении файла');
    };

    reader.readAsText(file);
}

document.addEventListener('DOMContentLoaded', function() {
    let tree = null;
    let hSize = null;

    document.getElementById('datasetSubmitBtn').addEventListener('click', function() {
        const fileInput = document.getElementById('datasetFile');
        const file = fileInput.files[0];

        parseCSVFile(
            file,
            (parsedData) => {
                console.log('Данные успешно загружены:', parsedData);
                const userHeaders = document.getElementById('headersInput').value.trim();
                let parsedHeaders = null;
                try {
                    parsedHeaders = userHeaders ? parseCSVText(userHeaders)[0] : null;
                } catch (error) {
                    console.log("Используются заголовки по умолчанию:", error.message);
                }
                hSize = setHeaders(parsedHeaders, parsedData);
                tree = buildTree(parsedData);
                let path = [];
                drawTree(tree, path);
            },
            (error) => {
                console.error('Ошибка:', error);
                showAlert(`Ошибка: ${error}`);
            }
        );
    });

    document.getElementById('objectSubmitBtn').addEventListener('click', function() {
        const userObject = document.getElementById('objectInput').value.trim();
        
        if (!tree) {
            showAlert("Сначала загрузите данные для построения дерева решений.");
            return;
        }

        try {
            const parsedObject = parseCSVText(userObject)[0];
            if (parsedObject.length != hSize) {
                showAlert("введите корректный классифицируемый объект")
                return;
            }
            console.log("Классифицируемый объект:", parsedObject);

            const path = classifyPath(parsedObject, tree).path;
            drawTree(tree, path);
        } catch (error) {
            showAlert(`Ошибка при обработке объекта: ${error.message}`);
        }
    });

    document.getElementById('pruneBtn').addEventListener('click', function() {
        if (!tree) {
            showAlert("Сначала загрузите данные для построения дерева решений.");
            return;
        }
        
        let minGain = parseFloat(document.getElementById('pruneThreshold').value);
        if (isNaN(minGain)) {
            minGain = 0.2;
            showAlert("Установлено значение по умолчанию: 0.2");
        } else if (minGain < 0 || minGain > 1) {
            minGain = 0.2;
            showAlert("Некорректное значение. Установлено значение по умолчанию: 0.2");
        }
        
        tree = pruneTree(tree, minGain);
        let path = [];
        drawTree(tree, path);
    });
});