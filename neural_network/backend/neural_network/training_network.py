import numpy as np
import sys
from activation_functions import *

# Load data
train_data = np.loadtxt('mnist_train.csv', delimiter=',', skiprows=1)
test_data = np.loadtxt('mnist_test.csv', delimiter=',', skiprows=1)

x_train, y_train = train_data[:, 1:], train_data[:, 0]
x_test, y_test = test_data[:, 1:], test_data[:, 0]

images, labels = (x_train[0:10000] / 255, y_train[0:10000])

one_hot_labels = np.zeros((len(labels),10))
for i,l in enumerate(labels):
    one_hot_labels[i][int(l)] = 1
labels = one_hot_labels

test_images = x_test / 255
test_labels = np.zeros((len(y_test),10))
for i,l in enumerate(y_test):
    test_labels[i][int(l)] = 1


#define constants
np.random.seed(1)

batch_size = 100
alpha, iterations, hidden_size = (2, 60, 100)
pixels_per_image, num_labels = (784, 10)

weights_0_1 = 0.02*np.random.random((pixels_per_image,hidden_size)) - 0.01
weights_1_2 = 0.2*np.random.random((hidden_size,num_labels)) - 0.1

#learning
for j in range(iterations):
    correct_cnt = 0
    for i in range(int(len(images) / batch_size)):
        batch_start, batch_end = ((i * batch_size),((i+1)*batch_size))
        layer_0 = images[batch_start:batch_end]
        layer_1 = tanh(np.dot(layer_0,weights_0_1))
        dropout_mask = np.random.randint(2,size=layer_1.shape)
        layer_1 *= dropout_mask * 2
        layer_2 = softmax(np.dot(layer_1,weights_1_2))
        for k in range(batch_size):
            correct_cnt += int(np.argmax(layer_2[k:k+1]) == \
            np.argmax(labels[batch_start+k:batch_start+k+1]))

        layer_2_delta = (labels[batch_start:batch_end]-layer_2) / (batch_size * layer_2.shape[0])
        layer_1_delta = layer_2_delta.dot(weights_1_2.T) * tanh2deriv(layer_1)
        layer_1_delta *= dropout_mask

        weights_1_2 += alpha * layer_1.T.dot(layer_2_delta)
        weights_0_1 += alpha * layer_0.T.dot(layer_1_delta)

    
    if (j % 10 == 0):
        test_correct_cnt = 0
        for i in range(len(test_images)):
            layer_0 = test_images[i:i+1]
            layer_1 = tanh(np.dot(layer_0,weights_0_1))
            layer_2 = np.dot(layer_1,weights_1_2)
            test_correct_cnt += int(np.argmax(layer_2) == \
            np.argmax(test_labels[i:i+1]))
        sys.stdout.write("\n"+ "I:" + str(j) + \
        " Test-Acc:"+str(test_correct_cnt/float(len(test_images)))+\
        " Train-Acc:" + str(correct_cnt/float(len(images))))

#save weights
np.savez('model_weights.npz', layer1=weights_0_1, layer2=weights_1_2)
