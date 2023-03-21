package com.lotto.manager.adapter

import com.lotto.manager.domain.lotto.Lotto
import com.lotto.manager.domain.lotto.outgoing.LoadLottoPort
import org.springframework.stereotype.Service
import java.time.Duration
import java.time.LocalDate

@Service
class LoadLottoService(
    val client: LottoFeignClient
) : LoadLottoPort {
    companion object {
        private val FIRST_DRAW_DATE = LocalDate.of(2002, 12, 7)
    }

    override fun loadByDrawDate(drawDate: LocalDate): Lotto? {
        val response = client.getByGameNumber(10)
        println(drawDate)
        return if (response.returnValue == LottoResponseCode.OK) {
            response.toDomain()
        } else {
            println(response)
            null
        }
    }

    override fun loadGameNumberByPurchaseDate(purchaseDate: LocalDate): Long {
        val duration = Duration.between(FIRST_DRAW_DATE.atStartOfDay(), purchaseDate.atStartOfDay()).toDays()
        return when {
            duration < 1 -> 1
            else -> (duration / 7) + 2
        }
    }
}
