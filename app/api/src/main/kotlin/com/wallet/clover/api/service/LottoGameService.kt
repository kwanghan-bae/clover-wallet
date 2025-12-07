package com.wallet.clover.api.service

import com.wallet.clover.api.common.PageResponse
import com.wallet.clover.api.dto.LottoGame
import com.wallet.clover.api.entity.ticket.LottoTicketEntity
import com.wallet.clover.api.entity.ticket.LottoTicketStatus
import com.wallet.clover.api.entity.game.LottoGameStatus
import com.wallet.clover.api.repository.ticket.LottoTicketRepository
import com.wallet.clover.api.entity.game.LottoGameEntity
import com.wallet.clover.api.repository.game.LottoGameRepository
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.toList
import org.springframework.data.domain.PageRequest
import org.springframework.data.domain.Sort
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service

@Service
class LottoGameService(
    private val gameRepository: LottoGameRepository,
    private val ticketRepository: com.wallet.clover.api.repository.ticket.LottoTicketRepository,
    private val badgeService: BadgeService
) {
    private val logger = LoggerFactory.getLogger(javaClass)
    suspend fun getGamesByUserId(userId: Long, page: Int = 0, size: Int = 20): PageResponse<LottoGameEntity> {
        val pageable = PageRequest.of(page, size, Sort.by("createdAt").descending())
        val content = gameRepository.findByUserId(userId, pageable).toList()
        val total = gameRepository.countByUserId(userId)
        return PageResponse.of(content, page, size, total)
    }

    suspend fun saveGame(game: LottoGameEntity): LottoGameEntity {
        val savedGame = gameRepository.save(game)
        
        // 게임 저장 후 뱃지 업데이트
        try {
            badgeService.updateUserBadges(game.userId)
        } catch (e: Exception) {
            // 에러 로그를 남기지만 저장 작업은 실패시키지 않음
            logger.error("사용자 ${game.userId}의 뱃지 업데이트 실패", e)
        }
        
        return savedGame
    }

    suspend fun saveGeneratedGame(request: LottoGame.SaveRequest): LottoGameEntity {
        // 생성된 번호를 위한 "가상 티켓" 생성
        // 실제 시나리오에서는 특정 회차나 날짜에 연결할 수 있습니다.
        // 현재는 플레이스홀더 티켓을 생성합니다.
        val ticket = ticketRepository.save(
            LottoTicketEntity(
                userId = request.userId,
                ordinal = 0, // 0은 생성됨/가상을 의미
                status = LottoTicketStatus.PENDING,
                url = null // 생성된 번호에는 이미지가 없음
            )
        )

        val game = LottoGameEntity(
            userId = request.userId,
            ticketId = ticket.id!!,
            status = LottoGameStatus.PENDING,
            number1 = request.numbers[0],
            number2 = request.numbers[1],
            number3 = request.numbers[2],
            number4 = request.numbers[3],
            number5 = request.numbers[4],
            number6 = request.numbers[5],
            extractionMethod = request.extractionMethod
        )
        
        val savedGame = gameRepository.save(game)
        
        // 게임 저장 후 뱃지 업데이트
        try {
            badgeService.updateUserBadges(request.userId)
        } catch (e: Exception) {
            // 에러 로그를 남기지만 저장 작업은 실패시키지 않음
            logger.error("사용자 ${request.userId}의 뱃지 업데이트 실패", e)
        }
        
        return savedGame
    }
}
