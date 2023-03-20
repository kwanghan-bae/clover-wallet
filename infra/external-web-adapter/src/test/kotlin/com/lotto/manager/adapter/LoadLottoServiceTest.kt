package com.lotto.manager.adapter

import com.lotto.manager.adapter.LoadLottoService
import com.lotto.manager.adapter.LottoFeignClient
import io.kotest.core.spec.style.ShouldSpec
import io.kotest.matchers.shouldBe
import io.mockk.mockk

import java.time.LocalDate

class LoadLottoServiceTest : ShouldSpec({
    val client = mockk<LottoFeignClient>()
    val sut = LoadLottoService(client)
    
    context("날짜로 로또 게임회차를 추정할때") {
        context("2023-03-17 일 경우") {
            should("1059 를 리턴한다.") {
                val number = sut.loadGameNumberByPurchaseDate(LocalDate.of(2023, 3, 17))
                number shouldBe 1059
            }
        }
        context("2016-07-29 일 경우") {
            should("713 를 리턴한다.") {
                val number = sut.loadGameNumberByPurchaseDate(LocalDate.of(2016, 7, 29))
                number shouldBe 713
            }
        }

        context("2016-08-01 일 경우") {
            should("714 를 리턴한다.") {
                val number = sut.loadGameNumberByPurchaseDate(LocalDate.of(2016, 8, 1))
                number shouldBe 714
            }
        }

        context("일자가 로또가 첫추첨후의 다음주 라면") {
            should("2을 리턴한다.") {
                val firstDrawDate = LocalDate.of(2002, 12, 7)
                val sunday = firstDrawDate.plusDays(1)
                val number = sut.loadGameNumberByPurchaseDate(sunday)
                number shouldBe 2
            }
        }
    }
}) 