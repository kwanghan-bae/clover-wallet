package com.wallet.clover.api.service

import com.wallet.clover.api.common.PageResponse
import com.wallet.clover.api.dto.SaveGeneratedGameRequest
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
        
        // Update badges after saving game
        try {
            badgeService.updateUserBadges(game.userId)
        } catch (e: Exception) {
            // Log error but don't fail the save operation
            logger.error("Failed to update badges for user ${game.userId}", e)
        }
        
        return savedGame
    }

    suspend fun saveGeneratedGame(request: SaveGeneratedGameRequest): LottoGameEntity {
        // Create a "Virtual Ticket" for generated numbers
        // In a real scenario, we might want to link this to a specific round or date.
        // For now, we create a placeholder ticket.
        val ticket = ticketRepository.save(
            LottoTicketEntity(
                userId = request.userId,
                ordinal = 0, // 0 indicates generated/virtual
                status = LottoTicketStatus.PENDING,
                url = "" // No image for generated numbers
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
        
        // Update badges after saving game
        try {
            badgeService.updateUserBadges(request.userId)
        } catch (e: Exception) {
            // Log error but don't fail the save operation
            logger.error("Failed to update badges for user ${request.userId}", e)
        }
        
        return savedGame
    }
}
