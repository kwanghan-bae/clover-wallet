package com.wallet.clover.api.service

import com.wallet.clover.api.client.LottoTicketClient
import com.wallet.clover.api.client.TicketParser
import com.wallet.clover.api.dto.SaveScannedTicket
import com.wallet.clover.api.entity.game.LottoGameEntity
import com.wallet.clover.api.entity.ticket.LottoTicketEntity
import com.wallet.clover.api.repository.game.LottoGameRepository
import com.wallet.clover.api.repository.ticket.LottoTicketRepository
import com.wallet.clover.api.common.PageResponse
import io.micrometer.core.instrument.MeterRegistry
import kotlinx.coroutines.flow.toList
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import org.springframework.data.domain.PageRequest
import org.springframework.data.domain.Sort

@Service
class TicketService(
    private val ticketRepository: LottoTicketRepository,
    private val gameRepository: LottoGameRepository,
    private val lottoTicketClient: LottoTicketClient,
    private val ticketParser: TicketParser,
    private val meterRegistry: MeterRegistry
) {
    suspend fun getMyTickets(userId: Long, page: Int = 0, size: Int = 20): PageResponse<LottoTicketEntity> {
        val pageable = PageRequest.of(page, size, Sort.by("createdAt").descending())
        val content = ticketRepository.findByUserId(userId, pageable).toList()
        val total = ticketRepository.countByUserId(userId)
        return PageResponse.of(content, page, size, total)
    }

    suspend fun getTicketById(ticketId: Long): LottoTicketEntity? {
        return ticketRepository.findById(ticketId)
    }

    suspend fun getGamesByTicketId(ticketId: Long): List<LottoGameEntity> {
        return gameRepository.findByTicketId(ticketId).toList()
    }

    @Transactional
    suspend fun saveScannedTicket(command: SaveScannedTicket.Command): LottoTicketEntity {
        val existingTicket = ticketRepository.findByUrl(command.url)
        if (existingTicket != null) {
            meterRegistry.counter("lotto.ticket.scan", "result", "duplicate").increment()
            return existingTicket
        }

        return try {
            val html = lottoTicketClient.getHtmlByUrl(command.url)
            val parsedTicket = ticketParser.parse(html)

            val savedTicket = ticketRepository.save(
                LottoTicketEntity(
                    userId = command.userId,
                    url = command.url,
                    ordinal = parsedTicket.ordinal,
                    status = parsedTicket.status,
                )
            )

            val games = parsedTicket.games.map {
                LottoGameEntity(
                    ticketId = savedTicket.id!!,
                    userId = command.userId,
                    status = it.status,
                    number1 = it.number1,
                    number2 = it.number2,
                    number3 = it.number3,
                    number4 = it.number4,
                    number5 = it.number5,
                    number6 = it.number6,
                    extractionMethod = command.extractionMethod,  // QR 스캔 시 선택한 추출 방식
                )
            }
            gameRepository.saveAll(games).toList() // Collect the flow to execute saves

            meterRegistry.counter("lotto.ticket.scan", "result", "success").increment()
            savedTicket
        } catch (e: Exception) {
            meterRegistry.counter("lotto.ticket.scan", "result", "failure").increment()
            // 파싱 에러 등 비즈니스 로직 에러는 그대로 던져서 GlobalExceptionHandler에서 처리하도록 함
            throw e
        }
    }
}
