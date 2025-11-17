package com.wallet.clover.repository.lottospot

import com.wallet.clover.domain.lottospot.LottoSpot
import com.wallet.clover.domain.lottospot.LottoSpotRepository
import com.wallet.clover.entity.lottospot.LottoSpotEntity
import org.springframework.stereotype.Component
import kotlin.math.PI
import kotlin.math.atan2
import kotlin.math.cos
import kotlin.math.sin
import kotlin.math.sqrt

@Component
class LottoSpotRdbAdaptor(
    private val lottoSpotJpaRepository: LottoSpotJpaRepository,
) : LottoSpotRepository {

    override fun save(lottoSpot: LottoSpot): LottoSpot {
        val entity = lottoSpot.toEntity()
        val savedEntity = lottoSpotJpaRepository.save(entity)
        return savedEntity.toDomain()
    }

    override fun findById(id: Long): LottoSpot? {
        return lottoSpotJpaRepository.findById(id).map { it.toDomain() }.orElse(null)
    }

    override fun findAll(): List<LottoSpot> {
        return lottoSpotJpaRepository.findAll().map { it.toDomain() }
    }

    override fun findByLocation(latitude: Double, longitude: Double, radiusKm: Double): List<LottoSpot> {
        // A simple approximation for filtering within a square bounding box
        // For more accurate results, consider using database's geospatial features or Haversine formula
        val earthRadiusKm = 6371.0

        // Convert radius from km to degrees for latitude and longitude
        val latDelta = radiusKm / earthRadiusKm * (180.0 / PI)
        val lonDelta = radiusKm / (earthRadiusKm * cos(Math.toRadians(latitude))) * (180.0 / PI)

        val minLat = latitude - latDelta
        val maxLat = latitude + latDelta
        val minLon = longitude - lonDelta
        val maxLon = longitude + lonDelta

        // This is a very basic filter. A real implementation would use a custom query
        // or a more sophisticated geospatial library/database feature.
        return lottoSpotJpaRepository.findAll()
            .filter {
                it.latitude in minLat..maxLat &&
                    it.longitude in minLon..maxLon &&
                    calculateDistance(latitude, longitude, it.latitude, it.longitude) <= radiusKm
            }
            .map { it.toDomain() }
    }

    // Helper function to convert domain to entity
    private fun LottoSpot.toEntity(): LottoSpotEntity {
        return LottoSpotEntity(
            name = this.name,
            address = this.address,
            latitude = this.latitude,
            longitude = this.longitude,
            firstPlaceWins = this.firstPlaceWins,
            secondPlaceWins = this.secondPlaceWins,
        ).apply {
            this.id = this@toEntity.id // Set ID if it's not new
        }
    }

    // Helper function to convert entity to domain
    private fun LottoSpotEntity.toDomain(): LottoSpot {
        return LottoSpot(
            id = this.id,
            name = this.name,
            address = this.address,
            latitude = this.latitude,
            longitude = this.longitude,
            firstPlaceWins = this.firstPlaceWins,
            secondPlaceWins = this.secondPlaceWins,
            lastUpdated = this.updatedAt, // Using updatedAt from BaseEntity
        )
    }

    // Haversine formula to calculate distance between two points on Earth (in km)
    private fun calculateDistance(
        lat1: Double,
        lon1: Double,
        lat2: Double,
        lon2: Double,
    ): Double {
        val earthRadiusKm = 6371.0

        val dLat = Math.toRadians(lat2 - lat1)
        val dLon = Math.toRadians(lon2 - lon1)

        val a = sin(dLat / 2) * sin(dLat / 2) +
            cos(Math.toRadians(lat1)) * cos(Math.toRadians(lat2)) *
            sin(dLon / 2) * sin(dLon / 2)
        val c = 2 * atan2(sqrt(a), sqrt(1 - a))

        return earthRadiusKm * c
    }
}
