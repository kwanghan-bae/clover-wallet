package com.wallet.clover.adapter

import org.jsoup.Connection
import org.jsoup.Jsoup
import org.jsoup.nodes.Document
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service
import java.nio.charset.Charset

@Service
class LottoTicketClient {
    private val logger = LoggerFactory.getLogger(javaClass)

    fun getDocumentByUrl(url: String): Document {
        logger.info("Fetching document from URL: {}", url)
        val connection = Jsoup.connect(url)
            .method(Connection.Method.GET)
        val document = Jsoup.parse(
            String(
                connection.execute().bodyAsBytes(),
                Charset.forName("euc-kr"),
            ),
        )
        logger.info("Successfully fetched and parsed document from URL: {}", url)
        return document
    }
}
