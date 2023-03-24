package com.lotto.manager.internal.adapter

import com.lotto.manager.adapter.MLottoFeignClient
import com.lotto.manager.domain.ticket.incoming.SaveLottoTicketCommand
import com.lotto.manager.domain.ticket.incoming.SaveLottoTicketUseCase
import com.lotto.manager.domain.ticket.outgoing.SaveLottoTicketPort
import org.jsoup.Jsoup
import org.springframework.beans.factory.InitializingBean
import org.springframework.stereotype.Service
import java.io.File

@Service
class TicketService(
//    val saveLottoTicketPort: SaveLottoTicketPort
    val feignClient: MLottoFeignClient
) : SaveLottoTicketUseCase, InitializingBean {
    override fun save(command: SaveLottoTicketCommand) {
        TODO("Not yet implemented")
    }

    override fun afterPropertiesSet() {
//        val html = feignClient.check()
        val a = ""
        listOf("a").forEach {
            
        }
    }
}


//fun main(args: Array<String>) {
//    val html = File("/Users/joel/Documents/lotto_result.html")
//    val document = Jsoup.parse(html, "euc-kr")
//
//    val winnerDivision = document.getElementsByClass("bx_notice winner")
//
//    println(winnerDivision.dataNodes())
//    println("============================")
//    println(document.getElementsByClass("key_clr1").after("span").after("span"))
//    println("++++++++++++++++++++++++++++++")
//    println(println(winnerDivision.isEmpty()))
//    println(winnerDivision)
//}
