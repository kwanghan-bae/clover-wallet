package com.wallet.clover.api.client

import com.wallet.clover.api.common.retry
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import org.jsoup.Connection
import org.jsoup.Jsoup
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Component
import java.nio.charset.Charset

@Component
class LottoTicketClient {
    private val logger = LoggerFactory.getLogger(javaClass)

    companion object {
        private const val TIMEOUT_MS = 5000
    }

    suspend fun getHtmlByUrl(url: String): String = withContext(Dispatchers.IO) {
        retry {
            logger.info("URL에서 문서 가져오기: {}", url)
            val connection = Jsoup.connect(url)
                .timeout(TIMEOUT_MS)
                .method(Connection.Method.GET)
            val html = String(
                connection.execute().bodyAsBytes(),
                Charset.forName("euc-kr"),
            )
            logger.info("URL에서 문서 가져오기 및 파싱 성공: {}", url)
            html
        }
    }
}
