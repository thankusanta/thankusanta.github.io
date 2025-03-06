---
title: "Mysql, MariaDB에서 상관관계(Correlation) 구하기"
description: "Mysql, MariaDB에서 Correlation 함수를 직접 생성하여 상관관계를 구해봅니다."
author: kis
categories: [DataBase, MySQL]
tags: [DataBase, MySQL, MariaDB, Correlation]
pin: false
math: false
mermaid: false
---

## Correlation이란?

Correlation(상관관계)은 두 변수 간의 관계를 나타내는 통계적 개념입니다. 상관관계는 두 변수 간의 선형 관계의 강도와 방향을 나타내며, 상관계수(Correlation Coefficient)로 측정됩니다. 상관계수는 -1에서 1 사이의 값을 가지며, 1에 가까울수록 양의 상관관계가 강하고, -1에 가까울수록 음의 상관관계가 강합니다. 0에 가까운 값은 두 변수 간에 선형 관계가 거의 없음을 의미합니다.

**주로 퀀트에서 자산관의 상관성을 구하는데 사용합니다.**

## Mysql에서 Correlation 함수 만들기

대부분의 프로그래밍 언어와 최신 MS/Oracle DB, excel, GoogleSheet 는 관련 함수를 제공하지만,Mysql에서는 상관계수를 계산하는 함수를 제공하지 않아, 사용자 정의 함수를 통해 이를 구현할 수 있습니다. 아래는 Mysql에서 상관계수를 계산하는 사용자 정의 함수를 만드는 예제입니다.

```sql
DELIMITER //

CREATE FUNCTION correlation(x_values TEXT, y_values TEXT)
RETURNS DOUBLE
DETERMINISTIC
BEGIN
    DECLARE n INT;
    DECLARE sum_x DOUBLE;
    DECLARE sum_y DOUBLE;
    DECLARE sum_x_sq DOUBLE;
    DECLARE sum_y_sq DOUBLE;
    DECLARE sum_xy DOUBLE;
    DECLARE i INT;
    DECLARE x DOUBLE;
    DECLARE y DOUBLE;
    DECLARE x_array TEXT;
    DECLARE y_array TEXT;
    DECLARE result DOUBLE;

    SET n = JSON_LENGTH(x_values);
    SET sum_x = 0;
    SET sum_y = 0;
    SET sum_x_sq = 0;
    SET sum_y_sq = 0;
    SET sum_xy = 0;
    SET i = 0;

    WHILE i < n DO
        SET x = CAST(JSON_UNQUOTE(JSON_EXTRACT(x_values, CONCAT('$[', i, ']'))) AS DOUBLE);
        SET y = CAST(JSON_UNQUOTE(JSON_EXTRACT(y_values, CONCAT('$[', i, ']'))) AS DOUBLE);
        SET sum_x = sum_x + x;
        SET sum_y = sum_y + y;
        SET sum_x_sq = sum_x_sq + x * x;
        SET sum_y_sq = sum_y_sq + y * y;
        SET sum_xy = sum_xy + x * y;
        SET i = i + 1;
    END WHILE;

    SET result = (n * sum_xy - sum_x * sum_y) / SQRT((n * sum_x_sq - sum_x * sum_x) * (n * sum_y_sq - sum_y * sum_y));
    RETURN result;
END //

DELIMITER ;
```

이 함수는 JSON 배열 형식의 두 입력 값을 받아 상관계수를 계산합니다. `x_values`와 `y_values`는 JSON 배열 형식의 문자열로, 각 배열 요소는 숫자여야 합니다. 함수는 입력된 두 배열의 상관계수를 계산하여 반환합니다.

사용 예제:

```sql
SELECT correlation('[1, 2, 3, 4, 5]', '[2, 4, 6, 8, 10]') AS correlation_coefficient;
```

위 예제는 두 배열 `[1, 2, 3, 4, 5]`와 `[2, 4, 6, 8, 10]`의 상관계수를 계산합니다. 결과는 1이 됩니다.

#### 출처(참고)

[위키피디아-Correlation](https://en.wikipedia.org/wiki/Correlation){:target="\_blank"}
