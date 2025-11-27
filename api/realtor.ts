import type { VercelRequest, VercelResponse } from '@vercel/node';
import { XMLParser } from 'fast-xml-parser';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
) {
  // CORS 설정
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const { serviceKey, LAWD_CD, DEAL_YMD, numOfRows, pageNo } = req.query;

    if (!serviceKey || !LAWD_CD || !DEAL_YMD) {
      res.status(400).json({ error: 'Missing required parameters' });
      return;
    }

    // HTTP API를 서버에서 호출 (Mixed Content 문제 해결)
    const apiUrl = `http://openapi.molit.go.kr/OpenAPI_ToolInstallPackage/service/rest/RTMSOBJSvc/getRTMSDataSvcAptTradeDev`;
    const params = new URLSearchParams({
      serviceKey: serviceKey as string,
      LAWD_CD: LAWD_CD as string,
      DEAL_YMD: DEAL_YMD as string,
      numOfRows: (numOfRows as string) || '100',
      pageNo: (pageNo as string) || '1',
    });

    const response = await fetch(`${apiUrl}?${params.toString()}`);
    const xmlData = await response.text();

    // XML을 JSON으로 변환
    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: '@_',
      textNodeName: '#text',
      parseAttributeValue: true,
    });
    
    const jsonData = parser.parse(xmlData);

    // JSON으로 반환
    res.setHeader('Content-Type', 'application/json');
    res.status(200).json(jsonData);
  } catch (error) {
    console.error('Realtor API proxy error:', error);
    res.status(500).json({
      error: 'Proxy failed',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
