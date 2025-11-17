package com.wallet.clover.domain.lottospot

interface LottoSpotRepository {
    fun save(lottoSpot: LottoSpot): LottoSpot
    fun findById(id: Long): LottoSpot?
    fun findAll(): List<LottoSpot>
    fun findByLocation(latitude: Double, longitude: Double, radiusKm: Double): List<LottoSpot>
    // Add other methods as needed, e.g., find by address, find top winning spots
}
