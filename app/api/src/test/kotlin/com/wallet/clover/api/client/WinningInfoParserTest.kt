package com.wallet.clover.api.client

import com.wallet.clover.api.config.LottoScrapingProperties
import io.kotest.assertions.throwables.shouldThrow
import io.kotest.core.spec.style.ShouldSpec
import io.kotest.matchers.shouldBe
import java.time.LocalDate

class WinningInfoParserTest : ShouldSpec({
    val properties = LottoScrapingProperties()
    val parser = WinningInfoParser(properties)

    context("parse") {
        should("parse valid HTML correctly") {
            val html = """
                <html>
                <body>
                    <p class="desc">(2023년 11월 11일 추첨)</p>
                    <div class="num win">
                        <span>1</span><span>2</span><span>3</span><span>4</span><span>5</span><span>6</span>
                    </div>
                    <div class="num bonus">
                        <span>7</span>
                    </div>
                    <table class="tbl_data">
                        <tbody>
                            <tr><td>1등</td><td>...</td><td>...</td><td>1,000,000,000원</td></tr>
                            <tr><td>2등</td><td>...</td><td>...</td><td>50,000,000원</td></tr>
                            <tr><td>3등</td><td>...</td><td>...</td><td>1,500,000원</td></tr>
                            <tr><td>4등</td><td>...</td><td>...</td><td>50,000원</td></tr>
                            <tr><td>5등</td><td>...</td><td>...</td><td>5,000원</td></tr>
                        </tbody>
                    </table>
                </body>
                </html>
            """

            val result = parser.parse(html)

            result.drawDate shouldBe LocalDate.of(2023, 11, 11)
            result.numbers shouldBe listOf(1, 2, 3, 4, 5, 6)
            result.bonusNumber shouldBe 7
            result.firstPrize shouldBe 1000000000L
            result.secondPrize shouldBe 50000000L
            result.thirdPrize shouldBe 1500000L
            result.fourthPrize shouldBe 50000L
            result.fifthPrize shouldBe 5000L
        }

        should("throw exception for invalid HTML") {
            val html = "<html><body>Invalid</body></html>"
            shouldThrow<Exception> {
                parser.parse(html)
            }
        }
    }
})
