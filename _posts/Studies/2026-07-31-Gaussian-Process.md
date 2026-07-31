---
title: "(Work in progress)Gaussian Process"
date: 2026-07-31
categories:
  - Studies
tags:
  - Machine Learning
  - Kernel
  - Statistics
use_math: true
classes: wide
---

Gaussian process,

통계학에서 확률과정(stochastic process)이란 입력에 의해 인덱싱된 확률변수들의 집합을 의미한다. 대표적인 예로 시계열을 생각할 수 있다. 시간 (t)마다 하나의 확률변수 (X_t)가 대응되며,

[{X_t \mid t \in T}]

전체가 하나의 확률과정을 이룬다. 이때 우리가 실제로 관측하는 시계열 데이터는 이 확률과정에서 얻어진 하나의 실현(realization)이다.

가우시안 프로세스(Gaussian process) 역시 확률과정의 하나이다. 가우시안 프로세스에서는 각 입력 (x)에서의 함숫값 (f(x))을 하나의 확률변수로 간주한다. 그리고 임의의 유한한 입력점 (x_1,\ldots,x_n)을 선택했을 때, 이에 대응하는 함숫값

[[f(x_1),f(x_2),\ldots,f(x_n)]^\top]

의 결합분포가 다변량 정규분포를 따르도록 모델링한다.

즉, 가우시안 프로세스는 개별 파라미터의 불확실성을 모델링하는 것이 아니라, 가능한 함수 전체에 대한 확률분포를 정의하는 방법이다.