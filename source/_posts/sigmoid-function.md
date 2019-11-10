---
title: "机器学习实践——Logistic回归（Logistic Regression）"
mathjax: true
---

## 0x00 问题引入
[上一节](https://joeltsui.github.io/2018/08/24/linear-regression/)中讨论了线性回归，线性回归中`$y$`的值是连续的，有无数种可能。有些问题它的`$y$`值是离散的，可能只有两种或者三种，这类回归问题也叫分类问题。我们以二元分类为例，在二元分类中，`$y$`值有两种可能，分别叫做正样本和负样本。要实现二元分类问题其实也是求一条直线，和线性回归问题一样。对于线性回归问题，是通过已有的点去拟合一条直线，使得这条直线尽可能多的代表已有的数据点。而对于分类问题，也是通过一条直线，但是这条直线是把两个类别分开，直线的这边是正样本，直线的另一边是负样本。因此我们的任务也就变成了，寻找一条可以区分正负样本的直线。


<p align="center"><img src="http://q0qh4z3h0.bkt.clouddn.com/2018-08-26-logistic-regression.png" alt="Classification Example" title style/>


## 0x01 问题概述与思路
都是寻找一条直线，但是直线的目的不同，我们需要通过Loss函数或者最大似然估计函数的不同去求解不同的直线。`$y=ax+b$`得到的是连续值，取值范围根据`$x$`的不同在`$(-\infty,+\infty)$`之间。而我们只有正样本和负样本两个值，因此我们需要一个函数，可以把`$y$`值变成可以得到两个分类的值。我们常用的就是Sigmoid函数。

$$
g(z) = \frac{1}{1+e^{-z}}
$$

因此我们的hypothes函数就是

$$
h_{\theta}(x)=g(\theta^Tx)=\frac{1}{1+e^{-\theta^Tx}}
$$


Sigmoid函数也叫Logistic函数。

<p align="center"><img src="http://q0qh4z3h0.bkt.clouddn.com/2018-08-26-sigmoid-function.png" alt="Logistic Regression" title style/>


我们按照图1来梳理一下整个的流程。
图1中有`$(x_1,x_2,1)$`两个自变量，一对`$(x_1^{(i)},x_2^{(i)},1),x\in[1,m]$`有一个标签对应，表示它是正样本还是负样本，最后的那个1表示的是截距，这个表达式其实和直线方程是一致的。我们现在假设有参数`$\theta=(\theta_1, \theta_2,\theta_3)$`就是我们最后的结果，也就是图中的那条直线。

（1）当`$(x_1^{(i)},x_2^{(i)})$`表示在直线上的点的时候`$\theta^Tx=0$`，

（2）当`$(x_1^{(i)},x_2^{(i)})$`表示在直线下方的点时候`$\theta^Tx<0$`，并且离直线越远，`$\theta^Tx$`的值就越大。`$h_{\theta}(x)$`趋向于1。表示我们的正样本。

（3）当`$(x_1^{(i)},x_2^{(i)})$`表示在直线上方的点时候`$\theta^Tx>0$`，并且离直线越远，`$\theta^Tx$`的值就越小。`$h_{\theta}(x)$`趋向于0。表示我们的负样本。


在利用损失函数或者最大似然估计计算参数的时候，我们并不关系函数的值的大小，我们关心的是他们的趋势。当`$(x_1^{(i)},x_2^{(i)})$`是正样本的时候，我们就希望`$h_{\theta}(x)$`越接近1越好，也就是越大越好，当`$(x_1^{(i)},x_2^{(i)})$`是负样本的时候，我们就希望`$h_{\theta}(x)$`越接近0越好，也就是越小越好，也就是`$(1-h_{\theta}(x))$`越大越好。

考虑到`$h_{\theta}(x)$`的表达式比较复杂，而我们又不关心绝对值，所以可以把`$h_{\theta}(x)$`和`$(1-h_{\theta}(x))$`都取`$\ln$`值。`$\ln$`函数是递增函数，因此我们的希望还是不变。

现在把正负样本和起来写。

$$
l=y\ln{(h_{\theta}(x))}+(1-y)\ln{(1-h_{\theta}(x))}
$$

这个式子可以保证当为正样本（即`$y=1$`）的时候，后半部分为0，前半部分`$(h_{\theta}(x)$`越大越好，当为负样本（即`$y=0$`）的时候，前半部分为0，后半部分`$(1-h_{\theta}(x))$`越大越好。把所有的样本都加起来可以得到：

$$
L(\theta)=\sum_i^m[y^{i}\ln{h_\theta(x^{(i)})}+(1-y^{i})\ln(1-{h_\theta(x^{(i)})}]\tag{1}
$$

取`$L$`的最大值就是我们的目标。

按照在线性回归中的方法，通过求导求最大值。也不是说不能做，但是整个过程会变得很复杂，求导很麻烦。

因此我们换个思路。也就是**梯度上升法**。可以用简单一点的函数去理解，导数就是沿着某个方向变化最快的值，当到达最高点或者最低点的时候，导数为0。我们就沿着当前点的导数方向去调整$\theta$值，使得$L$往最大值的方向走。

对于`$y=ax+b$`函数，自变量只有一个`$x$`，因此对$x$求导就可以，对于`$y=ax_1+bx_2+c$`，自变量有两个，需要在`$x_1$`和`$x_2$`两个方向一起去变化，分别对`$x_1$`和`$x_2$`进行求导。

因此对于式(1)就需要分别对`$\theta_1,\theta_2,...,\theta_{m}$`进行求导，更新每一个`$\theta_{i}$`的值。

为了进一步求导，先计算

$$
\frac{\partial{g(z)}}{\partial{z}}=g(z)(1-g(z))
$$

上述公式推导起来很简单，不多讲。

以某一个`$\theta_j$`为例，求导一下。

$$
\begin{split}
\frac{\partial{L(\theta)}}{\partial{\theta_j}}&=\sum_i^m[{y^{(i)}}\frac{1}{h_{\theta}(x^{(i)})}\frac{\partial{h_\theta}(x^{(i)})}{\partial{\theta_j}}-(1-y^{(i)})\frac{1}{1-h_\theta(x^{(i)})}\frac{\partial{h_\theta(x^{(i)})}}{\partial{\theta_j}}]\\
&=\sum_i^m[{y^{(i)}}\frac{1}{h_{\theta}(x^{(i)})}-(1-y^{(i)})\frac{1}{1-h_\theta(x^{(i)})}]\frac{\partial{h_\theta}(x^{(i)})}{\partial{\theta_j}}\\
&=\sum_i^m[{y^{(i)}}\frac{1}{h_{\theta}(x^{(i)})}-(1-y^{(i)})\frac{1}{1-h_\theta(x^{(i)})}]\frac{\partial{h_\theta(x^{(i)})}}{\partial{z}}\frac{\partial{z}}{\theta_{j}}\\
&=\sum_i^m[{y^{(i)}}\frac{1}{h_{\theta}(x^{(i)})}-(1-y^{(i)})\frac{1}{1-h_\theta(x^{(i)})}]h_\theta(x^{(i)})(1-h_\theta(x^{(i)}))x^{(i)}_j\\
&=\sum_i^m[y^{(i)}(1-h_{\theta}(x^{(i)}))+(y^{(i)}-1)h_{\theta}(x^{(i)})]x^{(i)}_j\\
&=\sum_i^m[y^{(i)}-h_{\theta}(x^{(i)})]x^{(i)}_j
\end{split}
$$

把`$\sum$`去掉，通过向量来表示。`$y=[y^{(1)},y^{(2)},...,y^{(m)}]^T$`，`$x_j=[x^{(1)}_j,x^{(2)}_j,...,x^{(m)}_j]^T$`

$$
\begin{split}
\frac{\partial{L(\theta)}}{\partial{\theta_j}}&=[x_j^{(1)},x_j^{(2)},\cdots,x_j^{(m)}]
\begin{bmatrix}
y^{(1)}-h_\theta(x^{(1)})\\
y^{(2)}-h_\theta(x^{(2)})\\
\cdots\\
y^{(m)}-h_\theta(x^{(m)})
\end{bmatrix}
&=(x_j)^T(y-h_\theta(x))
\end{split}
$$

$$
\begin{split}
\frac{\partial{L(\theta)}}{\partial{\theta}}&=
\begin{bmatrix}
x_1^{(1)} & x_1^{(2)} & \cdots & x_1^{(m)}\\
x_2^{(1)} & x_2^{(2)} & \cdots & x_2^{(m)}\\
\cdots & \cdots & \cdots & \cdots\\
x_n^{(1)} & x_n^{(2)} & \cdots & x_n^{(m)}
\end{bmatrix}
\begin{bmatrix}
y^{(1)}-h_\theta(x^{(1)})\\
y^{(2)}-h_\theta(x^{(2)})\\
\cdots\\
y^{(m)}-h_\theta(x^{(m)})
\end{bmatrix}
=x^T(y-h_\theta(x))
\end{split}
$$

这样就可以通过不断的迭代使得`$\theta$`不断去靠近我们期望的值。

$$
\theta := \theta + \alpha x^T(y-h_\theta(x))
$$

上述的`$\theta=[\theta_1,\theta_2,\cdots,\theta_n]^T$`，`$x=[x^{(1)},x^{(2)},\cdots,x^{(m)}]^T$`,其中 `$x^{(i)}=[x^{(i)}_1,x^{(i)}_2,\cdots,x^{(i)}_n]$`，`$y=[y^{1},y^{(2)},\cdots,y^{(m)}]^T$`。

## 0x02 Coding Example
代码在[这里](https://github.com/JoelTsui/joeltsui.github.io/raw/master/assets/files/logRegres.py)，数据集在[这里](https://github.com/JoelTsui/joeltsui.github.io/raw/master/assets/files/testSet.txt)

将测试集的数据进行展示。

<p align="center"><img src="http://q0qh4z3h0.bkt.clouddn.com/2018-08-26-logistic-example.png" alt="Logistic Regression Example" title style/>
</p>

在这个例子中$x=[x_0,x_1,1]^T$，最后一个的1表示截距。`$\theta=[\theta_0, \theta_1, \theta_2]^T$`，正负样本分别是标签为1和0的数据。数据为`dataMatrix`，标签数据为`labelMatrix`。其中`dataMatrix`的`$shape=100 \times 3$`，`labelMatrix`的`$shape=100 \times 1$`

``` python
def gradAscent(dataMatrix, labelMatrix):
    m,n = dataMatrix.shape
    theta = np.ones((n,1))
    maxCycles = 500
    alpha = 0.001

    for k in range(maxCycles):
        h = sigmoid(np.matmul(dataMatrix,theta))
        delta = np.matmul(dataMatrix.transpose(),(labelMatrix - h))
        theta = theta + alpha*delta
    return theta
```
进过计算就能得到`$\theta$`的参数值了，把`$\theta^T x=0$`直线画上去，就能得到下图了。

<p align="center"><img src="http://q0qh4z3h0.bkt.clouddn.com/2018-08-26-logistic-example-result.png" alt="Logistic Regression Example" title style/>
</p>

(end)











