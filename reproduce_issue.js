import http from 'http';

const serviceKey = '4226375dcf4f11a502ca111a5b13a11f69d3339161644937c093a4703b4dfde1';
const LAWD_CD = '11680';
const DEAL_YMD = '202511';
const numOfRows = '100';
const pageNo = '1';

// Updated to use new endpoint apis.data.go.kr
const apiUrl = `https://apis.data.go.kr/1613000/RTMSDataSvcAptTrade/getRTMSDataSvcAptTrade`;

const fullUrl = `${apiUrl}?serviceKey=${serviceKey}&LAWD_CD=${LAWD_CD}&DEAL_YMD=${DEAL_YMD}&numOfRows=${numOfRows}&pageNo=${pageNo}`;

console.log(`Testing URL: ${fullUrl}`);

const start = Date.now();

const req = http.get(fullUrl, (res) => {
    let data = '';
    res.on('data', (chunk) => data += chunk);
    res.on('end', () => {
        const duration = Date.now() - start;
        console.log(`Status: ${res.statusCode}`);
        console.log(`Duration: ${duration}ms`);
        console.log(`Data length: ${data.length}`);

        // Simple XML tag extraction to see field names
        const matches = data.match(/<([^>]+)>([^<]+)<\/\1>/g);
        if (matches && matches.length > 0) {
            console.log('First 10 fields found:');
            matches.slice(0, 10).forEach(m => console.log(m));
        } else {
            console.log('Data preview:', data.substring(0, 500));
        }
    });
});

req.on('error', (e) => {
    console.error(`Problem with request: ${e.message}`);
});

req.setTimeout(60000, () => {
    console.error('Request timed out after 60s');
    req.destroy();
});
