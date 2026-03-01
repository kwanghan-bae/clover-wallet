import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import axios from 'axios';
import * as cheerio from 'cheerio';
import * as iconv from 'iconv-lite';

@Injectable()
export class LottoWinningStoreService {
    private readonly logger = new Logger(LottoWinningStoreService.name);
    // Common URL for top stores.
    private readonly winningStoreUrl = "https://www.dhlottery.co.kr/store.do?method=topStore&drwNo=";

    constructor(private readonly prisma: PrismaService) { }

    async crawlWinningStores(round: number): Promise<{ count: number, message: string }> {
        const existing = await this.prisma.lottoWinningStore.findFirst({
            where: { round },
        });

        if (existing) {
            this.logger.log(`${round} 회차 당첨 판매점 데이터가 이미 존재합니다. 건너뜁니다.`);
            return { count: 0, message: 'Already exists' };
        }

        this.logger.log(`${round} 회차 판매점 크롤링 시작`);

        try {
            const url = `${this.winningStoreUrl}${round}`;
            const response = await axios.get(url, { responseType: 'arraybuffer' });
            const decodedData = iconv.decode(Buffer.from(response.data), 'EUC-KR');
            this.logger.log(`Fetched HTML content length: ${decodedData.length}`);
            const $ = cheerio.load(decodedData);

            const tableClasses: string[] = [];
            $('table').each((i, el) => {
                tableClasses.push($(el).attr('class') || 'no-class');
            });
            this.logger.log(`Found tables with classes: ${tableClasses.join(', ')}`);

            const storesToSave: any[] = [];

            // Rank 1 Stores
            const tables = $('table.tbl_data');

            // Table 1: 1st Place
            if (tables.length >= 1) {
                const rank1Rows = $(tables[0]).find('tbody tr');
                rank1Rows.each((_, element) => {
                    const tds = $(element).find('td');
                    if (tds.length >= 4 && !$(tds[0]).text().includes('조회 결과가 없습니다')) {
                        const storeName = $(tds[1]).text().trim();
                        const method = $(tds[2]).text().trim();
                        const address = $(tds[3]).text().trim();

                        storesToSave.push({
                            round,
                            rank: 1,
                            storeName,
                            address,
                            method,
                        });
                    }
                });
            }

            // Table 2: 2nd Place
            if (tables.length >= 2) {
                const rank2Rows = $(tables[1]).find('tbody tr');
                rank2Rows.each((_, element) => {
                    const tds = $(element).find('td');
                    if (tds.length >= 3 && !$(tds[0]).text().includes('조회 결과가 없습니다')) {
                        const storeName = $(tds[1]).text().trim();
                        const address = $(tds[2]).text().trim();

                        storesToSave.push({
                            round,
                            rank: 2,
                            storeName,
                            address,
                            method: null,
                        });
                    }
                });
            }

            if (storesToSave.length > 0) {
                await this.prisma.$transaction(
                    storesToSave.map(store =>
                        this.prisma.lottoWinningStore.create({
                            data: {
                                ...store,
                                createdAt: new Date()
                            }
                        })
                    )
                );
                this.logger.log(`${round} 회차 당첨 판매점 ${storesToSave.length}개 저장 성공`);
            } else {
                this.logger.warn(`${round} 회차 당첨 판매점을 찾을 수 없습니다`);
                return { count: 0, message: `No stores found. Content Length: ${decodedData.length}. Classes: ${tableClasses.join(', ')}` };
            }

            return { count: storesToSave.length, message: 'Saved' };

        } catch (error) {
            this.logger.error(`${round} 회차 당첨 판매점 크롤링 실패`, error);
            throw error;
        }
    }

    async getWinningStores(round: number) {
        return this.prisma.lottoWinningStore.findMany({
            where: { round },
            orderBy: { rank: 'asc' },
        });
    }

    async getWinningHistoryByName(storeName: string) {
        return this.prisma.lottoWinningStore.findMany({
            where: { storeName },
            orderBy: { round: 'desc' },
        });
    }
}
