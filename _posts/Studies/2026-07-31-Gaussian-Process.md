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

> Gaussian Process는 사전 지식을 바탕으로 가능한 함수들에 확률을 부여하고,  
> 데이터를 관측할 때마다 그 함수들에 대한 믿음을 갱신한다.  

---

# Stochastic Process

통계학에서 확률과정(Stochastic Process)이란 입력에 의해 인덱싱된 확률변수들의 집합을 의미한다.  
대표적인 예로 시계열을 생각할 수 있다. 시간 ($t$)마다 하나의 확률변수 ($X_t$)가 대응되며,  
$\{ X_t \mid t \in T \}$ 전체가 하나의 확률과정을 이룬다.  
이때 우리가 실제로 관측하는 시계열 데이터는 이 확률과정에서 얻어진 하나의 실현(realization)이다.

Gaussian Process(이하 GP) 역시 확률과정의 하나이다.  
GP에서는 각 입력 ($x$)에서의 함숫값 $f(x)$를 하나의 확률변수로 간주한다.  
따라서 GP 전체는 $\{ f(x) \mid x \in \mathcal{X} \}$로 나타낼 수 있다.

그리고 임의의 유한한 입력점 $\{x_1,\ldots,x_n\}$을 선택했을 때,  
이에 대응하는 함숫값들을 다음과 같은 확률벡터로 나타낼 수 있다.

$$
\mathbf{f}
=
\begin{bmatrix}
f(x_1) \\
f(x_2) \\
\vdots \\
f(x_n)
\end{bmatrix}
$$

GP에서는 이 확률벡터의 결합분포가 다변량 정규분포를 따른다.

$$
\mathbf{f}
\sim
\mathcal{N}(\boldsymbol{\mu}, \Sigma)
$$

즉, GP는 하나의 함수를 미리 정해 두는 대신, 가능한 함수 전체에 대한 확률분포를 정의하는 방법이다.

---

# Covariance Function
GP는 유사한 입력에 대해 유사한 출력이 있을 것이라고 가정한다.  
그리고 그 가정을 공분산함수(Covariance Function)를 통해 입력 사이의 관계를 함숫값 사이의 관계로 표현한다.   

입력 $x_i$와 $x_j$에 대응하는 두 확률변수 $f(x_i)$와 $f(x_j)$의 공분산은 다음과 같이 정의된다.

$$
\operatorname{Cov}(f(x_i), f(x_j))
=
k(x_i, x_j)
$$

여기서 $k(x_i, x_j)$는 입력 $x_i$와 $x_j$ 사이의 유사도를 수치화하는 공분산함수이며, 커널함수(Kernel Function)라고도 부른다.

전체 공분산행렬은 다음과 같이 구성된다.

$$
\Sigma
=
\begin{bmatrix}
k(x_1,x_1) & k(x_1,x_2) & \cdots & k(x_1,x_n) \\
k(x_2,x_1) & k(x_2,x_2) & \cdots & k(x_2,x_n) \\
\vdots & \vdots & \ddots & \vdots \\
k(x_n,x_1) & k(x_n,x_2) & \cdots & k(x_n,x_n)
\end{bmatrix}
$$

따라서 $[\Sigma]_{i,j} = Cov(f(x_i), f(x_j)) = k(x_i, x_j)$이고, 여기서 $k(x_i, x_j)$는 $x_i$와 $x_j$의 유사도를 계산하는 함수이다.  
그리고 그 유사성을 어떻게 계산할지를 정의하는 것이 우리의 믿음(belief, prior)이자 커널 함수의 정체성이다.  
**(Kernels에서 구체적으로 서술)**

대각 원소 $k(x_i,x_i)$는 입력 $x_i$에서의 함숫값 $f(x_i)$가 가지는 분산을 나타내고,  
비대각 원소 $k(x_i,x_j)$는 서로 다른 두 입력에서의 함숫값이 얼마나 함께 변화하는지를 나타낸다.

만약 $k(x_i,x_j)$의 값이 크다면 $f(x_i)$와 $f(x_j)$는 강한 양의 상관관계를 가지며, 한쪽의 값이 크면 다른 쪽도 클 가능성이 높다.  
반대로 $k(x_i,x_j)$가 0에 가깝다면 두 함숫값 사이의 선형적인 관계가 약하다고 해석할 수 있다.

---
앞서 커널함수 $k(x_i,x_j)$는 두 입력 $x_i$와 $x_j$에 대응하는 함숫값 사이의 공분산을 결정한다고 설명했다.  
즉, 커널은 어떤 입력들을 서로 유사하다고 볼 것인지 정의하고, 이를 통해 함수가 가져야 할 구조에 대한 사전 지식을 GP에 부여한다.
 
### Gaussian Kernel

<center>
  <img src='{{ "/assets/images/2026-07-31-Gaussian-Process/gaussian_kernel.png" | relative_url }}' width="40%">
</center>

<p align="center">
  <em>Gaussian Kernel로 정의된 GP 사전분포에서 추출한 함수 표본</em>
</p>

가장 널리 사용되는 커널 중 하나는 Gaussian Kernel이며, RBF(Radial Basis Function) Kernel 또는 Squared Exponential Kernel이라고도 부른다.

$$
k(x_i,x_j)
=
\sigma_f^2
\exp
\left(
-\frac{\lVert x_i-x_j\rVert^2}{2\ell^2}
\right)
$$

여기서 $\lVert x_i-x_j\rVert$는 두 입력 사이의 유클리드 거리이며,  
$\sigma_f^2$는 함수값의 전체적인 변동 크기를, $\ell$은 입력 사이의 유사성이 얼마나 빠르게 감소하는지를 결정하는 길이척도(length-scale)이다.

두 입력 $x_i$와 $x_j$가 가까우면 유클리드 거리가 작으므로 $k(x_i,x_j)$는 큰 값을 가진다.  
반대로 두 입력이 멀어질수록 커널값은 0에 가까워지고, 두 함숫값 사이의 공분산도 작아진다.

따라서 Gaussian Kernel은 유클리드 거리상 가까운 입력에서는 함숫값도 비슷하게 나타나며, 입력이 조금 변하면 함숫값 역시 부드럽게 변할 것이라는 가정을 GP에 부여한다.

### Periodic Kernel

<center>
  <img src='{{ "/assets/images/2026-07-31-Gaussian-Process/periodic_kernel.png" | relative_url }}' width="40%">
</center>

<p align="center">
  <em>Periodic Kernel의 구조</em>
</p>

이번에는 주기적인 구조를 표현하는 Periodic Kernel을 살펴보자.

$$
k(x_i,x_j)
=
\sigma_f^2
\exp
\left(
-\frac{
2\sin^2
\left(
\frac{\pi |x_i-x_j|}{p}
\right)
}{
\ell^2
}
\right)
$$

여기서 $p$는 함수가 반복되는 주기이며, $\ell$은 한 주기 안에서 함숫값이 얼마나 부드럽게 변하는지를 결정한다.

Periodic Kernel은 두 입력 사이의 단순한 유클리드 거리만을 기준으로 유사성을 판단하지 않는다.  
두 입력의 차이 $|x_i-x_j|$가 주기 $p$의 정수배에 가까우면,

$$
\sin^2
\left(
\frac{\pi |x_i-x_j|}{p}
\right)
\approx 0
$$

이므로 두 입력이 실제로 멀리 떨어져 있더라도 커널값은 크게 나타난다.

즉, Periodic Kernel은 입력이 유클리드 거리상 멀리 떨어져 있더라도 주기 $p$만큼 반복되는 동일한 위치에 있다면, 서로 비슷한 함숫값을 가질 것이라는 가정을 GP에 부여한다.

Gaussian Kernel이 가까운 입력에서 비슷한 출력이 나타나는 매끄러운 함수를 가정한다면,  
Periodic Kernel은 일정한 간격으로 비슷한 출력 패턴이 반복되는 함수를 가정한다.

### Matérn Kernel

<center>
  <img src='{{ "/assets/images/2026-07-31-Gaussian-Process/matern_kernel.png" | relative_url }}' width="40%">
</center>

<p align="center">
  <em>Matérn Kernel의 매끄러움 파라미터 $\nu$에 따른 함수 표본의 변화</em>
</p>

Gaussian Kernel은 매우 매끄러운 함수를 가정한다.  
하지만 실제 데이터의 함수가 항상 무한히 매끄럽다고 보기는 어렵다.  
Matérn Kernel은 함수가 얼마나 매끄러운지를 조절할 수 있도록 설계된 커널이다.

Matérn Kernel의 일반적인 형태는 다음과 같다.

$$
k(x_i,x_j)
=
\sigma_f^2
\frac{2^{1-\nu}}{\Gamma(\nu)}
\left(
\frac{\sqrt{2\nu}\lVert x_i-x_j\rVert}{\ell}
\right)^\nu
K_\nu
\left(
\frac{\sqrt{2\nu}\lVert x_i-x_j\rVert}{\ell}
\right)
$$

여기서 $\nu$는 함수의 매끄러움을 결정하는 파라미터이며,  
$K_\nu$는 modified Bessel function이다.

$\nu$가 클수록 더 매끄러운 함수를 가정하며,  
$\nu \rightarrow \infty$이면 Matérn Kernel은 Gaussian Kernel에 가까워진다.

실제 GP 모델에서는 보통 $\nu = 3/2$ 또는 $\nu = 5/2$인 형태가 자주 사용된다.

Matérn-$3/2$ Kernel은 다음과 같다.

$$
k(x_i,x_j)
=
\sigma_f^2
\left(
1+\frac{\sqrt{3}r}{\ell}
\right)
\exp
\left(
-\frac{\sqrt{3}r}{\ell}
\right)
$$

Matérn-$5/2$ Kernel은 다음과 같다.

$$
k(x_i,x_j)
=
\sigma_f^2
\left(
1+\frac{\sqrt{5}r}{\ell}
+\frac{5r^2}{3\ell^2}
\right)
\exp
\left(
-\frac{\sqrt{5}r}{\ell}
\right)
$$

여기서 $r=\lVert x_i-x_j\rVert$이다.

즉, Matérn Kernel은 가까운 입력이 비슷한 함숫값을 가진다는 가정은 유지하면서도,  
함수가 얼마나 부드럽거나 거칠게 변하는지를 조절할 수 있게 한다.

---

# From Prior to Posterior

지금까지 살펴본 커널함수는 데이터를 관측하기 전에 가능한 함수들이 어떤 형태를 가질 것인지에 대한 사전 지식을 GP에 부여한다.  
이를 GP의 사전분포(Prior Distribution)라고 한다.

일반적으로 GP는 평균함수 $m(x)$와 커널함수 $k(x,x')$로 정의된다.

$$
f(x)
\sim
\mathcal{GP}
\left(
m(x),
k(x,x')
\right)
$$

여기서 평균함수는 각 입력에서 기대되는 평균적인 함숫값을 나타낸다.  
다만 실제 GP 모델링에서는 출력을 중심화하거나 표준화한 뒤 평균함수를 $m(x)=0$으로 두는 경우가 많다.  
따라서 이 글에서는 평균함수를 0으로 가정하고, 함수의 구조를 결정하는 커널함수에 집중한다.

$$
f(x)
\sim
\mathcal{GP}
\left(
0,
k(x,x')
\right)
$$

즉, 데이터를 관측하기 전의 GP는 하나의 특정한 함수가 아니라,  
커널함수가 허용하는 여러 함수에 대한 확률분포이다.