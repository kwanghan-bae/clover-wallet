package com.wallet.clover.adapter

import com.wallet.clover.domain.lotto.LoadLottoHistoryPort
import kotlinx.coroutines.reactor.awaitSingleOrNull
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service
import java.time.Duration
import java.time.LocalDate

@Service
class LoadLottoService(
    private val client: LottoHistoryWebClient,
    private val mapper: LottoHistoryMapper,
) : LoadLottoHistoryPort {
    private val logger = LoggerFactory.getLogger(javaClass)

    companion object {
        private val FIRST_DRAW_DATE = LocalDate.of(2002, 12, 7)
    }

    override suspend fun loadByGameNumber(gameNumber: Int): com.wallet.clover.domain.lotto.LottoHistory? {
        logger.info("Loading lotto history for game number: {}", gameNumber)
        val response = client.getByGameNumber(gameNumber).awaitSingleOrNull()
        return response?.let { mapper.toDomain(it) }
    }

    fun loadGameNumberByPurchaseDate(purchaseDate: LocalDate): Long {
        val duration = Duration.between(FIRST_DRAW_DATE.atStartOfDay(), purchaseDate.atStartOfDay()).toDays()
        return when {
            duration < 1 -> 1
            else -> (duration / 7) + 2
        }
    }
}
