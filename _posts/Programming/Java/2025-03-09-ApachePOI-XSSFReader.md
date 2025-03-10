---
title: "Apache POI 이벤트 처리 방식을 통한 대용량 엑셀 파일(.xlsx) 조회하기"
description: "SheetContentsHandler와 XSSFReader를 사용한 이벤트 처리 방식으로 Workbook API 기능 구현하기"
author: kis
categories: [Programming, Java]
tags: [Programming, Java, POI, "Apache POI", "대용량 엑셀 파일", XSSFReader , SheetContentsHandler, 스트리밍, EventModel, Streaming, xlsx]
pin: false
math: false
mermaid: false
---

### 0. 개요
자바 프로그램에서 엑셀 파일(.xlsx) 하나당 수백만 건에서 수천만 건의 데이터를 읽어와 처리하는 작업을 수행해야 했는데, 백만 건당 약 150MB에 달하는 파일을 읽어오기 위해서는 In memory tree 방식인 Workbook API는 사용할 수 없었습니다.  
Apache POI 공식 홈페이지나 검색 사이트에서 SXSSFWorkbook API를 사용하여 대용량 엑셀 파일을 만드는 샘플은 간간이 찾아 볼 수 있었으나, 대용량 엑셀 파일을 조회하여 데이터를 처리하는 샘플은 찾기 어려워서, Apache POI Javadocs를 참고하여 이벤트 처리 방식으로 직접 만들어 보았습니다.
샘플과 같이 전체 엑셀 데이터를 한번만 읽어온 후 메모리에 저장하여 반복적으로 빠르게 조회할지, 
필요시 마다 엑셀 파일을 읽어와 원하는 데이터만 추출하여 메모리 사용량을 최소화할지는 프로그램 목적과 하드웨어 성능 등을 감안하여 선택적으로 프로그래밍해야 합니다.


### 1. 이벤트 핸들러 (Xlsx2ListHandler)
- SheetContentsHandler 이벤트 핸들러로 읽어온 엑셀 데이터를 List에 저장합니다.

```java
import java.util.ArrayList;
import java.util.List;

import org.apache.poi.ss.util.CellRangeAddress;
import org.apache.poi.ss.util.CellReference;
import org.apache.poi.xssf.eventusermodel.XSSFSheetXMLHandler.SheetContentsHandler;

public class Xlsx2ListHandler implements SheetContentsHandler {
    private int maxRowNum = -1;
    private int currentRow = -1;
    private int currentCol = -1;
    private List<List<String>> rows = null; // 엑셀 전체 행 데이터
    private List<String> row = null; // 현재 읽어오는 행 데이터
    
    public Xlsx2ListHandler() {
        this.rows = new ArrayList<List<String>>();        
    }
    
    public Xlsx2ListHandler(int maxRowNum) {
        this.rows = new ArrayList<List<String>>();   
        this.maxRowNum = maxRowNum;
    }
    
    public List<List<String>> getSheetData() {
        return this.rows;
    }
        
    private void setMissingRows(int number) {
        // number 개수 만큼 빈 row 추가
        for(int i = 0 ; i < number; i++) {
            this.rows.add(new ArrayList<String>());
        }        
    }
    
    @Override
    public void startRow(int rowNum) {
        // List에 데이터가 없는 Row 추가
        setMissingRows(rowNum - this.currentRow - 1);
        
        // current row, col 정보 셋팅
        this.currentRow = rowNum;
        this.currentCol = -1;
        if(this.maxRowNum < 0 || this.currentRow < this.maxRowNum) 
            this.row = new ArrayList<String>();        
    }

    @Override
    public void cell(String cellReference, String formattedValue) {
        // 범위 예외 처리
        if(this.maxRowNum > 0 && this.currentRow >= this.maxRowNum) return; 
          
        // 현재 cell 데이터 조회
        if(cellReference == null) {
            cellReference = (new CellRangeAddress(this.currentRow, this.currentRow, this.currentCol, this.currentCol)).formatAsString();
        } 
        int thisCol = (new CellReference(cellReference)).getCol();

        // 데이터가 없는 cell 처리
        int missedCols = thisCol - this.currentCol - 1;
        for(int i=0; i<missedCols; i++) {
            this.row.add("");
        }
        
        if(formattedValue != null) {
            this.currentCol = thisCol;   
                        
            this.row.add(formattedValue);             
        }
    }

    @Override
    public void endRow() { 
        // 엑셀 한 행의 데이터를 모두 읽은 후 List에 row data 추가
        if(this.maxRowNum < 0 || this.currentRow < this.maxRowNum) 
            this.rows.add(this.row);        
    }
        

    @Override
    public void headerFooter(String arg0, boolean arg1, String arg2) {
        // TODO Auto-generated method stub
        
    }

}
```

### 2. 대용량 엑셀 데이터 조회 유틸리티 (Xlsx2ListUtil)
- Xlsx2ListHandler를 호출하여 읽어온 대용량 엑셀 파일 데이터를 조회합니다.

| Class | Methods | Type | Description |
| --- | --- | --- | --- |
| Xlsx2ListUtil | process() | void | 엑셀로 부터 모든 Sheet의 전체 데이터를 읽어올 이벤트 핸들러를 호출합니다. 최초 한번만 호출.  |
| Xlsx2ListUtil | process(int maxRowNum) | void | 엑셀로 부터 Sheet당 최대 maxRowNum개의 Row 데이터를 읽어올 이벤트 핸들러를 호출합니다. 최초 한번만 호출.  |
| Xlsx2ListUtil | getNumberOfSheets() | int | 총 Sheet 개수를 반환합니다. |
| Xlsx2ListUtil | getNumberOfRows(int i) | int | i 번째 엑셀 Sheet의 Row(행) 개수를 반환합니다.  |
| Xlsx2ListUtil | getNumberOfCells(int s, int r) | int | s 번째 엑셀 Sheet의 r 번째 Row(행)의 총 Cell 개수를 반환합니다. |
| Xlsx2ListUtil | getSheets() | `List<~>` | 전체 Sheet 데이터를 반환합니다.  |
| Xlsx2ListUtil | getSheetList(int i)  | `List<~>` | i 번째 Sheet의 List 데이터를 반환합니다. |
| Xlsx2ListUtil | getSheet(int i) | Sheet | i 번째 Sheet를 반환합니다. |
| Xlsx2ListUtil | getRowList(int s, int r) | `List<String>` | s 번째 엑셀 Sheet의 r 번째 Row(행)의 String List Cell 데이터를 반환합니다. |
| Xlsx2ListUtil | getRow(int s, int r) | Row | s 번째 엑셀 Sheet의 r 번째 Row를 반환합니다.  |
| Xlsx2ListUtil | getCell(int s, int r, int c) | String | s 번째 엑셀 Sheet의 r 번째 Row(행)의 c 번째 Cell(열)의 데이터를 반환합니다. |
| Sheet | getNumberOfRows() | int | 엑셀 Sheet의 총 Row(행) 개수를 반환합니다. |
| Sheet | getNumberOfCells(int i) | int | i 번째 인덱스의 Row(행)의 총 Cell 개수를 반환합니다. |
| Sheet | getRowList(int i) | `List<String>` | i 번째 인덱스의 Row(행)의 String List 데이터를 반환합니다. |
| Sheet | getRow(int i) | Row | i 번째 인덱스의 Row(행)를 반환합니다. |
| Sheet | getCell(int r, int c) | String | r 번째 인덱스의 Row(행)의 c 번째 인덱스의 Cell 데이터를 반환합니다.
| Row | getNumberOfCells() | int | Row(행)의 Cell 총 개수를 반환합니다. | 
| Row | getCell(int i) | String | Row(행)의 i 번째 인덱스의 Cell 데이터를 반환합니다. |


```java
import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.List;

import javax.xml.parsers.ParserConfigurationException;
import javax.xml.parsers.SAXParser;
import javax.xml.parsers.SAXParserFactory;

import org.apache.poi.openxml4j.exceptions.OpenXML4JException;
import org.apache.poi.openxml4j.opc.OPCPackage;
import org.apache.poi.xssf.eventusermodel.ReadOnlySharedStringsTable;
import org.apache.poi.xssf.eventusermodel.XSSFReader;
import org.apache.poi.xssf.eventusermodel.XSSFSheetXMLHandler;
import org.apache.poi.xssf.eventusermodel.XSSFSheetXMLHandler.SheetContentsHandler;
import org.apache.poi.xssf.model.StylesTable;
import org.xml.sax.ContentHandler;
import org.xml.sax.InputSource;
import org.xml.sax.SAXException;
import org.xml.sax.XMLReader;
import org.xml.sax.SAXNotRecognizedException;
import org.xml.sax.SAXNotSupportedException;

import Xlsx2ListHandler;

public class Xlsx2ListUtil {
    private final OPCPackage xlsxPackage;
    private List<List<List<String>>> sheets = null;
        
    public class Sheet {
        private List<List<String>> sheet = null;
        
        public Sheet(List<List<String>> sheet) {
            this.sheet = sheet;            
        }
                
        // Sheet의 Row 개수를 가져옵니다.
        public int getNumberOfRows() {                        
            if(this.sheet == null ) {
                return 0;
            } else {
                return this.sheet.size();
            }
        }
        
        // idxRow에 해당하는 Row의 Cell 개수를 가져옵니다.
        public int getNumberOfCells(int idxRow) {
            List<String> row = this.getRowList(idxRow);
            
            if(row == null ) {
                return 0;
            } else {
                return row.size();
            }
        }
        
        // idxRow에 해당하는 Row의 String List를 가져옵니다.
        public List<String> getRowList(int idxRow){  
            if(this.sheet == null || idxRow < 0 || idxRow >= this.sheet.size()) {
                return null;
            } else {
                return this.sheet.get(idxRow);
            }
        }
        
        // idxRow에 해당하는 Row의 데이터를 가져옵니다.
        public Row getRow(int idxRow) {
            Row row = new Row(this.getRowList(idxRow));
            
            return row;            
        }
        
        // idxRow, idxCol에 해당하는 Cell의 데이터를 가져옵니다.
        public String getCell(int idxRow, int idxCol) {
            List<String> row = this.getRowList(idxRow);
            
            if(row == null || idxCol < 0 || idxCol >= row.size()) {
                return null;
            } else {
                return row.get(idxCol);
            }
        }        
    }
    
    public class Row {
        private List<String> row = null;
        
        public Row(List<String> row) {
            this.row = row;            
        }
                
        // Row의 Cell 개수를 가져옵니다.
        public int getNumberOfCells() {                        
            if(this.row == null ) {
                return 0;
            } else {
                return this.row.size();
            }
        } 

        // idxCol에 해당하는 Cell의 데이터를 가져옵니다.
        public String getCell(int idxCol) {            
            if(this.row == null || idxCol < 0 || idxCol >= this.row.size()) {
                return null;
            } else {
                return this.row.get(idxCol);
            }
        }        
    }
      

    public Xlsx2ListUtil(OPCPackage pkg) {
        this.xlsxPackage = pkg;
        this.sheets = new ArrayList<List<List<String>>>();  // Sheets[Rows[Row[Col]]]
    }
    
    // 전체 Sheet의 개수를 가져옵니다.
    public int getNumberOfSheets() {
        return sheets.size();
    }
    
    // idxSheet에 해당하는 Sheet의 Row 개수를 가져옵니다.
    public int getNumberOfRows(int idxSheet) {
        List<List<String>> sheet = this.getSheetList(idxSheet);
        
        if(sheet == null ) {
            return 0;
        } else {
            return sheet.size();
        }
    }
    
    // idxSheet, idxRow에 해당하는 Row의 Cell 개수를 가져옵니다.
    public int getNumberOfCells(int idxSheet, int idxRow) {
        List<String> row = this.getRowList(idxSheet, idxRow);
        
        if(row == null ) {
            return 0;
        } else {
            return row.size();
        }
    }
    
    // 전체 Sheet의 String List 데이터를 가져옵니다.
    public List<List<List<String>>> getSheets() {
        return this.sheets;
    }
    
    // idxSheet에 해당하는 Sheet의 String List 데이터를 가져옵니다.
    public List<List<String>> getSheetList(int idxSheet) {
        if(idxSheet < 0 || idxSheet >= this.sheets.size()  ) {
            return null;
        } else {
            return this.sheets.get(idxSheet);
        }        
    }
    
     // idxSheet에 해당하는 Sheet의 데이터를 가져옵니다.
    public Sheet getSheet(int idxSheet) {        
        Sheet sheet = new Sheet(this.getSheetList(idxSheet));
        
        return sheet;                
    } 
    
    // idxSheet, idxRow에 해당하는 String List를 가져옵니다.
    public List<String> getRowList(int idxSheet, int idxRow){
        List<List<String>> sheet = this.getSheetList(idxSheet);
        
        if(sheet == null || idxRow < 0 || idxRow >= sheet.size()) {
            return null;
        } else {
            return sheet.get(idxRow);
        }
    }
    
    // idxSheet, idxRow에 해당하는 Row의 데이터를 가져옵니다.
    public Row getRow(int idxSheet, int idxRow){
        Sheet sheet = new Sheet(this.getSheetList(idxSheet));
        
        return sheet.getRow(idxRow);                
    }
    
    // idxSheet, idxRow, idxCol에 해당하는 Cell의 데이터를 가져옵니다.
    public String getCell(int idxSheet, int idxRow, int idxCol) {
        List<String> row = this.getRowList(idxSheet, idxRow);
        
        if(row == null || idxCol < 0 || idxCol >= row.size()) {
            return null;
        } else {
            return row.get(idxCol);
        }
    }
    
    private void processSheet(
            StylesTable styles, 
            ReadOnlySharedStringsTable strings,
            SheetContentsHandler sheetContentsHandler,
            InputStream sheetStream
            ) throws IOException, SAXException {
         
        InputSource sheetSource = new InputSource(sheetStream);     
                
        try{
            SAXParserFactory saxFactory = SAXParserFactory.newInstance();
            
            SAXParser saxParser = saxFactory.newSAXParser();
            XMLReader sheetParser = saxParser.getXMLReader();                       
                        
            // fomulasNotResults : true(cell의 함수식 자체를 가져옴), false(cell 결과값을 가져옴)
            ContentHandler handler = new XSSFSheetXMLHandler(styles, strings, sheetContentsHandler, false); 
                        
            sheetParser.setContentHandler(handler);
            sheetParser.parse(sheetSource);                        
            
        }catch(ParserConfigurationException e){
            throw new RuntimeException("SAX parser appears to be broken - " + e.getMessage());
        }
    }    
    
    // 엑셀로 부터 Sheet당 최대 maxRowNum개의 Row 데이터를 읽어올 이벤트 핸들러를 호출합니다.
    public void process(int maxRowNum) throws IOException, SAXException, OpenXML4JException  {
        ReadOnlySharedStringsTable strings = new ReadOnlySharedStringsTable(this.xlsxPackage);
        XSSFReader xssfReader = new XSSFReader(this.xlsxPackage);
        
        StylesTable styles = xssfReader.getStylesTable();
        XSSFReader.SheetIterator iter = (XSSFReader.SheetIterator)xssfReader.getSheetsData();         
                
        while(iter.hasNext()){
            try(InputStream stream = iter.next()) {
                //String sheetName = iter.getSheetName();
                Xlsx2ListHandler handler = new Xlsx2ListHandler(maxRowNum);                
                this.processSheet(styles, strings, handler, stream);
                sheets.add(handler.getSheetData());                
            }
        }        
    }
    
    // 엑셀로 부터 모든 Sheet의 전체 데이터를 읽어올 이벤트 핸들러를 호출합니다.
    public void process() throws IOException, SAXException, OpenXML4JException  {
        this.process(-1);  
    }
}

```

### 3. 대용량 엑셀 파일 조회하기 샘플

```java
import java.io.File;
import java.io.IOException;

import org.apache.poi.openxml4j.opc.OPCPackage;
import org.apache.poi.openxml4j.opc.PackageAccess;

import Xlsx2ListUtil;
import Xlsx2ListUtil.Sheet;
import Xlsx2ListUtil.Row;

public class Sample {

    public static void main(String[] args) throws IOException {

        File excelFile = new File("path/sample.xlsx");

        try(OPCPackage opc = OPCPackage.open(excelFile, PackageAccess.READ)){
            // 엑셀 데이터 로딩
            Xlsx2ListUtil xlsx2List = new Xlsx2ListUtil(opc);
            xlsx2List.process();

            // 1번째 Sheet 2번째 Row 1번째 Cell Data 조회
            String data0 = xlsx2List.getCell(0, 1, 0);

            // Sheet별 조회
            for(int stIdx = 0 ; stIdx < xlsx2List.getNumberOfSheets(); stIdx++) {
                // (stIdx + 1)번째 Sheet 조회
                Sheet sheet =  xlsx2List.getSheet(stIdx);                
                
                // Row 총 개수 조회
                int totalRowNum = st.getNumberOfRows();

                // 7번째 Row의 Cell 총 개수 조회
                Row row = sheet.getRow(6);
                int totalCellNum = row.getNumberOfCells();

                
                // 4번째 Row의 1번쩨 Cell Data 조회
                String data1 = sheet.getCell(3, 0);
                
                // 11번째 Row의 21번째 Cell Data 조회
                String data2 = sheet.getRow(10).getCell(20);
                              
            }            
        }
    }
}

```



#### 출처(참고)

[Apache POI Javadocs](https://poi.apache.org/apidocs/index.html){:target="\_blank"}
