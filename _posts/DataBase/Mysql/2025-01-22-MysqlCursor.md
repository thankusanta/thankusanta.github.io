---
title: MySQL에서 Cursor 사용법
description: "MySQL에서 Cursor를 사용하는 방법에 대해 설명하겠습니다."
author: kis
categories: [DataBase, MySQL]
tags: [DataBase, MySQL, MariaDB, PL/SQL, Cursor]
pin: false
math: false
mermaid: false
---

MySQL에서 Cursor는 데이터베이스 쿼리 결과를 행 단위로 처리할 수 있게 해주는 기능입니다.  
주로 저장 프로시저 내에서 사용되며, 복잡한 데이터 처리 로직을 구현할 때 유용합니다. 

### Cursor 선언

Cursor를 사용하려면 먼저 Cursor를 선언해야 합니다. Cursor는 SELECT 문을 기반으로 선언됩니다.

```sql
DECLARE cursor_name CURSOR FOR
SELECT column1, column2
FROM table_name
WHERE condition;
```

### Cursor 열기

Cursor를 사용하기 전에 열어야 합니다. `OPEN` 문을 사용하여 Cursor를 엽니다.

```sql
OPEN cursor_name;
```

### Cursor에서 데이터 가져오기

Cursor에서 데이터를 가져오려면 `FETCH` 문을 사용합니다.   
`FETCH` 문은 Cursor가 가리키는 현재 행의 데이터를 변수에 저장합니다.

```sql
FETCH cursor_name INTO variable1, variable2;
```

### Cursor 닫기

Cursor 사용이 끝나면 반드시 닫아야 합니다. `CLOSE` 문을 사용하여 Cursor를 닫습니다.

```sql
CLOSE cursor_name;
```

### 예제: Cursor를 사용한 저장 프로시저

다음은 Cursor를 사용하여 데이터를 처리하는 저장 프로시저의 예제입니다.  
`table_name`에서 데이터를 읽어와 `another_table`에 삽입하는 저장 프로시저를 정의했습니다.  
`CONTINUE HANDLER`는 Cursor에서 더 이상 읽을 데이터가 없을 때 루프를 종료하는 역할을 합니다.

```sql
DELIMITER //

CREATE PROCEDURE process_data()
BEGIN
    DECLARE done INT DEFAULT 0;
    DECLARE var1 INT;
    DECLARE var2 VARCHAR(100);
    DECLARE cur CURSOR FOR
    SELECT column1, column2 FROM table_name WHERE condition;
    
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = 1;
    
    OPEN cur;
    
    read_loop: LOOP
        FETCH cur INTO var1, var2;
        IF done THEN
            LEAVE read_loop;
        END IF;
        
        -- 데이터 처리 로직
        INSERT INTO another_table (column1, column2) VALUES (var1, var2);
    END LOOP;
    
    CLOSE cur;
END //

DELIMITER ;
```
