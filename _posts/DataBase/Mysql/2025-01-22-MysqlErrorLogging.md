---
title: MySQL에서 PL/SQL 에러 로깅 처리 방법
description: MySQL에서 PL/SQL 구문으로 작성된 프로시저 로직 수행 시 발생하는 에러를 처리하고 기록하는 방법에 대해 알아보겠습니다.
author: kis
categories: [DataBase, MySQL]
tags: [DataBase, MySQL, MariaDB, PL/SQL, "Error Handling", SQLEXCEPTION, HANDLER]
pin: false
math: false
mermaid: false
---

### 1. 에러 핸들러 설정

먼저, 프로시저 내에서 에러를 핸들링하기 위해 핸들러를 설정해야 합니다. 

```sql
DECLARE EXIT HANDLER FOR SQLEXCEPTION
BEGIN
    -- 에러 발생 시 수행할 로직
END;
```

### 2. 에러 로그 테이블 생성

에러를 기록할 테이블을 생성합니다. 예를 들어, `error_log` 테이블을 생성할 수 있습니다.

```sql
CREATE TABLE error_log (
    id INT AUTO_INCREMENT PRIMARY KEY,
    error_message TEXT,
    error_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 3. 에러 기록 로직 추가

프로시저 내에서 에러가 발생했을 때, 에러 메시지를 `error_log` 테이블에 기록하는 로직을 추가합니다.

```sql
DECLARE EXIT HANDLER FOR SQLEXCEPTION
BEGIN
    DECLARE sql_state VARCHAR(5);
	DECLARE error_no INT;
    DECLARE err_msg TEXT;
    GET DIAGNOSTICS CONDITION 1
        sql_state  = RETURNED_SQLSTATE   -- SQLSTATE 코드
        , error_no = MYSQL_ERRNO         -- MySQL 오류 번호
        , err_msg  = MESSAGE_TEXT;       -- 오류 내용
    INSERT INTO error_log (error_message) VALUES (err_msg);
END;
```

### 4. 전체 예제

다음은 에러 로깅을 포함한 전체 프로시저 예제입니다.

```sql
DELIMITER //

CREATE PROCEDURE sample_procedure()
BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        DECLARE err_msg TEXT;
        GET DIAGNOSTICS CONDITION 1
            err_msg = MESSAGE_TEXT;
        INSERT INTO error_log (error_message) VALUES (err_msg);
    END;

    -- 프로시저 로직
    DECLARE some_variable INT;
    SET some_variable = 1 / 0; -- 에러 발생 예시
END //

DELIMITER ;
```


