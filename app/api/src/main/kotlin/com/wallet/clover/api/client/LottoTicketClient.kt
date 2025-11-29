package com.wallet.clover.api.client

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

    suspend fun getHtmlByUrl(url: String): String = withContext(Dispatchers.IO) {
        logger.info("Fetching document from URL: {}", url)
        val connection = Jsoup.connect(url)
            .method(Connection.Method.GET)
        val html = String(
            connection.execute().bodyAsBytes(),
            Charset.forName("euc-kr"),
        )
        logger.info("Successfully fetched and parsed document from URL: {}", url)
        html
    }
}
