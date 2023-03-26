package com.lotto.manager.adapter

import com.lotto.manager.domain.game.LottoGame
import com.lotto.manager.domain.game.LottoGameStatus
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
                connection.execute().bodyAsBytes(), Charset.forName("euc-kr")
            )
        )
    }

   
}

// https://www.dhlottery.co.kr/common.do?method=getLottoNumber&drwNo=903
// https://m.dhlottery.co.kr/qr.do?method=winQr&v=1054q061011142332q041226293143q141623252628q172332343542q0508142427451553697995
