package com.wallet.clover.adapter

import com.wallet.clover.domain.lotto.outgoing.LoadLottoHistoryPort
import org.springframework.stereotype.Service
import java.time.Duration
import java.time.LocalDate

@Service
class LoadLottoService(
    val client: LottoHistoryFeignClient,
) : LoadLottoHistoryPort {
    companion object {
        private val FIRST_DRAW_DATE = LocalDate.of(2002, 12, 7)
    }

    override fun loadByDrawDate(drawDate: LocalDate): com.wallet.clover.domain.lotto.LottoHistory? {
        val response = client.getByGameNumber(10)
        println(drawDate)
        return if (response.returnValue == LottoResponseCode.OK) {
            response.toDomain()
        } else {
            println(response)
            null
        }
    }

    fun loadGameNumberByPurchaseDate(purchaseDate: LocalDate): Long {
        val duration = Duration.between(FIRST_DRAW_DATE.atStartOfDay(), purchaseDate.atStartOfDay()).toDays()
        return when {
            duration < 1 -> 1
            else -> (duration / 7) + 2
        }
    }
}
