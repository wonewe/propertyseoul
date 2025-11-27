import type { VercelRequest, VercelResponse } from '@vercel/node';

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

    // 파라미터 검증
    if (!serviceKey || !LAWD_CD || !DEAL_YMD) {
      res.status(400).json({ 
        error: 'Missing required parameters',
        received: { 
          hasServiceKey: !!serviceKey, 
          hasLAWD_CD: !!LAWD_CD, 
          hasDEAL_YMD: !!DEAL_YMD 
        },
        query: req.query
      });
      return;
    }

    // HTTP API를 서버에서 호출 (Mixed Content 문제 해결)
    const apiUrl = `http://openapi.molit.go.kr/OpenAPI_ToolInstallPackage/service/rest/RTMSOBJSvc/getRTMSDataSvcAptTradeDev`;
    const params = new URLSearchParams({
      serviceKey: String(serviceKey),
      LAWD_CD: String(LAWD_CD),
      DEAL_YMD: String(DEAL_YMD),
      numOfRows: String(numOfRows || '100'),
      pageNo: String(pageNo || '1'),
    });

    const fullUrl = `${apiUrl}?${params.toString()}`;
    
    console.log('Fetching from:', apiUrl);
    console.log('Params:', { LAWD_CD, DEAL_YMD, numOfRows, pageNo });
    
    const response = await fetch(fullUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/xml, text/xml, */*',
      },
    });
    
    console.log('Response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      res.status(response.status).json({
        error: 'API request failed',
        status: response.status,
        statusText: response.statusText,
        body: errorText.substring(0, 500),
      });
      return;
    }

    const xmlData = await response.text();
    
    if (!xmlData || xmlData.trim().length === 0) {
      res.status(500).json({
        error: 'Empty response from API',
      });
      return;
    }

    // XML을 그대로 반환 (클라이언트에서 파싱)
    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.status(200).send(xmlData);
  } catch (error) {
    console.error('Realtor API proxy error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : undefined;
    
    res.status(500).json({
      error: 'Proxy failed',
      message: errorMessage,
      details: error instanceof Error ? {
        name: error.name,
        stack: errorStack,
      } : undefined,
    });
  }
}
