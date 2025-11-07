package com.lotto.manager.adapter

import com.wallet.clover.adapter.LoadLottoService
import com.wallet.clover.adapter.LottoHistoryMapper
import com.wallet.clover.adapter.LottoHistoryWebClient
import com.wallet.clover.adapter.LottoResponse
import com.wallet.clover.adapter.LottoResponseCode
import com.wallet.clover.domain.lotto.LottoHistory
import io.kotest.core.spec.style.ShouldSpec
import io.kotest.matchers.shouldBe
import io.mockk.coEvery
import io.mockk.mockk
import reactor.core.publisher.Mono
import java.time.LocalDate

class LoadLottoServiceTest : ShouldSpec(
    {
        val client = mockk<LottoHistoryWebClient>()
        val mapper = mockk<LottoHistoryMapper>()
        val sut = LoadLottoService(client, mapper)

        context("loadByGameNumber") {
            should("return LottoHistory when client and mapper work correctly") {
                // given
                val gameNumber = 1
                val lottoResponse = LottoResponse(
                    returnValue = LottoResponseCode.OK,
                    drwNo = 1,
                    drwNoDate = LocalDate.now(),
                    totSellamnt = 1000,
                    firstAccumamnt = 1000,
                    firstWinamnt = 1000,
                    firstPrzwnerCo = 1,
                    drwtNo1 = 1,
                    drwtNo2 = 2,
                    drwtNo3 = 3,
                    drwtNo4 = 4,
                    drwtNo5 = 5,
                    drwtNo6 = 6,
                    bnusNo = 7,
                )
                val lottoHistory = mockk<LottoHistory>()
                coEvery { client.getByGameNumber(gameNumber) } returns Mono.just(lottoResponse)
                coEvery { mapper.toDomain(lottoResponse) } returns lottoHistory

                // when
                val result = sut.loadByGameNumber(gameNumber)

                // then
                result shouldBe lottoHistory
            }

            should("return null when client returns empty") {
                // given
                val gameNumber = 1
                coEvery { client.getByGameNumber(gameNumber) } returns Mono.empty()

                // when
                val result = sut.loadByGameNumber(gameNumber)

                // then
                result shouldBe null
            }
        }

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
    },
)
