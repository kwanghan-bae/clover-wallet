package com.wallet.clover.api.service

import com.wallet.clover.api.config.LottoScrapingProperties
import com.wallet.clover.api.entity.lottospot.LottoWinningStoreEntity
import com.wallet.clover.api.repository.lottospot.LottoWinningStoreRepository
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import org.jsoup.Jsoup
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDateTime

@Service
class LottoWinningStoreCrawler(
    private val repository: LottoWinningStoreRepository,
    private val scrapingProperties: LottoScrapingProperties,
    @Value("\${external-api.dhlottery.winning-store-url}") private val winningStoreUrl: String
) {
    private val logger = LoggerFactory.getLogger(LottoWinningStoreCrawler::class.java)

    @Transactional
    suspend fun crawlWinningStores(round: Int) {
        if (repository.existsByRound(round)) {
            logger.info("Winning stores for round $round already exist. Skipping.")
            return
        }

        logger.info("Starting crawling for round $round")
        
        try {
            val stores = withContext(Dispatchers.IO) {
                val url = "$winningStoreUrl$round"
                val doc = Jsoup.connect(url).get()
                val entities = mutableListOf<LottoWinningStoreEntity>()

                // 1등 배출점
                val rank1Table = doc.select(scrapingProperties.winningStoreTableSelector).first()
                rank1Table?.select("tbody tr")?.forEach { tr ->
                    val tds = tr.select("td")
                    if (tds.size >= 4 && tds[0].text().contains(scrapingProperties.winningStoreEmptyMessage).not()) {
                        val storeName = tds[1].text().trim()
                        val method = tds[2].text().trim()
                        val address = tds[3].text().trim()
                        
                        entities.add(
                            LottoWinningStoreEntity(
                                round = round,
                                rank = 1,
                                storeName = storeName,
                                address = address,
                                method = method,
                                createdAt = LocalDateTime.now()
                            )
                        )
                    }
                }

                // 2등 배출점 (보통 두 번째 테이블)
                val tables = doc.select(scrapingProperties.winningStoreTableSelector)
                if (tables.size >= 2) {
                    val rank2Table = tables[1]
                    rank2Table.select("tbody tr").forEach { tr ->
                        val tds = tr.select("td")
                        if (tds.size >= 3 && tds[0].text().contains(scrapingProperties.winningStoreEmptyMessage).not()) {
                            val storeName = tds[1].text().trim()
                            val address = tds[2].text().trim()
                            
                            entities.add(
                                LottoWinningStoreEntity(
                                    round = round,
                                    rank = 2,
                                    storeName = storeName,
                                    address = address,
                                    method = null,
                                    createdAt = LocalDateTime.now()
                                )
                            )
                        }
                    }
                }
                
                entities
            }

            if (stores.isNotEmpty()) {
                repository.saveAll(stores).collect {
                    // logger.debug("Saved store: ${it.storeName}")
                }
                logger.info("Successfully saved ${stores.size} winning stores for round $round")
            } else {
                logger.warn("No winning stores found for round $round")
            }

        } catch (e: Exception) {
            logger.error("Failed to crawl winning stores for round $round", e)
            throw e
        }
    }
}
