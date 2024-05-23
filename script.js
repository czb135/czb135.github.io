const network = document.getElementById('network');
const svg = document.getElementById('svg');

// Define the neural network structure
const inputSize = 2;   // Input layer has 2 nodes
const hiddenSize = 3;  // Hidden layer has 3 nodes
const outputSize = 1;  // O utput layer has 1 node

// Random weights (you can also allow the user to input these)
//let W1 = Array.from({ length: hiddenSize }, () => Array.from({ length: inputSize }, () => Math.random()));
let W1 = [
    [0.5, 0.4],
    [0.1, 0.2],
    [0.3, 0.6]
];

let W2 = [
    [0.1, 0.4, 0.7]
];

function init_weight(){
    for (index = 0; index < 3; index++)
        document.getElementById(`node-1-${index}`).innerText = '';
    document.getElementById(`node-2-0`).innerText = '';
    
    document.getElementById('backward').setAttribute('disabled', true);
    document.getElementById('forward').disabled = false;
}

let A1 = [0, 0, 0];
let A2 = [0];
//let W2 = Array.from({ length: outputSize }, () => Array.from({ length: hiddenSize }, () => Math.random()));
let W1_before = W1;
let W2_before = W2;

function reload(){
    location.reload();
}

const goodWeights = {
    W1: [[0.39, 0.49], [0.96, 0.53], [0.04, 0.24]],
    W2: [[0.56, 0.47, 0.51]]
};

const badWeights = {
    W1: [[0.56, 0.12], [0.64, 0.83], [0.48, 0.80]],
    W2: [[0.41, -0.36, -0.22]]
};

function setWeights(weights) {
    // Assuming W1 and W2 are your network weights and you have a function to update the display
    W1 = weights.W1;
    W2 = weights.W2;
    init_weight();
    updateNetworkDisplay(); // This function should re-calculate and update your network's display
    
}

//setWeights(goodWeights);

function updateNetworkDisplay() {
    // Run forward propagation with the new weights
    drawConnections(); // Redraw connections and nodes with updated values
    displayTargetValue();
}

// Function to create nodes in a layer
function createLayer(size, layerIndex, layerName) {
    const layerContainer = document.createElement('div');
    layerContainer.className = 'layer-container';
    layerContainer.style.marginTop = layerIndex * 10 + 'px';  // Increase vertical distance

    const label = document.createElement('div');
    label.className = 'layer-label';
    label.innerText = layerName;
    layerContainer.appendChild(label);

    const layer = document.createElement('div');
    layer.className = 'layer';
    for (let i = 0; i < size; i++) {
        const node = document.createElement('div');
        node.className = 'node';
        node.id = `node-${layerIndex}-${i}`;
        node.style.marginTop = 80 + 'px';  // Adjust vertical space between nodes in the same layer if needed
        layer.appendChild(node);
    }
    layerContainer.appendChild(layer);

    return layerContainer;
}


// Add layers to the network
network.appendChild(createLayer(inputSize, 0, 'Input Layer')); // Input layer
network.appendChild(createLayer(hiddenSize, 1, 'Hidden Layer')); // Hidden layer
network.appendChild(createLayer(outputSize, 2, 'Output Layer')); // Output layer



// Function to compute sigmoid
function sigmoid(x) {
    return 1 / (1 + Math.exp(-x));
}

// Function to compute derivative of sigmoid
function sigmoidDerivative(x) {
    return x * (1 - x);
}

function ReLU(x) {
    //return 1 / (1 + Math.exp(-x));
    return Math.max(0, x);
}

// Function to compute derivative of sigmoid
function ReLUDerivative(x) {
    //return x * (1 - x);
    return x > 0 ? 1 : 0;
}

let inputs = [0, 0];

// Function to perform forward propagation
function forwardPropagation() {
    inputs = [
        parseFloat(document.getElementById('input1').value) || 0,
        parseFloat(document.getElementById('input2').value) || 0
    ];

    inputs.forEach((input, i) => {
        document.getElementById(`node-0-${i}`).innerText = input.toFixed(2);
    });

    A1 = W1.map((weights, index) => {
        return ReLU(weights.reduce((sum, weight, i) => sum + weight * inputs[i], 0));
    });

    A1.forEach((a, i) => {
        document.getElementById(`node-1-${i}`).innerText = a.toFixed(2);
        document.getElementById(`node-1-${i}`).style.color = 'transparent'; 
    });

    A2 = W2.map((weights, index) => {
        return ReLU(weights.reduce((sum, weight, i) => sum + weight * A1[i], 0));
    });

    //console.log(A2);
    document.getElementById(`node-2-0`).innerText = A2[0].toFixed(2);
    document.getElementById(`node-2-0`).style.color = 'transparent'; 

    drawConnections();
    const currentTargetValue = document.getElementById('targetValues').value;
    displayTargetValue(currentTargetValue); // Pass the current input value

    document.getElementById('forward').setAttribute('disabled', true);
    //document.getElementById('backward').setAttribute('disabled', false);
    document.getElementById('backward').disabled = false;
    ForwardresizeWeightText();
    //return { inputs, A1, A2 };

}

function sleep(time){
    return new Promise((resolve) => setTimeout(resolve, time));
}

// Function to draw lines between nodes
function drawConnections() {
    svg.innerHTML = '';
    const svgRect = svg.getBoundingClientRect(); // Get SVG element's position
    const layers = document.querySelectorAll('.layer');
    let yOffset = 10; // Adjust this value as needed to position the weight text correctly

    for (let i = 0; i < layers.length - 1; i++) {
        const currentLayer = layers[i].querySelectorAll('.node');
        const nextLayer = layers[i + 1].querySelectorAll('.node');
        let weights = (i === 0) ? W1 : W2; // Determine which weight set to use
        const maxminvalue = findMinMaxWeights(W1, W2);
    
        currentLayer.forEach((node1, index1) => {
            const rect1 = node1.getBoundingClientRect();
            nextLayer.forEach((node2, index2) => {
                const rect2 = node2.getBoundingClientRect();
                const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                const weightValue = weights[index2][index1];
                const weight_old = (i == 0) ? W1_before[index2][index1] : W2_before[index2][index1];
                //const color = getWeightColor(weightValue); // Function to determine color based on weight
                //console.log(maxminvalue);
                const color = getWeightColor2(weightValue, maxminvalue);
                //console.log(color);
                line.setAttribute('x1', rect1.left + rect1.width / 2 - svgRect.left);
                line.setAttribute('y1', rect1.top + rect1.height / 2 - svgRect.top);
                line.setAttribute('x2', rect2.left + rect2.width / 2 - svgRect.left);
                line.setAttribute('y2', rect2.top + rect2.height / 2 - svgRect.top);
                line.setAttribute('pointer-events', 'all'); // Ensure line can receive pointer events
                line.setAttribute('stroke', color);
                line.setAttribute('stroke-width', 2);
                svg.appendChild(line);

                // Adding weight text
                const weightText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                const midpointx = rect1.left + 0.6 * (rect2.left - rect1.left) + rect1.width / 2 - svgRect.left;
                const midpointy = rect1.top + 0.6 * (rect2.top - rect1.top) + rect1.height / 2 - svgRect.top - yOffset;

                weightText.setAttribute('x', midpointx);
                weightText.setAttribute('y', midpointy);
                weightText.setAttribute('fill', color);
                weightText.setAttribute('font-size', '12px');
                
                weightText.setAttribute('class', `weight-text-${i}-${index1}-${index2}`);

                weightText.textContent = weightValue.toFixed(2);
                weightText.setAttribute('pointer-events', 'none'); // Text does not block line event
                svg.appendChild(weightText);
            });
        });
    }
}

function ForwardresizeWeightText() {
    const weightTextElements = document.querySelectorAll('[class^="weight-text-0"]');
    
    weightTextElements.forEach(text => {
        text.style.fontSize = '20px';  // Set larger size
        const className = text.getAttribute('class');
        const match = className.match(/weight-text-(\d+)-(\d+)-(\d+)/);
        
        if (match) {
            const i = parseInt(match[1], 10);
            const index1 = parseInt(match[2], 10);
            const index2 = parseInt(match[3], 10);
            
            // Update the text content to be the sum of i, index1, and index2
            text.textContent = document.getElementById(`node-0-${index1}`).innerText + '*' + W1[index2][index1].toFixed(2);
            
            setTimeout(() => {
                weightTextElements.forEach(text => {
                    text.style.fontSize = '12px';
                    if(text.textContent.slice(-5)[0] == '-')
                        text.textContent = text.textContent.slice(-5);
                    else
                    text.textContent = text.textContent.slice(-4);
                });
                
                document.getElementById(`node-1-${index2}`).style.color = 'black'; 
            }, 1500);

        } else {
            console.error('Class name format is incorrect:', className);
        }
    });

    setTimeout(() => {
        const weightTextElements = document.querySelectorAll('[class^="weight-text-1"]');
    
        weightTextElements.forEach(text => {
            text.style.fontSize = '20px';  // Set larger size
            const className = text.getAttribute('class');
            const match = className.match(/weight-text-(\d+)-(\d+)-(\d+)/);
            //.log(className);
            if (match) {
                const i = parseInt(match[1], 10);
                const index1 = parseInt(match[2], 10);
                const index2 = parseInt(match[3], 10);
                // Update the text content to be the sum of i, index1, and index2
                text.textContent = document.getElementById(`node-1-${index1}`).innerText + '*' + W2[index2][index1].toFixed(2);

                setTimeout(() => {
                    weightTextElements.forEach(text => {
                        text.style.fontSize = '12px';
                        if(text.textContent.slice(-5)[0] == '-')
                            text.textContent = text.textContent.slice(-5);
                        else
                        text.textContent = text.textContent.slice(-4);
                    });
                    document.getElementById(`node-2-${index2}`).style.color = 'black'; 
                }, 1500);

            } else {
                console.error('Class name format is incorrect:', className);
            }
        });
    }, 3000);
}

function resizeWeightText() {
    const weightTextElements = document.querySelectorAll('[class^="weight-text-1"]');
    
    weightTextElements.forEach(text => {
        text.style.fontSize = '20px';  // Set larger size
        const className = text.getAttribute('class');
        const match = className.match(/weight-text-(\d+)-(\d+)-(\d+)/);
        
        if (match) {
            const i = parseInt(match[1], 10);
            const index1 = parseInt(match[2], 10);
            const index2 = parseInt(match[3], 10);
            //.log([i, index1, index2])
            // Update the text content to be the sum of i, index1, and index2
            text.textContent = W2_before[index2][index1].toFixed(2) + '->' + W2[index2][index1].toFixed(2);

            setTimeout(() => {
                weightTextElements.forEach(text => {
                    text.style.fontSize = '12px';
                    if(text.textContent.slice(-5)[0] == '-')
                        text.textContent = text.textContent.slice(-5);
                    else
                    text.textContent = text.textContent.slice(-4);
                });
            }, 1500);

        } else {
            console.error('Class name format is incorrect:', className);
        }
    });

    setTimeout(() => {
        const weightTextElements = document.querySelectorAll('[class^="weight-text-0"]');
    
        weightTextElements.forEach(text => {
            text.style.fontSize = '20px';  // Set larger size
            const className = text.getAttribute('class');
            const match = className.match(/weight-text-(\d+)-(\d+)-(\d+)/);
            //.log(className);
            if (match) {
                const i = parseInt(match[1], 10);
                const index1 = parseInt(match[2], 10);
                const index2 = parseInt(match[3], 10);
                // Update the text content to be the sum of i, index1, and index2
                text.textContent = W1_before[index2][index1].toFixed(2) + '->' + W1[index2][index1].toFixed(2);

                setTimeout(() => {
                    weightTextElements.forEach(text => {
                        text.style.fontSize = '12px';
                        text.textContent = text.textContent.slice(-4);
                    });
                }, 1500);

            } else {
                console.error('Class name format is incorrect:', className);
            }
        });
    }, 1500);
}

function findMinMaxWeights(W1, W2) {
    // Combine all weights from W1 and W2 into a single flat array
    let allWeights = [...W1.flat(), ...W2.flat()];
    
    // Calculate the maximum and minimum weight values
    let maxWeight = Math.max(...allWeights);
    let minWeight = Math.min(...allWeights);

    return { maxWeight, minWeight };
}

function getWeightColor2(weight, weightvalue) {
    const intensity = (weight - weightvalue.minWeight) / (weightvalue.maxWeight - weightvalue.minWeight); // Calculate the intensity as a fraction of the max weight
    const colorValue = Math.floor(255 -intensity * 255); // Scale up to color range (0-255)
    //console.log(weightvalue.minWeight);
    if (weight > 0) {
        // Positive weights are green
        return `rgb(0, ${colorValue}, 0)`;
    } else {
        // Negative weights are red
        return `rgb(${colorValue}, 0, 0)`;
    }
}

function getWeightColor(value) {
    // Define thresholds for weight values
    const minValue = -1;  // Minimum expected value of weight
    const maxValue = 1;   // Maximum expected value of weight

    // Normalize the value within the expected range
    const normalizedValue = (value - minValue) / (maxValue - minValue);

    // Generate color components
    let red, green, blue = 0; // Start with no blue component

    // Use different color intensities based on the weight's sign and magnitude
    if (value < 0) {
        // For negative values, use a red color scale
        red = 255;
        green = Math.floor((1 - normalizedValue) * 255); // Darker color for larger magnitude
        blue = green;
    } else {
        // For positive values, use a green color scale
        green = 255;
        red = Math.floor((1 - normalizedValue) * 255); // Darker color for larger magnitude
        blue = red;
    }

    return `rgb(${red}, ${green}, ${blue})`;
}





// Redraw connections on window resize
window.addEventListener('resize', drawConnections);


// Draw initial connections
drawConnections();

// Function to perform backward propagation
function backwardPropagation() {
    W1_before = W1;
    W2_before = W2;
    const learningRate = parseFloat(document.getElementById('learningRate').value) || 0.01;
    const targetValuesInput = document.getElementById('targetValues').value.split(',').map(num => parseFloat(num)) ;
    const targetOutputs = targetValuesInput.length === outputSize ? targetValuesInput : Array(outputSize).fill(0);
    const tolerance = 0.001;

    //function iterate() {
        //const { inputs, A1, A2 } = forwardPropagation();
        //console.log(W2);
        // Compute output layer error and delta
        const outputErrors = targetOutputs.map((target, i) => target - A2[i]);
        //console.log(outputErrors);
        const outputDeltas = outputErrors.map((error, i) => error * ReLUDerivative(A2[i]));
        //const outputDeltas = outputErrors.map((error, i) => error * (A2[i]));
        //console.log(outputDeltas);
        const hiddenErrors = W2[0].map((w, j) => w * outputDeltas[0]);
        const hiddenDeltas = hiddenErrors.map((error, i) => error * ReLUDerivative(A1[i]));
        //console.log(hiddenErrors);
        // Update output layer weights and biases
        W2 = W2.map((weights, i) => weights.map((w, j) => w + learningRate * outputDeltas[i] * A1[j]));
  

        // Update hidden layer weights and biases
        W1 = W1.map((weights, i) => weights.map((w, j) => w + learningRate * hiddenDeltas[i] * inputs[j]));

        
    
        //window.alert(b1);
        // Redraw the network with updated weights and display the changes
        //forwardPropagation();
        document.getElementById('backward').setAttribute('disabled', true);
        document.getElementById('forward').disabled = false;
        drawConnections();
        const currentTargetValue = document.getElementById('targetValues').value;
        displayTargetValue(currentTargetValue); // Pass the current input value
        resizeWeightText();
        //const maxError = Math.max(...outputErrors.map(Math.abs));
        //if (maxError > tolerance) {
        //    setTimeout(iterate, 0); // Use setTimeout to avoid freezing the UI
        //} 
    //}

    //iterate();
    
}



function updateWeightsTable() {
    const weightsContainer = document.getElementById('weightsTable');
    let html = '<table border="1"><tr><th>Layer</th><th>Weights</th></tr>';

    html += `<tr><td>Input to Hidden</td><td>${W1.map(row => row.map(w => `<span style="color:${getWeightColor(w)}">${w.toFixed(2)}</span>`).join(', ')).join('<br>')}</td></tr>`;
    html += `<tr><td>Hidden to Output</td><td>${W2.map(row => row.map(w => `<span style="color:${getWeightColor(w)}">${w.toFixed(2)}</span>`).join(', ')).join('<br>')}</td></tr>`;

    html += '</table>';
    weightsContainer.innerHTML = html;
}

function updateSvgHeight() {
    const numberOfLayers = 3; // for example, you might need to dynamically calculate or update this
    const spacingBetweenLayers = 100; // match this to the spacing used in createLayer
    const svgHeight = numberOfLayers * spacingBetweenLayers;
    document.getElementById('svg').style.height = svgHeight + 'px';
}



function displayTargetValue(targetValue) {
    // Parse the input value to a floating number
    targetValue = parseFloat(targetValue);
    if (isNaN(targetValue)) {
        targetValue = 1.0;  // Default value if input is invalid
    }

    // Remove existing target value display if it exists
    const existingRect = document.getElementById('targetDisplayRect');
    const existingText = document.getElementById('targetDisplayText');
    if (existingRect) existingRect.remove();
    if (existingText) existingText.remove();

    const outputNode = document.getElementById('node-2-0');
    if (!outputNode) return;

    const nodeRect = outputNode.getBoundingClientRect();
    const svgRect = svg.getBoundingClientRect();

    // Calculate positions relative to the SVG container
    const rectX = (nodeRect.right - svgRect.left) + 50; // 20 pixels right of the node, adjust as needed
    const rectY = (nodeRect.top - svgRect.top)+ 20;  // Align with the top of the node

    // Create a rectangle
    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    rect.setAttribute('x', rectX);
    rect.setAttribute('y', rectY);
    rect.setAttribute('width', '50');  // Width of the rectangle
    rect.setAttribute('height', '20'); // Height of the rectangle
    rect.setAttribute('fill', 'white'); // Background color of the rectangle
    rect.setAttribute('stroke', 'black'); // Border color
    svg.appendChild(rect);

    // Create text for the target value
    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.setAttribute('x', rectX + 25);  // Center text in the rectangle
    text.setAttribute('y', rectY + 15);  // Adjust vertical position to center text
    text.setAttribute('text-anchor', 'middle'); // Center the text horizontally
    text.setAttribute('dominant-baseline', 'middle'); // Center vertically
    text.textContent = targetValue.toFixed(2); // Display target value
    svg.appendChild(text);

    // Create label text indicating it's a target value
    const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    label.setAttribute('x', rectX + 25);  // Center label above the rectangle
    label.setAttribute('y', rectY - 5);   // Position above the rectangle
    label.setAttribute('text-anchor', 'middle'); // Center the label text horizontally
    label.setAttribute('fill', 'grey');  // Label text color
    label.setAttribute('font-size', '12'); // Label text size
    label.textContent = "Target Value"; // Label content
    svg.appendChild(label);
}

// Call this function after nodes and connections are drawn
displayTargetValue();

window.addEventListener('resize', function() {
    drawConnections();  // Redraw connections which will recalculate positions
    const currentTargetValue = document.getElementById('targetValues').value;
    displayTargetValue(currentTargetValue);  // Pass the current input value to maintain consistency
});

document.addEventListener('DOMContentLoaded', function() {
    const targetInput = document.getElementById('targetValues');
    targetInput.addEventListener('input', function() {
        displayTargetValue(this.value);  // Ensure this is calling the correct function
    });

    // Initial display update to reflect the default or initial value
    displayTargetValue(targetInput.value);
});
