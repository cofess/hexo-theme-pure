---
title: 《深度学习模型及应用详解》读书笔记 
date: 
mathjax: true
---

## TODO


## 第二章 深度学习开源框架
深度学习的变化真的很快，在2015年的时候，tensoflow刚出来，theano还是深度学习框架的霸主，而如今，theano都已经销声匿迹，只剩下了tensorflow和pytorch在争霸了。

深度学习的框架中，主要有两种分布式架构，分别是**Parameter Server-Workers**和**All-Reduce**。

Parameter Server-Workers有两部分，分别是Parameter Server和Wokers，前者是用来存储和处理参数的，后者是用来负责处理数据的，如果是多个Parameter Server和Woker的话，就分别只负责一部分。Parameter Server从Work中获取数据计算后的梯度信息，然后更新参数，Work在处理的时候会从Parameter Server上获取参数数据进行数据处理，得到当前的数据梯度信息。

All-Reduce的模式是每台机器既负责计算，也负责模型参数的更新。把数据分成n份，分别在每台机器上计算，然后求一个平均的梯度，然后把所有机器上的梯度都按照这个参数进行更新。