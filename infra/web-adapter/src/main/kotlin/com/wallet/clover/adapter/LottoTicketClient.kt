package com.wallet.clover.adapter

import org.jsoup.Connection
import org.jsoup.Jsoup
import org.jsoup.nodes.Document
import org.springframework.stereotype.Service
import java.nio.charset.Charset

@Service
class LottoTicketClient {
    fun getDocumentByUrl(url: String): Document {
        val connection = Jsoup.connect(url)
            .method(Connection.Method.GET)
        return Jsoup.parse(
            String(
                connection.execute().bodyAsBytes(),
                Charset.forName("euc-kr"),
            ),
        )
    }
}
