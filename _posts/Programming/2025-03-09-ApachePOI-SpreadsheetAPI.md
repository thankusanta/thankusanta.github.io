---
title: "Apache POI 및 엑셀 Spreadsheet API"
description: "Apache POI는 Java에서 엑셀 등 Microsoft Office 문서를 다루는 라이브러리입니다."
author: kis
categories: [Programming, Java]
tags: [Programming, Java, "Apache POI", POI, Spreadsheet, 메모리, Memory, Workbook, 엑셀, xls, xlsx, "MS Office"]
pin: false
math: false
mermaid: false
---

## Apache POI란?

Apache POI는 Microsoft Office 문서를 다루기 위한 인기 있는 Java 라이브러리입니다. 대표적으로 Workbook은 `.xls` 및 `.xlsx` 형식의 Excel 파일을 읽고, 쓰고, 조작하는 데 필요한 포괄적인 기능을 제공합니다.

**Apache POI는 강력한 기능을 제공하지만, 사용 시 적절한 메모리 관리를 통한 성능 최적화가 필요합니다.**

**Workbook만을 이용하여 엑셀 파일을 다루면 파일 용량의 수십배 이상의 메모리를 사용하게 되므로, 파일 확장자 및 용량에 따른 적절한 API를 활용해야 OOM이 발생하지 않고, 효율적으로 사용할 수 있습니다.**

### 장점

1. **광범위한 기능**: Apache POI는 MS Office 파일을 읽고 쓰는 것뿐만 아니라, 셀 스타일링, 수식 평가, 차트 생성 등 다양한 기능을 제공합니다.
2. **오픈 소스**: Apache POI는 Apache License 2.0 하에 배포되는 오픈 소스 프로젝트로, 누구나 무료로 사용할 수 있습니다.
3. **활발한 커뮤니티**: 활발한 개발자 커뮤니티와 풍부한 문서가 있어 문제 해결에 도움이 됩니다.
4. **다양한 파일 형식 지원**: `.xls`와 `.xlsx` 등 구버전과 신버전의 MS Office 형식을 모두 지원하여 다양한 MS Office 파일을 처리할 수 있습니다.

### 단점

1. **복잡성**: 기능이 많아 복잡할 수 있으며, 간단한 작업을 수행하는 데에도 많은 코드가 필요할 수 있습니다.
2. **성능**: 대용량 Excel 파일을 처리할 때 성능이 저하될 수 있습니다. 특히 메모리 사용량이 많아질 수 있습니다.
3. **학습 곡선**: 다양한 기능을 익히는 데 시간이 걸릴 수 있습니다.

### 엑셀에 데이터 쓰기 예제

다음은 Apache POI를 사용하여 새로운 Excel 워크북을 생성하고, 시트를 추가하고, 셀에 데이터를 쓰는 간단한 예제입니다:

```java
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;

import java.io.FileOutputStream;
import java.io.IOException;

public class ExcelExample {
    public static void main(String[] args) {
        Workbook workbook = new XSSFWorkbook();
        Sheet sheet = workbook.createSheet("Example Sheet");

        Row row = sheet.createRow(0);
        Cell cell = row.createCell(0);
        cell.setCellValue("Hello, Apache POI!");

        try (FileOutputStream fileOut = new FileOutputStream("example.xlsx")) {
            workbook.write(fileOut);
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}
```

> 이 예제는 새로운 `.xlsx` 파일 객체를 생성하고,   
> "Example Sheet"라는 이름의 시트를 추가한 후,   
> 첫 번째 셀에 "Hello, Apache POI!"라는 문자열을 입력하여,  
> "example.xlsx" 이라는 엑셀 파일을 생성합니다.


### 엑셀 데이터 읽기 예제

다음은 Apache POI를 사용하여 기존 Excel 파일에서 데이터를 읽는 간단한 예제입니다:

```java
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;

import java.io.FileInputStream;
import java.io.IOException;

public class ExcelReadExample {
    public static void main(String[] args) {
        try (FileInputStream fileIn = new FileInputStream("example.xlsx")) {
            Workbook workbook = new XSSFWorkbook(fileIn);
            Sheet sheet = workbook.getSheetAt(0);
            Row row = sheet.getRow(0);
            Cell cell = row.getCell(0);
            String cellValue = cell.getStringCellValue();
            System.out.println("Cell Value: " + cellValue);
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}
```

> 이 예제는 `example.xlsx` 파일을 읽고,   
> 첫 번째 시트의 첫 번째 행의 첫 번째 셀 값을 읽어 출력합니다.

### Spreadsheet API 기능 요약 (Streaming vs In memory tree)

| 구분                      | HSSF (.xls) | HSSF  (.xls) | XSSF  (.xlsx) | XSSF  (.xlsx) | XSSF (.xlsx) |
|--------------------------|------------------------|-----------------------|-------------------------|------------------------|---------------|
| 방식 | EventModel | UserModel | EventModel | UserModel | SXSSF |
| API Type | Streaming | In memory tree | Streaming | In memory tree | Buffered Streaming |
| 대표 API | HSSFListener<br>HSSFRequest   | HSSFWorkbook | XSSFReader | XSSFWorkbook | SXSSFWorkbook  |
| CPU 및<br>메모리<br>효율성      | 높음                   | 낮음                  | 높음                    | 낮음                   | 높음          |
| 순방향 전용              | 예                     | 아니요                | 예                      | 아니요                 | 예            |
| 파일 읽기                 | 예                     | 예                    | 예                      | 예                     | 아니요        |
| 파일 쓰기                 | 예                     | 예                    | 예                      | 예                     | 예            |
| 시트/행/셀<br> 생성           | 예                     | 예                    | 예                      | 예                     | 예            |
| 셀 스타일링               | 아니요                 | 예                    | 아니요                  | 예                     | 제한적        |
| 시트/행/셀<br> 삭제           | 아니요                 | 예                    | 아니요                  | 예                     | 아니요        |
| 행 이동                   | 아니요                 | 예                    | 아니요                  | 예                     | 아니요        |
| 시트 복제                 | 아니요                 | 예                    | 아니요                  | 예                     | 아니요        |
| 수식 평가                 | 아니요                 | 예                    | 아니요                  | 예                     | 아니요        |
| 셀 주석                   | 아니요                 | 예                    | 아니요                  | 예                     | 아니요        |
| 그림                      | 아니요                 | 예                    | 아니요                  | 예                     | 아니요        |


- EventModel은 대용량 파일에 효율적이지만 기능이 제한적입니다.
- UserModel은 전체 읽기/쓰기 기능을 제공하지만 메모리 사용량이 많을 수 있습니다.
- SXSSF는 낮은 메모리 사용량으로 대용량 `.xlsx` 파일을 작성하는 데 적합하지만 읽기 기능이 제공되지 않는 등 기능이 제한적입니다.

### 이벤트 모델(Event Model) vs. 사용자 모델(User Model)

- 이벤트 모델:
    - SAX 파서와 유사하게 작동하며, XML 파일을 순차적으로 읽으면서 발생하는 이벤트를 처리합니다.
    - 파일 전체를 메모리에 로드하지 않으므로 메모리 사용량을 최소화하며, 대용량 파일을 처리하는 데 적합합니다.
    - XML 파일의 구조를 직접 처리해야 하므로 사용자 모델에 비해 코드가 복잡해질 수 있습니다.
    - XSSFReader는 이벤트 모델의 대표적인 예시입니다.

- 사용자 모델:
    - 파일 전체를 메모리에 로드하여 객체 모델로 표현합니다.
    - 파일의 내용을 쉽게 조작하고 접근할 수 있지만, 대용량 파일의 경우 메모리 부족 문제가 발생할 수 있습니다.
    - HSSFWorkbook/XSSFWorkbook 사용자 모델의 대표적인 예시입니다.

### Workbook 메모리 사용량 vs XSSFReader 메모리 사용량 비교

| 파일 용량 | HSSFWorkbook (.xls)<br> 메모리 사용량 | XSSFWorkbook (.xlsx)<br> 메모리 사용량 | XSSFReader (.xlsx)<br> 메모리 사용량 |
|-----------|----------------------------------|-----------------------------------|---------------------------------|
| 1MB       | 10MB                             | 50MB                              | 2MB                             |
| 5MB       | 50MB                             | 250MB                             | 10MB                            |
| 10MB      | 100MB                            | 500MB                             | 20MB                            |
| 50MB      | 500MB                            | 2.5GB                             | 100MB                           |
| 100MB     | 1GB                              | 5GB                               | 200MB                           |

> **참고**: 위 표는 대략적인 메모리 사용량을 나타내며, 실제 사용량은 파일의 내용과 구조에 따라 다를 수 있습니다. 가령, XSSFWorkbook 이용시 실제 메모리 사용량은 50~180배 차이가 나기도 합니다. XSSFReader는 스트리밍 방식으로 메모리 사용량이 상대적으로 적습니다.


#### 출처(참고)

[Apache POI](https://poi.apache.org/components/index.html){:target="\_blank"}
