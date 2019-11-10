## 碰到的问题
### 训练的速度太慢，基本都是GPU在跑
这个[链接](https://github.com/tensorflow/models/issues/5719#issuecomment-437323963)说可能的原因是因为batch_size设置成太大了，导致速度慢，但是他没有提，把batch_size从24设置成1，GPU的利用率有没有上去。因为你看到的速度，影响因素包括了batch_size，这个值越大，那么一次跑的越多，一个batch结束以后过掉的图片越多。

当batch_size为24的时候，在训练的初始阶段，GPU的利用率

另外也提到了可能是新版的训练有问题，采用老版的试试看。

老版的，batch_size=24的情况下，GPU的使用率能够维持在30%左右，说明是新版本的训练的问题！妈的。

### Object Detection API中config文件参数

config文件中有很多的参数没有搞懂，需要了解一下。
```
fine_tune_checkpoint_type:  "detection"
```
是从detection checkpoint还是从claasification checkpoint中恢复参数用于在训练中的初始化（参数的名称需要是兼容的）。其值可以是 'classification' 'detection'，默认是'detection'。[1]
所以，其实这个值只是说明这个预训练的模型是来自于detection还是classification。但是整个的Object Detection API的项目就是用于detection的啊，所以这里的意思应该是对`detection`的过程进行参数调整还是对`classification`的参数进行调整，但是都是属于这个模型的，因为detection的过程也需要classification。

```
load_all_detection_checkpoint_vars:False
```
是否加载所有的detection checkpoint的参数，这个条件需要在`fine_tune_checkpoint_type:'detection'`的情况下才有效。如果是False，那么只有对应scope的变量才会加载，默认是False。这个所谓的**appropriate scopes**到底是指哪一块呢？[2]

```
from_detection_checkpoint:true
```
根据文献[3]的说法，当传入的checkpoint是否属于detection的时候。具体文献[4]中进行了回应。

当`load_all_detection_checkpoint_vars:True`的时候，会出现很多的node不兼容，是不是因为之前没有加载这些node，现在加载了导致的？


## 模型的转换
### 转换成tensorflow-lite兼容的浮点模型
1. 训练模型，得到了checkpoint数据，包括meta和index两部分。
2. 通过`export_tflite_ssd_graph.py`生成tflite兼容的frozen graph[5]，**此处存在一个问题，如果没有原始的checkpoint，只有普通的frozen graph，怎么变成tflite兼容的pb？**
3. 通过`tflite_convert`对2中的模型进行进一步生成tflite模型

### 转换成tensorflow-lite兼容的整型模型
文献[6]详细介绍了应该怎么生成quantized的模型。在转换的时候`change_concat_input_ranges`这个参数很重要，如果没有这个参数，就会core dump。
使用quantized的模型，但是却发现速度更慢了，大概慢了一倍。文献[7]中有提到说是因为他们只是对ARM架构的CPU进行了优化，没有对x86的进行优化，因为没有必要。

实际测试，如果在训练的时候没有指明要进行quantize，后面再强制转换为quantize，得到的模型没有用处。

参考链接：
1. https://github.com/tensorflow/models/blob/17e923da9e8caba5dfbd58846ce75962206ffa64/research/object_detection/core/model.py#L337
2. https://github.com/tensorflow/models/blob/17e923da9e8caba5dfbd58846ce75962206ffa64/research/object_detection/meta_architectures/ssd_meta_arch.py#L1155
3. https://github.com/tensorflow/models/blob/master/research/object_detection/g3doc/configuring_jobs.md#model-parameter-initialization
4. https://github.com/tensorflow/models/issues/3562#issuecomment-372703559
5. https://github.com/tensorflow/models/blob/master/research/object_detection/export_tflite_ssd_graph.py
6. https://github.com/tensorflow/models/blob/master/research/object_detection/g3doc/running_on_mobile_tensorflowlite.md
7. https://github.com/tensorflow/tensorflow/issues/2807

