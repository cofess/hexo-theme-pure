---
title: "机器学习实践——线性回归（Linear Regression）"
mathjax: true
---

## 0x00 回归问题的引入
有一批数据集，现在希望找出一个公式去拟合这批数据集，至于用几个参数，参数都是几阶，就看具体的数据集了。回归问题更像是解方程，有未知数，有训练集作为方程，几对训练集就有多少个方程，当方程数=未知数个数，有唯一解，当方程数>未知数个数，可能就无解，当方程数<未知数个数，有大于一个解。只不过现实中的数据都没有那么理想，并不能100%得到拟合，**只能是选取参数，尽可能的去拟合已有的数据。**

## 0x01 线性回归问题概述
现在我们有一批数据集`$(\overrightarrow{x}^{(i)},y^{(i)}),i\in[1,m]$`，数据总共有$m$组，`$\overrightarrow{x}$`表示的是向量，可以是多维的数据`$\overrightarrow{x}=(x_{0},x_{1},...,x_{n})$`，总共有`$n \times 1$`维的特征。
对于我们来说，特征就是我们的输入，我们希望通过`$\overrightarrow{x}$`的输入得到我们的输出`$y$`。每一个特征都有对应的系数，因此有`$\overrightarrow{\theta}$`，其大小也是`$n \times 1$`。我们要求的就是这个`$\overrightarrow{\theta}$`.

总的来说，我们就是希望能够得到以下的关系

$$
y^{(i)} = \overrightarrow{\theta}^{T}\overrightarrow{x}^{(i)}
$$

方便起见，向量符号统一去掉。

现实中肯定是没有那么好的数据的，并不能保证拟合所有的已知点。我们只是**尽可能接近**的去拟合已有的数据。

尽可能拟合其实包含了两层的意思。一层是估计值和实际值尽可能的接近，也就是说每一个训练集与预测值的误差的总和尽可能的小。另一层是指尽可能的拟合更多的数据，比如有一组参数可以拟合100个点，另一组参数可以拟合1000个点，我们肯定是选择后者参数。

根据上面的两个思路就有了两种解法。

## 0x02 误差角度的线性回归分析

对于第一层意思，其实就是最小二乘法里面用到的。误差 

$$
\varepsilon=|y^{(i)} - \theta^{T}x^{(i)}|
$$

将所有的训练数据误差进行累加。

$$
L=\frac{1}{2}\sum_{i}^{m}(y^{(i)} - \theta^{T}x^{(i)})^2.
$$


$$
\begin{split}
\delta&=
\begin{bmatrix}
y^{1}\\
y^{2}\\
\cdots \\
y^{m}
\end{bmatrix}
-
\begin{bmatrix}
\theta^{T}x^{1}\\
\theta^{T}x^{2}\\
\cdots \\
\theta^{T}x^{m}
\end{bmatrix}\\
&=
\begin{bmatrix}
y^{1} - \theta^{T}x^{1}\\
y^{2} - \theta^{T}x^{2}\\
\cdots \\
y^{m} - \theta^{T}x^{m}
\end{bmatrix}
=Y - X\theta
\end{split}
$$

式子`$(1)$`用矩阵可以表示为

$$
L=\frac{1}{2}\sum_{i}^{m}(y^{(i)} - \theta^{T}x^{(i)})^2 = \frac{1}{2}(Y-X\theta)^{T}(Y-X\theta)
$$

为了让误差最小，对$L$进行求导，就能得到最值点。

$$
\begin{split}
L(y|x;\theta)&=\frac{1}{2}(Y^{T}-\theta^{T}X^{T})(Y-X\theta)\\
&=\frac{1}{2}(Y^{T}Y-Y^{T}X\theta-\theta^{T}X^{T}Y+\theta^{T}X^{T}X\theta)
\end{split}
$$

$$
\begin{split}
\frac{\partial}{\theta}L&=\frac{1}{2}(0-Y^{T}X-(X^{T}Y)^{T}+(X^TX\theta)^{T}+\theta^{T}X^{T}X)\\
&=\frac{1}{2}(-2Y^{T}X+2\theta^{T}X^{T}X)
\end{split}
$$

令`$\frac{\partial}{\theta}L=0$`，得到

$$
\theta^{T}X^{T}X=Y^{T}X\Leftrightarrow(X^{T}X\theta)^{T}=Y^{T}X\Leftrightarrow X^TX\theta=X^{T}Y\Leftrightarrow \theta=(X^{T}X)^{-1}X^{T}Y \tag{2}
$$

> 上面的推导过程主要的麻烦的地方就是`$\frac{\partial}{\theta}(\theta^TX^TY)$和$\frac{\partial}{\theta}(Y^TX\theta)$`怎么求。简单来说就是当`$\theta$`在前面的时候，求导的时候后面要进行转置，当`$\theta$`在后面的时候，保留前面的参数即可。

## 0x03 概率角度的线性回归分析
我们的预测值和实际值存在出入，我们考虑一个较为合理的假设，假设这个误差是一个正太分布，其概率密度就是属于`$\epsilon \sim (\mu,\sigma^2)$`，其均值假设为0（这个假设也是合理的，比较可以把这部分的值分到截距那块）。因此有

$$
y^{i}=\theta^{T}x^{i}+\epsilon^{i}
$$

$$
p(\epsilon^{i})=p(y^{i}-\theta^{T}x^{i})=p(y^{i}|x^{i};\theta)\tag{3}
$$

> 怎么看待`$(3)$`式也是个问题，这里可以这样去理解。有了参数$\theta$，自变量$x$是已知的，不同因变量`$y$`的概率也就知道了，把所有的情况都考虑进去`$y$`的概率分布也就能得到了。

$$
\begin{split}
p(y^{i}|x^{i};\theta)&=\frac{1}{\sqrt{2\pi}\sigma}e^{-\frac{(\epsilon^{i})^2}{2\sigma^2}}\\
&=\frac{1}{\sqrt{2\pi}\sigma}e^{-\frac{(y^{i}-\theta^{T}x^{i})^2}{2\sigma^2}}
\end{split}
$$

于是就有了关于预测值`$\hat{y}$`的概率分布情况。

上面我们一直在强调一个观点，那就是，基本上是做不到拟合所有的点的，我们的目标是**拟合尽可能多的点**，比如对于正太分布，`$x=0$`的时候的概率是最高的，那么我们就用这最多的点去拟合我们的方程。所以有了所谓的**最大似然估计**。

每个样本都是独立同分布，因此所有的样本的概率分布可以这样计算：

$$
P=\prod_{i}^{m}(\frac{1}{\sqrt{2\pi}\sigma}e^{-\frac{(y^{i}-\theta^{T}x^{i})^2}{2\sigma^2}})
$$

因为我们只是找最值，因此两边都取$log$：

$$
\begin{split}
L=\ln{P}&=\sum_{i}^{m}(\ln{(\frac{1}{\sqrt{2\pi}\sigma}e^{-\frac{(y^{i}-\theta^{T}x^{i})^2}{2\sigma^2}})})\\
&=\sum_{i}^{m}(\ln(\frac{1}{\sqrt{2\pi}\sigma})+(-\frac{1}{2\sigma^2}(y^{i}-\theta^{T}x^{i})^2))\\
&=m\ln(\frac{1}{\sqrt{2\pi}\sigma})+(-\frac{1}{2\sigma^2})\sum_{i}^{m}((y^{i}-\theta^{T}x^{i})^2)
\end{split}
$$

为了求最值，和`$\sigma$`是无关的。为了求$L$的最大值，就是求`$\frac{1}{2}\sum_{i}^{m}((y^{i}-\theta^{T}x^{i})^2$`的最小值。于是又回到了式`$(1)$`。接下去的推导就如上所述了。

## 0x04 过拟合与正则
当然，还有过拟合的问题。理论上，越多的参数越是能够拟合训练数据，参数到一定程度的时候，实现0误差也不是不可能，但是，这不是我们想要的，因为他的泛化能力特别差，很多数据是因为噪声造成的，而噪声不是通过训练数据去预测的。因此，我们需要控制参数。

## 0x05 Coding Example
以Python为例，测试一下简单的实现。随机生成一系列的自变量`$x^{i}$`，然后取`$y=ax+b,a=1.5, b=4.3$`，得到一系列的`$y$`，加上随机噪声，根据`$(x^{i},y^{i})$`点对计算出参数`$a,b$`。

按照式`$(2)$`，可以的到

$$
X=
\begin{bmatrix}
x^{1} & 1 \\
x^{2} & 1 \\
\cdots & \cdots \\
x^{m} & 1
\end{bmatrix}
$$

$$
Y=
\begin{bmatrix}
y^{1} \\
y^{2} \\
\cdots \\
y^{m}
\end{bmatrix}
$$

$$
\theta=
\begin{bmatrix}
a\\
b
\end{bmatrix}
$$

直接将数据代入到`$(2)$`式中即可计算得到`$\theta$`。

（未完待续）





