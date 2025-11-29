package com.wallet.clover.api.service

import com.wallet.clover.api.entity.game.LottoGameEntity
import com.wallet.clover.api.repository.game.LottoGameRepository
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.toList
import org.springframework.stereotype.Service

@Service
class LottoGameService(
    private val gameRepository: LottoGameRepository,
) {
    suspend fun getGamesByUserId(userId: Long): List<LottoGameEntity> {
        return gameRepository.findByUserId(userId).toList()
    }

    suspend fun saveGame(game: LottoGameEntity): LottoGameEntity {
        return gameRepository.save(game)
    }
}
