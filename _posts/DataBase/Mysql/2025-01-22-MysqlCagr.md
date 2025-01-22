---
title: MySQL에서 CAGR 계산하기
description: "MySQL에서 POWER 함수를 사용하여 CAGR을 계산할 수 있습니다. "
author: kis
categories: [DataBase, MySQL]
tags: [DataBase, MySQL, MariaDB, CAGR, PL/SQL, function]
pin: false
math: true
mermaid: false
---

### CAGR (연평균복합성장율, Compound Annual Growth Rate)

CAGR은 일정 기간 동안의 투자 성장률을 나타내는 지표입니다. 이는 시작 값에서 끝 값까지의 비율을 연간 복리로 계산하여 나타냅니다. CAGR은 투자 성과를 비교하거나 미래의 성장률을 예측하는 데 유용합니다.

CAGR을 계산하는 공식은 다음과 같습니다:

$$ \text{CAGR} = \left( \frac{EV}{BV} \right)^{\frac{1}{n}} - 1   $$

- `EV` : 최종 가치 (Ending Value)
- `BV` : 초기 가치 (Beginning Value)
- `n`  : 기간 (년 단위)

### MySQL에서 CAGR 함수 생성하기

```sql
DELIMITER //

CREATE FUNCTION CalculateCAGR(beginning_value DOUBLE, ending_value DOUBLE, periods INT)
RETURNS DOUBLE
DETERMINISTIC
BEGIN
    DECLARE cagr DOUBLE;    
    SET cagr = POWER(ending_value / beginning_value, 1.0 / periods) - 1;
    RETURN cagr;
END //

DELIMITER ;
```

위 함수는 초기 값, 최종 값, 기간을 입력받아 CAGR을 계산하여 반환합니다. 사용 예시는 다음과 같습니다.

```sql
SELECT CalculateCAGR(1000, 2000, 3) AS CAGR;
```
