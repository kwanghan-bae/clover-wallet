package com.wallet.clover.api.service

import com.wallet.clover.api.entity.game.LottoGameEntity
import com.wallet.clover.api.repository.game.LottoGameRepository
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.toList
import org.springframework.data.domain.PageRequest
import org.springframework.data.domain.Sort
import org.springframework.stereotype.Service

@Service
class LottoGameService(
    private val gameRepository: LottoGameRepository,
    private val ticketRepository: com.wallet.clover.api.repository.ticket.LottoTicketRepository,
    private val badgeService: BadgeService
) {
    suspend fun getGamesByUserId(userId: Long, page: Int = 0, size: Int = 20): List<LottoGameEntity> {
        val pageable = PageRequest.of(page, size, Sort.by("createdAt").descending())
        return gameRepository.findByUserId(userId, pageable).toList()
    }

    suspend fun saveGame(game: LottoGameEntity): LottoGameEntity {
        val savedGame = gameRepository.save(game)
        
        // Update badges after saving game
        try {
            badgeService.updateUserBadges(game.userId)
        } catch (e: Exception) {
            // Log error but don't fail the save operation
            println("Failed to update badges for user ${game.userId}: ${e.message}")
        }
        
        return savedGame
    }

    suspend fun saveGeneratedGame(request: com.wallet.clover.api.dto.SaveGeneratedGameRequest): LottoGameEntity {
        // Create a "Virtual Ticket" for generated numbers
        // In a real scenario, we might want to link this to a specific round or date.
        // For now, we create a placeholder ticket.
        val ticket = ticketRepository.save(
            com.wallet.clover.api.entity.ticket.LottoTicketEntity(
                userId = request.userId,
                ordinal = 0, // 0 indicates generated/virtual
                status = com.wallet.clover.api.entity.ticket.LottoTicketStatus.PENDING,
                url = "" // No image for generated numbers
            )
        )

        val game = LottoGameEntity(
            userId = request.userId,
            ticketId = ticket.id!!,
            status = com.wallet.clover.api.entity.game.LottoGameStatus.PENDING,
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
            println("Failed to update badges for user ${request.userId}: ${e.message}")
        }
        
        return savedGame
    }
}
