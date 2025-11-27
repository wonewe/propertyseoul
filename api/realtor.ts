import type { VercelRequest, VercelResponse } from '@vercel/node';

// Vercel Serverless Function에서 HTTP 클라이언트 사용
// Node.js 18+ 에서는 fetch가 기본 제공되지만, 안정성을 위해 https 모듈 사용
import https from 'https';
import http from 'http';

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
        }
      });
      return;
    }

    // HTTP API URL 생성 (새로운 엔드포인트 apis.data.go.kr 사용)
    // 참고: https://apis.data.go.kr/1613000/RTMSDataSvcAptTrade/getRTMSDataSvcAptTrade
    const apiUrl = `https://apis.data.go.kr/1613000/RTMSDataSvcAptTrade/getRTMSDataSvcAptTrade`;
    const params = new URLSearchParams({
      serviceKey: String(serviceKey),
      LAWD_CD: String(LAWD_CD),
      DEAL_YMD: String(DEAL_YMD),
      numOfRows: String(numOfRows || '100'),
      pageNo: String(pageNo || '1'),
    });

    const fullUrl = `${apiUrl}?${params.toString()}`;

    // Node.js http/https 모듈을 사용하여 요청 (재시도 로직 포함)
    const MAX_RETRIES = 3;
    const TIMEOUT_MS = 60000; // 60초

    const fetchWithRetry = async (attempt = 1): Promise<void> => {
      return new Promise((resolve) => {
        // HTTPS 모듈 사용 (apis.data.go.kr은 HTTPS 지원)
        const request = https.get(fullUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7'
          }
        }, (response) => {
          let xmlData = '';

          response.on('data', (chunk) => {
            xmlData += chunk.toString();
          });

          response.on('end', () => {
            if (response.statusCode !== 200) {
              // 5xx 에러이거나 일시적인 문제일 수 있으므로 재시도 고려
              if (attempt < MAX_RETRIES && (response.statusCode === 500 || response.statusCode === 502 || response.statusCode === 503 || response.statusCode === 504)) {
                console.log(`Attempt ${attempt} failed with status ${response.statusCode}. Retrying...`);
                request.destroy();
                setTimeout(() => {
                  resolve(fetchWithRetry(attempt + 1));
                }, 1000 * attempt); // Exponential backoff-ish (1s, 2s, 3s...)
                return;
              }

              res.status(response.statusCode || 500).json({
                error: 'API request failed',
                status: response.statusCode,
                statusText: response.statusMessage,
              });
              resolve(undefined);
              return;
            }

            if (!xmlData || xmlData.trim().length === 0) {
              res.status(500).json({
                error: 'Empty response from API',
              });
              resolve(undefined);
              return;
            }

            // XML을 그대로 반환
            res.setHeader('Content-Type', 'application/xml; charset=utf-8');
            res.status(200).send(xmlData);
            resolve(undefined);
          });
        });

        request.on('error', (error) => {
          console.error(`HTTP request error (Attempt ${attempt}):`, error);

          if (attempt < MAX_RETRIES) {
            console.log(`Retrying after error...`);
            setTimeout(() => {
              resolve(fetchWithRetry(attempt + 1));
            }, 1000 * attempt);
            return;
          }

          res.status(500).json({
            error: 'Proxy failed',
            message: error.message,
          });
          resolve(undefined);
        });

        request.setTimeout(TIMEOUT_MS, () => {
          request.destroy();

          if (attempt < MAX_RETRIES) {
            console.log(`Request timed out (Attempt ${attempt}). Retrying...`);
            setTimeout(() => {
              resolve(fetchWithRetry(attempt + 1));
            }, 1000 * attempt);
            return;
          }

          res.status(504).json({
            error: 'Request timeout',
            message: 'API request took too long after multiple attempts',
          });
          resolve(undefined);
        });
      });
    };

    return fetchWithRetry();
  } catch (error) {
    console.error('Realtor API proxy error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    res.status(500).json({
      error: 'Proxy failed',
      message: errorMessage,
    });
  }
}
