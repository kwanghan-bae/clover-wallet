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
) {
    suspend fun getGamesByUserId(userId: Long, page: Int = 0, size: Int = 20): List<LottoGameEntity> {
        val pageable = PageRequest.of(page, size, Sort.by("createdAt").descending())
        return gameRepository.findByUserId(userId, pageable).toList()
    }

    suspend fun saveGame(game: LottoGameEntity): LottoGameEntity {
        return gameRepository.save(game)
    }
}
