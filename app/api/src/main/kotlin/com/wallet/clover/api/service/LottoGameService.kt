package com.wallet.clover.api.service

import com.wallet.clover.api.entity.game.LottoGameEntity
import com.wallet.clover.api.repository.game.LottoGameRepository
import org.springframework.stereotype.Service

@Service
class LottoGameService(
    private val gameRepository: LottoGameRepository,
) {
    suspend fun getGamesByUserId(userId: Long): List<LottoGameEntity> {
        return gameRepository.findByUserId(userId)
    }

    suspend fun saveGame(game: LottoGameEntity): LottoGameEntity {
        return gameRepository.save(game)
    }
}
