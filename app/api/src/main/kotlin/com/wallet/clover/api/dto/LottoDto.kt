package com.wallet.clover.api.dto

import com.wallet.clover.api.domain.extraction.ExtractionMethod
import com.wallet.clover.api.entity.game.LottoGameEntity
import com.wallet.clover.api.entity.game.LottoGameStatus
import com.wallet.clover.api.entity.ticket.LottoTicketEntity
import java.time.LocalDateTime

abstract class LottoGame {
    data class Request(
        /** 티켓 ID */
        val ticketId: Long,
        /** 사용자 ID */
        val userId: Long,
        /** 게임 상태 */
        val status: LottoGameStatus,
        /** 번호 1 */
        val number1: Int,
        /** 번호 2 */
        val number2: Int,
        /** 번호 3 */
        val number3: Int,
        /** 번호 4 */
        val number4: Int,
        /** 번호 5 */
        val number5: Int,
        /** 번호 6 */
        val number6: Int,
        /** 추출 방법 */
        val extractionMethod: ExtractionMethod? = null
    ) {
        fun toEntity(): LottoGameEntity {
            return LottoGameEntity(
                ticketId = ticketId,
                userId = userId,
                status = status,
                number1 = number1,
                number2 = number2,
                number3 = number3,
                number4 = number4,
                number5 = number5,
                number6 = number6,
                extractionMethod = extractionMethod
            )
        }
    }

    data class Response(
        /** 게임 ID */
        val id: Long,
        
        /** 게임 상태 (WINNING_1 등) */
        val status: LottoGameStatus,
        
        /** 번호 1 */
        val number1: Int,
        /** 번호 2 */
        val number2: Int,
        /** 번호 3 */
        val number3: Int,
        /** 번호 4 */
        val number4: Int,
        /** 번호 5 */
        val number5: Int,
        /** 번호 6 */
        val number6: Int,
        
        /** 생성 일시 */
        val createdAt: LocalDateTime
    ) {
        companion object {
            fun from(entity: LottoGameEntity): Response {
                return Response(
                    id = entity.id!!,
                    status = entity.status,
                    number1 = entity.number1,
                    number2 = entity.number2,
                    number3 = entity.number3,
                    number4 = entity.number4,
                    number5 = entity.number5,
                    number6 = entity.number6,
                    createdAt = entity.createdAt ?: LocalDateTime.now()
                )
            }
        }
    }
}

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

abstract class SaveScannedTicket {
    data class Command(
        /** 사용자 ID */
        val userId: Long,
        /** 티켓 이미지 URL */
        val url: String,
        /** 추출 방법 */
        val extractionMethod: ExtractionMethod? = null
    )
}
