import numpy as np

from neural_network.activation_functions import tanh
    
def load_data():
    loaded_data = np.load('neural_network/model_weights.npz')
    loaded_layer1, loaded_layer2 = loaded_data['layer1'], loaded_data['layer2']
    return loaded_layer1, loaded_layer2

def parse_pixel_data(pixel_data):
    parsed_data = np.array(pixel_data)
    parsed_data = parsed_data/255
    return parsed_data

def recognize_digit(pixel_data):
    weights_0_1, weights_1_2 = load_data()
    layer_0 = parse_pixel_data(pixel_data)

    layer_1 = tanh(np.dot(layer_0,weights_0_1))
    layer_2 = np.dot(layer_1,weights_1_2)
    return int(np.argmax(layer_2))

