package com.wallet.clover.api.service

import com.wallet.clover.api.client.LottoResultParser
import com.wallet.clover.api.client.LottoTicketClient
import com.wallet.clover.api.client.ParsedLottoResult
import com.wallet.clover.api.config.LottoScrapingProperties
import org.springframework.cache.annotation.CacheEvict
import org.springframework.cache.annotation.Cacheable
import org.springframework.stereotype.Component

@Component
class WinningNumberProvider(
    private val lottoTicketClient: LottoTicketClient,
    private val lottoResultParser: LottoResultParser,
    private val properties: LottoScrapingProperties
) {

    @Cacheable("winning-numbers", key = "'latest'")
    suspend fun getLatestWinningNumbers(): ParsedLottoResult {
        val html = lottoTicketClient.getHtmlByUrl(properties.resultUrl)
        return lottoResultParser.parse(html)
    }

    @CacheEvict("winning-numbers", key = "'latest'")
    fun evictLatestWinningNumbersCache() {
        // 어노테이션을 통해 캐시 무효화 수행
    }
}
