---
title: "机器学习实践——Softmax回归（Softmax Regression）"
mathjax: true
---

## 0x00 问题引入
在Sigmoid回归问题中，我们梳理了二元的回归函数，但是很多时候类别是大于2的。比如需要区分0-9这10个数字，就需要10个类别。

其实Softmax和Logistic回归本质上是一样的。在Logistic二分类的问题中，是将特征值`$x$`先经过线性方程，再经过非线性方程，最后得到一个预测值，让预测值要么等于1，要么等于0.同样的，对于多分类的问题，我们也是让特征值先经过线性方程，再经过非线性方程，最后得到一个值。只不过现在是要得到`$k$`个值。同一套的`$\theta$`肯定是不行的，我们需要给每个分类都配`$\theta$`。假设自变量总共有`$n$`个特征，最后总共有`$k$`个分类，则`$\theta$`的`$shape=n \times k$`。但是有个问题是，每一个分类都有一个值，选哪个？此时Softmax里面的`$max$`的价值就体现出来了。就选取其中值最大的出来。相当于取概率最大的那个。我们怎么去构建这块思路，就会体现在训练出来的参数上。

## 0x01 问题概述与思路

非线性的过程我们选取`$g(\theta^Tx)=e^{\theta^Tx}$`。
因此可以得到

$$
h_\theta(x^{(i)})=
\begin{bmatrix}
p(y^{(i)}=1|x^{(i)};\theta)\\
p(y^{(i)}=2|x^{(i)};\theta)\\
\cdots \\
p(y^{(i)}=k|x^{(i)};\theta)
\end{bmatrix}
=
\frac{1}{\sum_{j=1}^ke^{x^{(i)}\theta_j^T}}
\begin{bmatrix}
e^{x^{(i)}\theta_1^T}\\
e^{x^{(i)}\theta_2^T}\\
\cdots\\
e^{x^{(i)}\theta_k^T}
\end{bmatrix}
=
\begin{bmatrix}
h_{\theta_{1}}(x^{(i)})\\
h_{\theta_{2}}(x^{(i)})\\
\cdots \\
h_{\theta_{k}}(x^{(i)})
\end{bmatrix}
$$

下面就是构造损失函数或者最大似然估计函数了。按照现在的情况，好像所谓的最大似然估计函数和损失函数已经不分了，最大似然估计函数加个负号就是损失函数了。

考虑一下我们期望的结果。当预测的分类是正确的时候，我们希望他对应的“概率值”`$h_{\theta_j}(x^{(i)})$`越接近1越好。

我们按照Logistic中的操作，对`$h_\theta(x^{(i)})$`取`$\log$`能够简化运算。在计算之前我们先定义好矩阵。

$$
\theta=
\begin{bmatrix}
\theta_{11} & \theta_{12} & \cdots & \theta_{1n}\\
\theta_{21} & \theta_{22} & \cdots & \theta_{2n}\\
\cdots & \cdots & \cdots & \cdots\\
\theta_{k1} & \theta_{k2} & \cdots & \theta_{kn}
\end{bmatrix}
$$

$$
x = 
\begin{bmatrix}
x^{(1)}_1 & x^{(1)}_2 & \cdots & x^{(1)}_n\\
x^{(2)}_1 & x^{(2)}_2 & \cdots & x^{(2)}_n\\
\cdots & \cdots & \cdots & \cdots\\
x^{(m)}_1 & x^{(m)}_2 & \cdots & x^{(m)}_n\\
\end{bmatrix}
$$

$$
y = 
\begin{bmatrix}
y^{(1)}_1 & y^{(1)}_2 &\cdots &y^{(1)}_k\\
y^{(2)}_1 & y^{(2)}_2 &\cdots &y^{(2)}_k\\
\cdots & \cdots & \cdots & \cdots\\
y^{(m)}_1 & y^{(m)}_2 &\cdots &y^{(m)}_k\\
\end{bmatrix}
$$

我们将`$y$`进行`$one-hot$`编码，对应的分类的`$index$`为1，其余的为0。

$$
x^{(i)} \theta_l^T=\theta_{l1}^T x^{(i)}_{1}+\theta_{l2}^T x^{(i)}_2+\cdots+\theta_{ln}^T x^{(i)}_1n
$$

考虑一下计算最大似然估计的这个过程。有一组样本点`$(x^{(i)},y^{(i)})$`。通过这个样本点，可以计算出`$h_{\theta_l}(x^{(i)}),l\in[1,k]$`。假设`$y^{i}=s,s\in [1,k]$`。那么我们就希望`$h_{\theta_s}(x^{(i)})$`越大越好，当`$l\neq s$`时，就是属于负样本，但是这个负样本有很多种的可能，可能是除了`$s$`以外的其他值，但是概率分布上统一是`$(1- h_{\theta_s}(x^{(i)}))$`。换个角度看，其实就是还是拟合一条直线，只不过这条直线把目标标签和**其他标签**分割开来，这不就是二分类嘛。

$$
J(\theta)=
\sum_{i=1}^m \sum_{l=1}^k[y^{(i)}_l \ln h_{\theta_s (x^{(i)})}+(1-y^{(i)}_l)\ln (1-h_{\theta_s(x^{(i)})})],where\ \ y^{(i)}=s
$$



再把这个问题简化一下，对于每一个样本，我们只能计算与$y^{(i)}$标签对应的那部分`$\theta$`值。比如当`$y^{(i)}=l$`，则我们只能更新`$\theta_l=[\theta_{l1},\theta_{l2},\cdots,\theta_{ln}]$`，。因为其他的`$\theta$`值更新并没有意义，他们虽然代表的是负样本，但是却是有很多种可能的负样本，不管往哪个方向走都是不合适的。因此最大似然估计的导数就可以简化成以下，后半部分和`$\theta_{sj}$`没有关系：

$$
\frac{\partial L(\theta)}{\theta_j}=
\sum_{i=1}^m[y^{(i)}_l \frac{\partial \ln h_{\theta_s(x^{(i)})}}{\theta_{sj}}],where\ \ y^{(i)}=s \tag{1}
$$

$$
\begin{split}
\frac{\partial \ln h_{\theta_s(x^{(i)})}}{\partial \theta_{sj}}
&=\frac{\partial (x^{(i)}\theta_l^T-\ln{\sum_{l=1}^ke^{x^{(i)}\theta_l^T}})}{\partial \theta_{sj}}\\
&=x_j^{(i)}-\frac{\partial \ln{\sum_{l=1}^ke^{x^{(i)}\theta_l^T}}}{\partial \theta_{sj}}\\
&=x_j^{(i)} - \frac{x_j^{(i)} e^{x^{(i)}\theta_s^{T}}}{\sum_{l=1}^ke^{x^{(i)}\theta_l^T}}\\
&=x^{(i)}_j(1-h_{\theta_s (x^{(i)})})
\end{split}
$$

所以可以`$(1)$`式

$$
\frac{\partial L(\theta)}{\theta_j}=
\sum_{i=1}^m x^{(i)}_j(1-h_{\theta_s (x^{(i)})})
$$

然后按照之前的套路

$$
\theta_{sj} = \theta_{sj} + \alpha \sum_{i=1}^m x^{(i)}_j(1-h_{\theta_s (x^{(i)})})
$$

## 0x02 Coding Example



## 0x03 参考文献
[1] https://gist.github.com/dhammack/8071840

[2] http://ufldl.stanford.edu/tutorial/supervised/SoftmaxRegression/





