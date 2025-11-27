import type { VercelRequest, VercelResponse } from '@vercel/node';
import net from 'net';
import dns from 'dns';

export default async function handler(
    req: VercelRequest,
    res: VercelResponse,
) {
    const host = 'apis.data.go.kr';
    const port = 443;

    const results: any = {
        host,
        port,
        dns: null,
        tcp: null,
    };

    try {
        // 1. DNS Lookup
        const lookupStart = Date.now();
        const addresses = await new Promise<string[]>((resolve, reject) => {
            dns.resolve4(host, (err, addresses) => {
                if (err) reject(err);
                else resolve(addresses);
            });
        });
        results.dns = {
            success: true,
            duration: Date.now() - lookupStart,
            addresses,
        };

        // 2. TCP Connect
        if (addresses && addresses.length > 0) {
            const targetIp = addresses[0];
            const connectStart = Date.now();

            await new Promise<void>((resolve, reject) => {
                const socket = new net.Socket();

                socket.setTimeout(5000); // 5s timeout

                socket.on('connect', () => {
                    results.tcp = {
                        success: true,
                        duration: Date.now() - connectStart,
                        ip: targetIp,
                    };
                    socket.destroy();
                    resolve();
                });

                socket.on('timeout', () => {
                    results.tcp = {
                        success: false,
                        error: 'Timeout (5s)',
                        ip: targetIp,
                    };
                    socket.destroy();
                    resolve(); // Resolve anyway to return result
                });

                socket.on('error', (err) => {
                    results.tcp = {
                        success: false,
                        error: err.message,
                        ip: targetIp,
                    };
                    resolve(); // Resolve anyway
                });

                socket.connect(port, targetIp);
            });
        }

        res.status(200).json(results);

    } catch (error) {
        res.status(500).json({
            error: 'Debug failed',
            details: error instanceof Error ? error.message : String(error),
            partialResults: results,
        });
    }
}
