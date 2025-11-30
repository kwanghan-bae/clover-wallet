package com.wallet.clover.api.service

import com.wallet.clover.api.domain.extraction.ExtractionContext
import com.wallet.clover.api.dto.ExtractionRequest
import com.wallet.clover.api.service.LottoNumberExtractor
import org.springframework.stereotype.Service

/**
 * 로또 번호 추출 기능을 제공하는 애플리케이션 서비스입니다.
 * 다양한 미신적 방법론에 따라 로또 번호를 생성합니다.
 */
@Service
class ExtractionService(
    private val lottoNumberExtractor: LottoNumberExtractor,
) {
    /**
     * 지정된 추출 방법에 따라 로또 번호를 생성합니다.
     *
     * @param request 추출 요청 정보 (방법 및 컨텍스트 데이터)
     * @return 생성된 로또 번호 6개 Set
     */
    suspend fun extractLottoNumbers(request: ExtractionRequest): Set<Int> {
        val context = ExtractionContext(
            dreamKeyword = request.dreamKeyword,
            birthDate = request.birthDate,
            personalKeywords = request.personalKeywords,
            natureKeyword = request.natureKeyword,
            divinationKeyword = request.divinationKeyword,
            colorKeyword = request.colorKeyword,
            animalKeyword = request.animalKeyword,
        )
        return lottoNumberExtractor.extract(request.method, context)
    }
}
