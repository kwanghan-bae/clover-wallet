package com.wallet.clover.api.service

import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.asFlow
import kotlinx.coroutines.flow.collect
import kotlinx.coroutines.flow.filter
import kotlinx.coroutines.flow.map
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service
import java.time.LocalDate
import java.time.temporal.ChronoUnit

@Service
class DataInitializationService(
    private val winningInfoCrawler: WinningInfoCrawler,
    private val lottoWinningStoreCrawler: LottoWinningStoreCrawler,
    private val winningInfoRepository: com.wallet.clover.api.repository.winning.WinningInfoRepository,
    private val lottoWinningStoreRepository: com.wallet.clover.api.repository.lottospot.LottoWinningStoreRepository
) {
    private val logger = LoggerFactory.getLogger(DataInitializationService::class.java)

    // Lotto started on 2002-12-07 (Round 1)
    private val startDate = LocalDate.of(2002, 12, 7)

    suspend fun initializeWinningInfo(start: Int = 1, end: Int? = null) {
        val currentRound = calculateCurrentRound()
        val targetEnd = end ?: currentRound

        logger.info("Starting Winning Info Initialization from $start to $targetEnd")
        
        // 1. Fetch all existing rounds in bulk (DB Check First)
        val existingRounds = mutableSetOf<Int>()
        winningInfoRepository.findAllRounds().collect { existingRounds.add(it) }
        
        logger.info("Found ${existingRounds.size} existing rounds")

        // 2. Filter missing rounds
        (start..targetEnd).asFlow()
            .filter { !existingRounds.contains(it) } // Skip existing
            .collect { round ->
                try {
                    // API Call
                    winningInfoCrawler.crawlWinningInfo(round)
                    // Gentle delay to avoid being banned
                    delay(50) 
                } catch (e: Exception) {
                    logger.error("Failed to init round $round", e)
                }
            }
        logger.info("Winning Info Initialization Completed")
    }

    suspend fun initializeWinningStores(start: Int = 1, end: Int? = null) {
        val currentRound = calculateCurrentRound()
        val targetEnd = end ?: currentRound

        logger.info("Starting Winning Store Initialization from $start to $targetEnd")

        // 1. Fetch all existing rounds (Bulk DB Check)
        val existingRounds = mutableSetOf<Int>()
        lottoWinningStoreRepository.findAllRounds().collect { existingRounds.add(it) }
        
        logger.info("Found ${existingRounds.size} existing store rounds")

        // 2. Filter missing rounds
        (start..targetEnd).asFlow()
            .filter { !existingRounds.contains(it) }
            .collect { round ->
                try {
                    lottoWinningStoreCrawler.crawlWinningStores(round)
                    delay(200) // Parsing HTML is heavier, more delay
                } catch (e: Exception) {
                    logger.error("Failed to init stores for round $round", e)
                }
            }
        logger.info("Winning Store Initialization Completed")
    }

    private fun calculateCurrentRound(): Int {
        val today = LocalDate.now()
        val weeks = ChronoUnit.WEEKS.between(startDate, today)
        return (weeks + 1).toInt()
    }
}
