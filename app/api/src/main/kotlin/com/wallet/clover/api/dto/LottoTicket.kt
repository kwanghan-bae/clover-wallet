package com.wallet.clover.api.dto

import com.wallet.clover.api.entity.ticket.LottoTicketEntity
import java.time.LocalDateTime

abstract class LottoTicket {
    data class Response(
        /** 티켓 ID */
        val id: Long,
        
        /** 티켓 이미지 URL */
        val url: String,
        
        /** 회차 */
        val ordinal: Int,
        
        /** 티켓 상태 (발표전, 당첨, 낙첨) */
        val status: String,
        
        /** 생성 일시 */
        val createdAt: LocalDateTime
    ) {
        companion object {
            fun from(entity: LottoTicketEntity): Response {
                return Response(
                    id = entity.id!!,
                    url = entity.url,
                    ordinal = entity.ordinal,
                    status = entity.status.htmlValue,
                    createdAt = entity.createdAt
                )
            }
        }
    }

    data class DetailResponse(
        /** 티켓 정보 */
        val ticket: Response,
        /** 게임 목록 */
        val games: List<LottoGame.Response>
    )
}
