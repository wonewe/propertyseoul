const { XMLParser } = require('fast-xml-parser');

const xmlData = `<?xml version="1.0" encoding="utf-8" standalone="yes"?><response><header><resultCode>000</resultCode><resultMsg>OK</resultMsg></header><body><items><item><aptDong> </aptDong><aptNm>개포한신</aptNm><buildYear>1984</buildYear><buyerGbn>개인</buyerGbn><cdealDay> </cdealDay><cdealType> </cdealType><dealAmount>164,000</dealAmount><dealDay>8</dealDay><dealMonth>11</dealMonth><dealYear>2025</dealYear><dealingGbn>직거래</dealingGbn><estateAgentSggNm> </estateAgentSggNm><excluUseAr>107.6</excluUseAr><floor>1</floor><jibun>615-1</jibun><landLeaseholdGbn>N</landLeaseholdGbn><rgstDate> </rgstDate><sggCd>11680</sggCd><slerGbn>개인</slerGbn><umdNm>일원동</umdNm></item></items><numOfRows>100</numOfRows><pageNo>1</pageNo><totalCount>127</totalCount></body></response>`;

const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '@_',
    textNodeName: '#text',
    parseAttributeValue: true,
});

const jsonData = parser.parse(xmlData);
const item = jsonData.response.body.items.item;

console.log('Parsed Item:', item);

function transform(item) {
    const dealAmountStr = String(item.dealAmount || item.거래금액 || '0').trim();
    const price = parseInt(dealAmountStr.replace(/,/g, ''));

    const area = parseFloat(String(item.excluUseAr || item.전용면적 || item.area || '0').trim());
    const buildingName = String(item.aptNm || item.아파트 || item.연립다세대 || item.buildingName || '').trim();

    return {
        buildingName,
        price,
        area,
        dealAmountStr
    };
}

const result = transform(item);
console.log('Transformed Result:', result);
